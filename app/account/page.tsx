import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Mail, LogOut, ShoppingBag } from "lucide-react";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <main className="min-h-[calc(100vh-105px)] bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            My Account
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your account and shopping activity.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-full bg-gray-100 p-3">
                <User className="h-6 w-6" />
              </div>

              <div>
                <h2 className="font-semibold">Profile</h2>
                <p className="text-sm text-gray-500">
                  Your account information
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">
                  {session.user.name || "User"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />

                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium break-all">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-full bg-gray-100 p-3">
                <ShoppingBag className="h-6 w-6" />
              </div>

              <div>
                <h2 className="font-semibold">Shopping</h2>
                <p className="text-sm text-gray-500">
                  Continue shopping
                </p>
              </div>
            </div>

            <Link
              href="/shop"
              className="inline-flex rounded-xl bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800"
            >
              Continue Shopping
            </Link>

            <Link
              href="/token-demo"
              className="inline-flex rounded-lg border px-5 py-3 text-sm font-medium transition hover:bg-muted"
            >
              Open Token Demo
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <form
            action={async () => {
              "use server";

              await signOut({
                redirectTo: "/",
              });
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl border px-5 py-3 font-medium transition hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}