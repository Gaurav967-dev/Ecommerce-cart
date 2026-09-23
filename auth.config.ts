import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/signin",
    },

    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnAccountPage = nextUrl.pathname.startsWith("/account");

            const isAuthPage = nextUrl.pathname.startsWith("/signin") || nextUrl.pathname.startsWith("/signup");
            
            if (isOnAccountPage) {
                return isLoggedIn;
            }

            if (isAuthPage && isLoggedIn) {
                return Response.redirect(
                    new URL("/account", nextUrl)
                );
            }

            return true;
        },
    },

    providers: [],
} satisfies NextAuthConfig;