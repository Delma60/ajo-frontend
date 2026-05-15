import type { AuthUser, Credentials, LoginResponse, AuthEvents, GuardConfig, JwtPayload } from "./auth.types";
import { resolveDriver, ITokenDriver } from "./token-storage";
import { JwtUtils } from "./jwt-utils";
import { HTTPS, HttpError, type HttpClient } from "./http";
import { Role } from "./role";

export class Guard<TUser extends AuthUser = AuthUser> {
    private readonly http: HttpClient;
    private readonly storage: ITokenDriver;
    private readonly cfg: Required<Omit<GuardConfig<TUser>, "http" | "events" | "roleFactory">> & { events: AuthEvents<TUser>; roleFactory: (user: TUser) => Role };
    private _user: TUser | null = null;
    private _fetchUserPromise: Promise<TUser | null> | null = null;
    private _refreshPromise: Promise<string | null> | null = null;
    private _role: Role | null = null;

    constructor(config: GuardConfig<TUser>) {
        this.http = config.http ?? HTTPS;
        this.storage = resolveDriver(config.driver ?? "cookie");
        this.cfg = {
            driver: config.driver ?? "cookie",
            endpoints: config.endpoints,
            tokenKey: config.tokenKey ?? "auth_token",
            refreshTokenKey: config.refreshTokenKey ?? "auth_refresh_token",
            tokenType: config.tokenType ?? "Bearer",
            cookieExpiryDays: config.cookieExpiryDays ?? 7,
            autoRefresh: config.autoRefresh ?? true,
            refreshThresholdSeconds: config.refreshThresholdSeconds ?? 60,
            events: config.events ?? {},
            roleFactory: config.roleFactory ?? Guard._defaultRoleFactory,
        };
    }

    public token(): string | null {
        return this.storage.get(this.cfg.tokenKey);
    }
    public refreshToken(): string | null {
        return this.storage.get(this.cfg.refreshTokenKey);
    }
    public setToken(token: string, expiresIn?: number): this {
        const days = expiresIn ? expiresIn / 86400 : this.cfg.cookieExpiryDays;
        this.storage.set(this.cfg.tokenKey, token, days);
        return this;
    }
    public setRefreshToken(token: string): this {
        this.storage.set(this.cfg.refreshTokenKey, token, this.cfg.cookieExpiryDays * 4);
        return this;
    }
    public clearTokens(): this {
        this.storage.remove(this.cfg.tokenKey);
        this.storage.remove(this.cfg.refreshTokenKey);
        return this;
    }
    public tokenPayload(): JwtPayload | null {
        const t = this.token();
        return t ? JwtUtils.decodeJwt(t) : null;
    }
    public check(): boolean {
        const t = this.token();
        return !!t && !JwtUtils.isTokenExpired(t);
    }
    public guest(): boolean {
        return !this.check();
    }
    public id(): string | number | null {
        return this._user?.id ?? this.tokenPayload()?.sub ?? null;
    }
    public async user(fetch = true): Promise<TUser | null> {
        if (this._user) return this._user;
        if (!this.check()) return null;
        if (!fetch) return null;
        if (!this._fetchUserPromise) {
            this._fetchUserPromise = this._fetchUser().finally(() => {
                this._fetchUserPromise = null;
            });
        }
        return this._fetchUserPromise;
    }
    public async refreshUser(): Promise<TUser | null> {
        this._setUser(null)
        return this.user(true);
    }

    private static _defaultRoleFactory(user: AuthUser): Role {
        const roles = Array.isArray(user.roles)
            ? (user.roles as string[])
            : typeof user.role === "string"
                ? [user.role]
                : [];
        const permissions = Array.isArray(user.permissions)
            ? (user.permissions as string[])
            : [];
        return new Role(roles, permissions);
    }

    private _getRole(): Role {
        if (!this._user) return new Role();
        // Rebuild only when the user instance has changed (e.g. after refreshUser).
        if (!this._role) {
            this._role = this.cfg.roleFactory(this._user);
            this._role._owner = this._user as unknown as import("./user").User;
        }
        return this._role;
    }

    private _setUser(user: TUser | null): void {
        this._user = user;
        this._role = null; // force rebuild on next access
    }

