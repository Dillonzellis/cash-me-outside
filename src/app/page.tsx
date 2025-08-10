"use client";

import { SignIn, SignInButton, useUser } from "@clerk/nextjs";

export default function Home() {
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    return <SignIn />;
  }

  return (
    <div className="">
      <main className="">Youre In</main>
    </div>
  );
}
