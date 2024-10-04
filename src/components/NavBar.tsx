"use client";

import React from "react";
import { Button } from "./ui/button";
import { signIn, signOut, useSession } from "next-auth/react";

function NavBar() {
  const { data, status } = useSession();

  if (status === "loading") return "Loading.....";

  console.log(data);

  return (
    <div>
      <p>Nav Bar</p>
      <div>
        {status === "authenticated" ? (
          <Button onClick={() => signOut()}>Sign-Out</Button>
        ) : (
          <Button onClick={() => signIn()}>Sign-In</Button>
        )}
      </div>
    </div>
  );
}

export default NavBar;
