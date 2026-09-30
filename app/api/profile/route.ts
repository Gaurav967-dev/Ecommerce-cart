import { NextRequest, NextResponse } from "next/server";

import sql from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";

export async function GET(request: NextRequest) {
    try {
        const auth = await requireAuth(request);

        const users = await sql`
            SELECT id, name, email, phone, created_at FROM users
            WHERE id = ${auth.userId} LIMIT 1
        `;

        const user = users[0];

        if (!user) {
            return NextResponse.json(
                {
                    error: "User not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            user: {
                id: String(user.id),
                name: user.name,
                email: user.email,
                phone: user.phone ?? "",
                createdAt: user.created_at,
            },
        });
    } catch (error) {
        if (
            error instanceof Error && error.message === "UNAUTHORIZED"
        ) {
            return NextResponse.json(
                {
                    error: "Please login",
                },
                { status: 401 }
            );
        }

        console.error("Profile GET error:", error);

        return NextResponse.json(
            {
                error: "Unable to load profile",
            },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const auth = await requireAuth(request);

        const body = await request.json();

        const name = String(body.name ?? "").trim();

        const phone = String(body.phone ?? "").trim();

        if (!name) {
            return NextResponse.json(
                {
                    error: "Name is required",
                },
                { status: 400 }
            );
        }

        if (name.length > 100) {
            return NextResponse.json(
                {
                    error: "Name is too long",
                },
                { status: 400 }
            );
        }

        if (phone && phone.length > 20) {
            return NextResponse.json(
                {
                    error: "Invalid phone number",
                },
                { status: 400 }
            );
        }

        const users = await sql`
            UPDATE users SET name = ${name}, phone = ${phone || null}
            WHERE id = ${auth.userId}
            RETURNING id, name, email, phone, created_at
        `;

        const user = users[0];

        if (!user) {
            return NextResponse.json(
                {
                    error: "User not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            
            user: {
                id: String(user.id),
                name: user.name,
                email: user.email,
                phone: user.phone ?? "",
                createdAt: user.created_at,
            },
        });
    } catch (error) {
        if (
            error instanceof Error && error.message === "UNAUTHORIZED"
        ) {
            return NextResponse.json(
                {
                    error: "Please login",
                },
                { status: 401 }
            );
        }
        
        console.error("Profile PATCH error:", error);

        return NextResponse.json(
            {
                error: "Unable to update profile",
            },
            { status: 500 }
        );
    }
}