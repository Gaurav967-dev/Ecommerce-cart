import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import postgres from "postgres";

import { authConfig } from "./auth.config";

const sql = postgres(process.env.DATABASE_URL!);

async function getUser(email: string) {
  const users = await sql<
    {
      id: number;
      name: string;
      email: string;
      password: string;
    }[]
  >`
    SELECT id, name, email, password
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `;

  return users[0];
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,

  // Session configuration
  session: {
    strategy: "jwt",

    // Session will expire after 30 minutes
    maxAge: 30 * 60,
  },

  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        const user = await getUser(
          email.toLowerCase().trim()
        );

        if (!user) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(
          password,
          user.password
        );

        if (!passwordsMatch) {
          return null;
        }

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
});