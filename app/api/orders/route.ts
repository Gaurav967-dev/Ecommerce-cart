import { NextRequest, NextResponse } from "next/server";

import sql from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";

export async function GET(request: NextRequest) {
    try {
        const auth = await requireAuth(request);

        const orders = await sql`
            SELECT o.id, o.order_number, o.total_amount, o.subtotal, o.discount_amount, o.shipping_fee, o.tax_amount, o.status, o.payment_method, o.payment_status, o.created_at, COUNT(oi.id)::INTEGER AS item_count FROM ORDERS o
            LEFT JOIN order_items oi ON oi.order_id = o.id
            WHERE o.user_id = ${auth.userId} GROUP BY o.id ORDER BY o.created_at DESC
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