    private async _fetchUser(): Promise<TUser | null> {
        try {
            await this._maybeRefreshToken();
            const t = this.token();
            if (!t) return null;
            const res = await this.http.withToken(t, this.cfg.tokenType).get<TUser>(this.cfg.endpoints.user);
            if (res.data) {
                this._setUser(res.data)
                this.cfg.events.onUserRefreshed?.(res.data);
            }
            return this._user;
        } catch (err) {
            this.cfg.events.onError?.(err);
            return null;
        }
    }
    public async attempt(credentials: Credentials): Promise<boolean> {
        try {
            const res = await this.http.post<LoginResponse>(this.cfg.endpoints.login, credentials);
            console.log({attemp_res: res.data, url: this.cfg.endpoints.login})
            if (!res.data?.token) return false;
            await this._applyLogin(res.data);
            return true;
        } catch (err) {
            this.cfg.events.onError?.(err);
            return false;
        }
    }
    public async attemptOrFail(credentials: Credentials): Promise<TUser> {
        const res = await this.http.post<LoginResponse>(this.cfg.endpoints.login, credentials);
        if (!res.data?.token) {
            throw new HttpError({ ...res, data: null });
        }
        await this._applyLogin(res.data);
        const u = await this.user();
        if (!u) throw new Error("Auth: user could not be resolved after login.");
        return u;
    }
    public async login(token: string, user?: TUser, expiresIn?: number): Promise<void> {
        this.setToken(token, expiresIn);
        if (user) {
            this._setUser(user);
        } else {
            await this._fetchUser();
        }
        const resolvedUser = this._user;
        await this.cfg.events.onLogin?.(resolvedUser as TUser, token);
    }
    public async logout(callServer = true): Promise<void> {
        const previousUser = this._user;
        if (callServer) {
            const t = this.token();
            if (t) {
                await this.http.withToken(t, this.cfg.tokenType).post(this.cfg.endpoints.logout).catch(() => { });
            }
        }
        this.clearTokens();
        this._setUser(null);
        await this.cfg.events.onLogout?.(previousUser);
    }
    public role(): Role {
        return this._getRole();
    }
    public hasRole(role: string | string[]): boolean {
        const required = Array.isArray(role) ? role : [role];
        return this._getRole().is(...required);
    }
    public can(ability: string | string[]): boolean {
        const required = Array.isArray(ability) ? ability : [ability];
        return this._getRole().can(...required);
    }
    public cannot(ability: string | string[]): boolean {
        return !this.can(ability);
    }
    public async refresh(): Promise<string | null> {
        if (!this._refreshPromise) {
            this._refreshPromise = this._doRefresh().finally(() => {
                this._refreshPromise = null;
            });
        }
        return this._refreshPromise;
    }
    private async _doRefresh(): Promise<string | null> {
        if (!this.cfg.endpoints.refresh) return null;
        const refreshToken = this.refreshToken();
        if (!refreshToken) return null;
        try {
            const res = await this.http.post<LoginResponse>(this.cfg.endpoints.refresh, {
                refresh_token: refreshToken,
            });
            if (!res.data?.token) return null;
            this.setToken(res.data.token, res.data.expires_in);
            if (res.data.refresh_token) this.setRefreshToken(res.data.refresh_token);
            this.cfg.events.onTokenRefreshed?.(res.data.token);
            return res.data.token;
        } catch (err) {
            this.cfg.events.onError?.(err);
            return null;
        }
    }
    private async _maybeRefreshToken(): Promise<void> {
        if (!this.cfg.autoRefresh) return;
        if (!this.cfg.endpoints.refresh) return;
        const t = this.token();
        if (!t) return;
        if (JwtUtils.tokenExpiresIn(t) < this.cfg.refreshThresholdSeconds) {
            await this.refresh();
        }
    }
    private async _applyLogin(loginData: LoginResponse): Promise<void> {
        console.log({loginData})
        this.setToken(loginData.token, loginData.expires_in);
        if (loginData.refresh_token) this.setRefreshToken(loginData.refresh_token);
        if (loginData.user) {
            this._setUser(loginData.user as TUser);
        } else {
            await this._fetchUser();
        }
        await this.cfg.events.onLogin?.(this._user as TUser, loginData.token);
    }
}
