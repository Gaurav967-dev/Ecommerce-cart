import {
  NextRequest,
  NextResponse,
} from "next/server";

const PYTHON_API_URL =
  process.env.PYTHON_API_URL ??
  "http://127.0.0.1:8000";

export async function GET(
  request: NextRequest
) {
  const authorization =
    request.headers.get(
      "authorization"
    );

  if (
    !authorization ||
    !authorization
      .toLowerCase()
      .startsWith("bearer ")
  ) {
    return NextResponse.json(
      {
        error:
          "Bearer access token missing",
      },
      {
        status: 401,
      }
    );
  }

  try {
    /*
     * BACKEND -> BACKEND
     *
     * Next.js server calls
     * Python FastAPI.
     */
    const response =
      await fetch(
        `${PYTHON_API_URL}/auth/me`,
        {
          method: "GET",

          headers: {
            Authorization:
              authorization,
          },

          cache: "no-store",
        }
      );

    const data =
      await response.json();

    return NextResponse.json(
      data,
      {
        status:
          response.status,
      }
    );
  } catch (error) {
    console.error(
      "Python backend error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to reach Python backend",
      },
      {
        status: 502,
      }
    );
  }
}