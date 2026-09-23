import { redirect } from "next/navigation";
import { auth } from "@/auth";
import TokenDemo from "@/components/TokenDemo";

export default async function TokenDemoPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  return <TokenDemo />;
}