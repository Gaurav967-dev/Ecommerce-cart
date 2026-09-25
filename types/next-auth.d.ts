import "next-auth";

declare module "next-auth" {
    interface Session {
        authProvider?: string;
        accessTokenExpiresAt?: number;
        tokenRefreshedAt?: number;
        hasRefreshToken?: boolean;
        error?: "RefreshTokenError";
    }
}