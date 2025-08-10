"use client";
import { SignIn, useUser } from "@clerk/nextjs";

export default function Page() {
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    return <SignIn />;
  }

  return (
    <div>
      {/* <SignIn /> */}
      {/* <SignInButton> */}
      {/*   <button>Custom sign in button</button> */}
      {/* </SignInButton> */}
      <div>Welcome!</div>
    </div>
  );
}
