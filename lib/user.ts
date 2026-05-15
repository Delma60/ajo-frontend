import { Role } from "./role";

export interface RawUser {
    id: string | number;
    name: string;
    email: string;
    roles?: string[];
    permissions?: string[];
    [key: string]: unknown;
}

export class User<TRaw extends RawUser = RawUser> {
    [key: string]: unknown;
    public readonly role: Role;
    public readonly raw: TRaw;
    constructor(raw: TRaw) {
        this.raw = raw;
        this.role = new Role(raw.roles ?? [], raw.permissions ?? []);
        this.role._owner = this as User;
        return new Proxy(this, {
            get(target, prop, receiver) {
                if (prop in target) return Reflect.get(target, prop, receiver);
                if (prop in raw) return (raw as Record<string, unknown>)[prop as string];
                return undefined;
            },
            has(target, prop) {
                return prop in target || prop in raw;
            },
        });
    }
    get id(): TRaw["id"] { return this.raw.id; }
    get name(): string { return this.raw.name; }
    get email(): string { return this.raw.email; }
    get isAdmin(): boolean { return this.role.isAny("admin", "super-admin"); }
    get isSuperAdmin(): boolean { return this.role.is("super-admin"); }
    toJSON(): TRaw { return this.raw; }
    toString(): string { return `User(${this.id}) <${this.email}> [${this.role}]`; }
}
