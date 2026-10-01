import {
  NextRequest,
  NextResponse,
} from "next/server";

import sql from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";

function validId(id: string) {
  return /^\d+$/.test(id);
}

export async function PATCH(
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
    const auth =
      await requireAuth(request);

    const { id } =
      await params;

    if (!validId(id)) {
      return NextResponse.json(
        {
          error:
            "Invalid address ID",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      await request.json();

    const label =
      String(
        body.label ?? "Home"
      ).trim();

    const recipientName =
      String(
        body.recipientName ?? ""
      ).trim();

    const phone =
      String(
        body.phone ?? ""
      ).trim();

    const addressLine1 =
      String(
        body.addressLine1 ?? ""
      ).trim();

    const addressLine2 =
      String(
        body.addressLine2 ?? ""
      ).trim();

    const city =
      String(
        body.city ?? ""
      ).trim();

    const state =
      String(
        body.state ?? ""
      ).trim();

    const postalCode =
      String(
        body.postalCode ?? ""
      ).trim();

    const country =
      String(
        body.country ?? ""
      ).trim();

    const isDefault =
      Boolean(
        body.isDefault
      );

    if (
      !recipientName ||
      !phone ||
      !addressLine1 ||
      !city ||
      !state ||
      !postalCode ||
      !country
    ) {
      return NextResponse.json(
        {
          error:
            "Please complete all required address fields",
        },
        {
          status: 400,
        }
      );
    }

    const updatedAddress =
      await sql.begin(
        async (transaction) => {

          /*
           * Only remove the previous
           * default if this address is
           * becoming the new default.
           */
          if (isDefault) {
            await transaction`
              UPDATE addresses
              SET
                is_default = FALSE,
                updated_at = NOW()
              WHERE user_id =
                ${auth.userId}
            `;
          }

          const rows =
            await transaction`
              UPDATE addresses
              SET
                label =
                  ${label},

                recipient_name =
                  ${recipientName},

                phone =
                  ${phone},

                address_line1 =
                  ${addressLine1},

                address_line2 =
                  ${addressLine2 || null},

                city =
                  ${city},

                state =
                  ${state},

                postal_code =
                  ${postalCode},

                country =
                  ${country},

                is_default =
                  ${isDefault},

                updated_at =
                  NOW()

              WHERE
                id = ${id}
                AND user_id =
                  ${auth.userId}

              RETURNING *
            `;

          return rows[0];
        }
      );

    if (!updatedAddress) {
      return NextResponse.json(
        {
          error:
            "Address not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,

      address:
        updatedAddress,
    });

  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "UNAUTHORIZED"
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
      "Address PATCH error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to update address",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
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
    const auth =
      await requireAuth(request);

    const { id } =
      await params;

    if (!validId(id)) {
      return NextResponse.json(
        {
          error:
            "Invalid address ID",
        },
        {
          status: 400,
        }
      );
    }

    const deleted =
      await sql.begin(
        async (transaction) => {

          const rows =
            await transaction`
              DELETE FROM addresses

              WHERE
                id = ${id}
                AND user_id =
                  ${auth.userId}

              RETURNING
                id,
                is_default
            `;

          const address =
            rows[0];

          if (!address) {
            return null;
          }

          /*
           * If the deleted address was
           * default, automatically make
           * another address default.
           */
          if (
            address.is_default
          ) {
            const remaining =
              await transaction`
                SELECT id
                FROM addresses

                WHERE user_id =
                  ${auth.userId}

                ORDER BY
                  created_at DESC

                LIMIT 1
              `;

            if (remaining[0]) {
              await transaction`
                UPDATE addresses

                SET
                  is_default =
                    TRUE,
                  updated_at =
                    NOW()

                WHERE
                  id =
                    ${remaining[0].id}
                  AND user_id =
                    ${auth.userId}
              `;
            }
          }

          return address;
        }
      );

    if (!deleted) {
      return NextResponse.json(
        {
          error:
            "Address not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "UNAUTHORIZED"
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
      "Address DELETE error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to delete address",
      },
      {
        status: 500,
      }
    );
  }
}