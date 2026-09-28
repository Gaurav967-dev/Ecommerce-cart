"use server";

import postgres from "postgres";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";

const sql = postgres(process.env.DATABASE_URL!);

const RegisterSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters"),

  email: z
    .string()
    .email("Invalid email"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export type RegisterResult = {
  success: boolean;
  error?: string;
  field?: "name" | "email" | "password";
};

export async function registerUser(
  formData: FormData
): Promise<RegisterResult> {
  const validated = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    const issue =
      validated.error.issues[0];

    const field =
      issue?.path?.[0];

    return {
      success: false,
      error:
        issue?.message ??
        "Invalid input",

      field:
        field === "name" ||
        field === "email" ||
        field === "password"
          ? field
          : undefined,
    };
  }

  const {
    name,
    email,
    password,
  } = validated.data;

  const normalizedEmail =
    email.toLowerCase().trim();

  const trimmedName =
    name.trim();

  try {
    const existingUsers = await sql`
      SELECT id
      FROM users
      WHERE email = ${normalizedEmail}
      LIMIT 1
    `;

    if (existingUsers.length > 0) {
      return {
        success: false,
        error:
          "An account with this email already exists.",
        field: "email",
      };
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    await sql`
      INSERT INTO users (
        name,
        email,
        password
      )
      VALUES (
        ${trimmedName},
        ${normalizedEmail},
        ${hashedPassword}
      )
    `;
  } catch (error: any) {
    console.error(
      "Registration error:",
      error
    );

    if (error?.code === "23505") {
      return {
        success: false,
        error:
          "An account with this email already exists.",
        field: "email",
      };
    }

    return {
      success: false,
      error:
        "Failed to create account. Please try again.",
    };
  }

  redirect(
    "/signin?registered=true"
  );
}