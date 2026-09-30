import { NextRequest, NextResponse } from "next/server";

import sql from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";


export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const auth = await requireAuth(request);


    const { id } = await params;


    // Avoid passing arbitrary text to a BIGINT / INTEGER column.
    if (!/^\d+$/.test(id)) {
      return NextResponse.json(
        {
          error: "Invalid order ID",
        },
        {
          status: 400,
        }
      );
    }


    // CRITICAL: user_id must be checked here. This prevents User A from requesting User B's order.
    const orders = await sql`
      SELECT
        id,
        order_number,
        subtotal,
        discount_amount,
        shipping_fee,
        tax_amount,
        total_amount,

        status,

        payment_method,
        payment_status,

        shipping_name,
        shipping_phone,
        shipping_address_line1,
        shipping_address_line2,
        shipping_city,
        shipping_state,
        shipping_postal_code,
        shipping_country,

        created_at,
        updated_at

      FROM orders

      WHERE
        id = ${id}
        AND user_id = ${auth.userId}

      LIMIT 1
    `;


    const order =
      orders[0];


    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found",
        },
        {
          status: 404,
        }
      );
    }


    const items = await sql`
      SELECT
        id,
        product_id,
        product_name,
        product_image,
        quantity,
        unit_price

      FROM order_items

      WHERE order_id = ${id}

      ORDER BY id
    `;


    return NextResponse.json({
      order: {
        id: String(order.id),

        orderNumber:
          order.order_number,

        subtotal:
          order.subtotal,

        discountAmount:
          order.discount_amount,

        shippingFee:
          order.shipping_fee,

        taxAmount:
          order.tax_amount,

        totalAmount:
          order.total_amount,

        status:
          order.status,

        paymentMethod:
          order.payment_method,

        paymentStatus:
          order.payment_status,

        createdAt:
          order.created_at,

        updatedAt:
          order.updated_at,

        shippingAddress: {
          name:
            order.shipping_name,

          phone:
            order.shipping_phone,

          addressLine1:
            order.shipping_address_line1,

          addressLine2:
            order.shipping_address_line2,

          city:
            order.shipping_city,

          state:
            order.shipping_state,

          postalCode:
            order.shipping_postal_code,

          country:
            order.shipping_country,
        },

        items: items.map(
          (item) => ({
            id:
              String(item.id),

            productId:
              item.product_id
                ? String(
                    item.product_id
                  )
                : null,

            productName:
              item.product_name,

            productImage:
              item.product_image,

            quantity:
              Number(
                item.quantity
              ),

            unitPrice:
              item.unit_price,
          })
        ),
      },
    });

  } catch (error) {

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          error: "Please login",
        },
        {
          status: 401,
        }
      );
    }


    console.error(
      "Order detail error:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Unable to load order",
      },
      {
        status: 500,
      }
    );
  }
}