"use client";

import React from "react";
import { Button } from "./ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { cn } from "@/lib/utils";

function NavBar() {
  const { status } = useSession();

  return (
    <div className="flex justify-between items-center px-6 lg:px-8 xl:px-16 py-5">
      <Image src={"/logo/music.svg"} height={38} width={38} alt="logo" />
      <div className={cn(status === "loading" && "hidden")}>
        {status === "authenticated" ? (
          <Button variant={"secondary"} onClick={() => signOut()}>
            Sign-Out
          </Button>
        ) : (
          <Button variant={"outline"} onClick={() => signIn()}>
            Sign-In
          </Button>
        )}
      </div>
    </div>
  );
}

export default NavBar;
