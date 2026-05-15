import type { AuthUser, Credentials, GuardConfig } from "./auth.types";
import { Guard } from "./guard";
export { Role } from "./role";
export { User } from "./user";
export { withUserClass } from "./withUserClass";

const _guards = new Map<string, Guard<AuthUser>>();
let _defaultGuard = "web";

export const Auth = {
    extend<TUser extends AuthUser = AuthUser>(name: string, config: GuardConfig<TUser>): Guard<TUser> {
        const guard = new Guard<TUser>(config);
        _guards.set(name, guard as unknown as Guard<AuthUser>);
        return guard;
    },
    guard<TUser extends AuthUser = AuthUser>(name: string): Guard<TUser> {
        const g = _guards.get(name);
        if (!g) throw new Error(`Auth: guard "${name}" is not registered. Call Auth.extend() first.`);
        return g as unknown as Guard<TUser>;
    },
    setDefaultGuard(name: string): void {
        _defaultGuard = name;
    },
    check: () => Auth.guard(_defaultGuard).check(),
    guest: () => Auth.guard(_defaultGuard).guest(),
    id:    () => Auth.guard(_defaultGuard).id(),
    token: () => Auth.guard(_defaultGuard).token(),
    user<TUser extends AuthUser = AuthUser>(fetch?: boolean) {
        return Auth.guard<TUser>(_defaultGuard).user(fetch);
    },
    refreshUser<TUser extends AuthUser = AuthUser>() {
        return Auth.guard<TUser>(_defaultGuard).refreshUser();
    },
    attempt:       (credentials: Credentials) => Auth.guard(_defaultGuard).attempt(credentials),
    attemptOrFail: (credentials: Credentials) => Auth.guard(_defaultGuard).attemptOrFail(credentials),
    login<TUser extends AuthUser = AuthUser>(token: string, user?: TUser, expiresIn?: number) {
        return Auth.guard<TUser>(_defaultGuard).login(token, user, expiresIn);
    },
    logout: (callServer?: boolean) => Auth.guard(_defaultGuard).logout(callServer),
    refresh: () => Auth.guard(_defaultGuard).refresh(),
    role: () => Auth.guard(_defaultGuard).role(),
    hasRole: (role: string | string[]) => Auth.guard(_defaultGuard).hasRole(role),
    can:     (ability: string | string[]) => Auth.guard(_defaultGuard).can(ability),
    cannot:  (ability: string | string[]) => Auth.guard(_defaultGuard).cannot(ability),
    fromServer(token: string, expiresIn?: number): void {
        Auth.guard(_defaultGuard).setToken(token, expiresIn);
    },
};
