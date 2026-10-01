import { NextRequest, NextResponse } from "next/server";

import sql from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";

export async function GET(request: NextRequest) {
    try {
        const auth = await requireAuth(request);

        const addresses = await sql`
            SELECT id, label, recipient_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default, created_at FROM addresses
            WHERE user_id = ${auth.userId}
            ORDER BY is_default DESC, created_at DESC
        `;

        return NextResponse.json({
            addresses,
        });

    } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json(
                {
                    error: "Please login",
                },
                { status: 401 }
            );
        }

        console.error("Addresses GET error:", error);

        return NextResponse.json(
            {
                error: "Unable to load addresses",
            },
            { status: 500}
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const auth = await requireAuth(request);
        const body = await request.json();

        const label = String(body.label ?? "Home").trim();

        const recipientName = String(body.recipientName ?? "").trim();

        const phone = String(body.phone ?? "").trim();

        const addressLine1 = String(body.addressLine1 ?? "").trim();

        const addressLine2 = String(body.addressLine2 ?? "").trim();

        const city = String(body.city ?? "").trim();

        const state = String(body.state ?? "").trim();

        const postalCode = String(body.postalCode ?? "").trim();

        const country = String(body.country ?? "").trim();

        const isDefault = Boolean(body.isDefault);

        if(!recipientName || !phone || !addressLine1 || !city || !state || !postalCode || !country) {
            return NextResponse.json(
                {
                    error: "Please complete all required address fields",
                },
                { status: 400 }
            );
        }

        const address =
            await sql.begin(
              async (transaction) => {

                if (isDefault) {
                  await transaction`
                    UPDATE addresses
                
                    SET
                      is_default = FALSE,
                      updated_at = NOW()
                
                    WHERE
                      user_id =
                        ${auth.userId}
                  `;
                }
            
                const rows =
                  await transaction`
                    INSERT INTO addresses (
                      user_id,
                      label,
                      recipient_name,
                      phone,
                      address_line1,
                      address_line2,
                      city,
                      state,
                      postal_code,
                      country,
                      is_default
                    )
            
                    VALUES (
                      ${auth.userId},
                      ${label},
                      ${recipientName},
                      ${phone},
                      ${addressLine1},
                      ${addressLine2 || null},
                      ${city},
                      ${state},
                      ${postalCode},
                      ${country},
                      ${isDefault}
                    )
            
                    RETURNING *
                  `;
            
                return rows[0];
              }
            );

        return NextResponse.json(
            {
                success: true,
                address,
            },
            {
                status: 201,
            }
        );

    } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json(
                {
                    error: "Please login",
                },
                { status: 401 }
            );
        }

        console.error("Address POST error:", error);

        return NextResponse.json(
            {
                error: "Unable to save address",
            },
            { status: 500 }
        );
    }
}