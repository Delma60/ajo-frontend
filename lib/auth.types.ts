// Types and interfaces for authentication

import { HttpClient } from "./http";
import { Role } from "./role";

export interface AuthUser {
    id: string | number;
    [key: string]: unknown;
}

export interface Credentials {
    email: string;
    password: string;
    remember?: boolean;
    [key: string]: unknown;
}

export interface LoginResponse {
    token: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
    user?: AuthUser;
}

export interface AuthEvents<TUser extends AuthUser = AuthUser> {
    onLogin?: (user: TUser, token: string) => void | Promise<void>;
    onLogout?: (user: TUser | null) => void | Promise<void>;
    onUserRefreshed?: (user: TUser) => void;
    onTokenRefreshed?: (token: string) => void;
    onError?: (error: unknown) => void;
}

export interface GuardEndpoints {
    login: string;
    logout: string;
    user: string;
    refresh?: string;
}

export type StorageDriver = "cookie" | "localStorage" | "memory";

export interface GuardConfig<TUser extends AuthUser = AuthUser> {
    http?: HttpClient;
    driver?: StorageDriver;
    endpoints: GuardEndpoints;
    tokenKey?: string;
    refreshTokenKey?: string;
    tokenType?: string;
    cookieExpiryDays?: number;
    autoRefresh?: boolean;
    refreshThresholdSeconds?: number;
    events?: AuthEvents<TUser>;
    roleFactory?: (user: TUser) => Role
}

export interface JwtPayload {
    exp?: number;
    iat?: number;
    sub?: string | number;
    [key: string]: unknown;
}
