"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import { z } from "zod";

const sql = postgres(process.env.DATABASE_URL!);

const SignUpSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters."),
  email: z
    .string()
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters."),
});

export async function registerUser(
  prevState: string | undefined,
  formData: FormData
) {
  const validatedFields = SignUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return validatedFields.error.issues[0]?.message || "Invalid details.";
  }

  const { name, email, password } = validatedFields.data;

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const existingUser = await sql`
      SELECT id
      FROM users
      WHERE email = ${normalizedEmail}
      LIMIT 1
    `;

    if (existingUser.length > 0) {
      return "An account with this email already exists.";
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await sql`
      INSERT INTO users (name, email, password)
      VALUES (
        ${name.trim()},
        ${normalizedEmail},
        ${hashedPassword}
      )
    `;

    await signIn("credentials", {
      email: normalizedEmail,
      password,
      redirectTo: "/account",
    });

    return undefined;
  } catch (error) {
    if (error instanceof AuthError) {
      return "Account created, but automatic sign in failed.";
    }

    console.error("Registration error:", error);
    return "Something went wrong. Please try again.";
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/account",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid email or password.";
        default:
          return "Something went wrong.";
      }
    }

    throw error;
  }

  return undefined;
}