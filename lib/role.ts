// Role class for role/permission logic
export type GateCallback<TUser extends User = User> = (
    user: TUser,
    ...args: unknown[]
) => boolean | Promise<boolean>;

export class Role {
    private static _hierarchy: string[] = [
        "guest",
        "viewer",
        "user",
        "moderator",
        "manager",
        "admin",
        "super-admin",
    ];
    private static _gates = new Map<string, GateCallback<User>>();
    private readonly _roles: string[];
    private readonly _permissions: Set<string>;
    _owner: User | null = null;

    constructor(roles: string | string[] = [], permissions: string[] = []) {
        this._roles = Array.isArray(roles) ? [...roles] : [roles];
        this._permissions = new Set(permissions);
    }
    static setHierarchy(hierarchy: string[]): void {
        Role._hierarchy = hierarchy;
    }
    static getHierarchy(): string[] {
        return [...Role._hierarchy];
    }
    static gate<TUser extends User = User>(name: string, callback: GateCallback<TUser>): void {
        Role._gates.set(name, callback as GateCallback<User>);
    }
    is(...roles: string[]): boolean {
        return roles.every((r) => this._roles.includes(r));
    }
    isAny(...roles: string[]): boolean {
        return roles.some((r) => this._roles.includes(r));
    }
    isNot(...roles: string[]): boolean {
        return !this.isAny(...roles);
    }
    level(): number {
        return Math.max(-1, ...this._roles.map((r) => Role._hierarchy.indexOf(r)));
    }
    levelOf(role: string): number {
        return Role._hierarchy.indexOf(role);
    }
    isHigherThan(role: string): boolean {
        return this.level() > this.levelOf(role);
    }
    isAtLeast(role: string): boolean {
        return this.level() >= this.levelOf(role);
    }
    isLowerThan(role: string): boolean {
        return this.level() < this.levelOf(role);
    }
    isAtMost(role: string): boolean {
        return this.level() <= this.levelOf(role);
    }
    can(...abilities: string[]): boolean {
        return abilities.every((ability) => this._matchesPermission(ability));
    }
    cannot(...abilities: string[]): boolean {
        return !this.can(...abilities);
    }
    canAny(...abilities: string[]): boolean {
        return abilities.some((ability) => this._matchesPermission(ability));
    }
    async allows(gate: string, ...args: unknown[]): Promise<boolean> {
        const cb = Role._gates.get(gate);
        if (!cb) throw new Error(`Role: gate "${gate}" is not defined. Call Role.gate() first.`);
        const user = this._owner;
        if (!user) throw new Error("Role: no owner User attached. Access gates via user.role.allows().");
        return cb(user, ...args);
    }
    async denies(gate: string, ...args: unknown[]): Promise<boolean> {
        return !(await this.allows(gate, ...args));
    }
    all(): string[] {
        return [...this._roles];
    }
    permissions(): string[] {
        return [...this._permissions];
    }
    isEmpty(): boolean {
        return this._roles.length === 0;
    }
    toString(): string {
        return this._roles.join(", ") || "none";
    }
    toJSON() {
        return { roles: this.all(), permissions: this.permissions() };
    }
    private _matchesPermission(ability: string): boolean {
        if (this._permissions.has("*")) return true;
        if (this._permissions.has(ability)) return true;
        const [reqNs, reqAction] = ability.split(":");
        for (const perm of this._permissions) {
            const [ns, action] = perm.split(":");
            if (ns === reqNs && (action === "*" || action === reqAction)) return true;
            if (ns === "*") return true;
        }
        return false;
    }
}
