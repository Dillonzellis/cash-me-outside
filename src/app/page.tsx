import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { syncUser } from "@/db/sync-user";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    syncUser();
    redirect("/dashboard");
  }

  return (
    <div>
      <h1>Welcome to EveryDollar Clone</h1>
      <SignIn />
    </div>
  );
}
