import { NextRequest, NextResponse } from "next/server";

import sql from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";

export async function GET(request: NextRequest) {
    try {
        const auth = await requireAuth(request);

        const orders = await sql`
            SELECT id, total_amount, status, created_at FROM ORDERS
            WHERE user_id = ${auth.userId} ORDER BY created_at DESC
        `;

        return NextResponse.json({ orders });
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

        console.error("Orders error:", error);

        return NextResponse.json(
            {
                error: "Unable to load orders",
            },
            { status: 500 }
        );
    }
}