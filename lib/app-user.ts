import type { AuthUser } from "./types/auth.types";

export interface AppUser extends AuthUser {
    id: number;
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
    avatar?: string;
}
