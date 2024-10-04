"use client";

import { signIn } from "next-auth/react";
import React from "react";
import { Button } from "./ui/button";
import Image from "next/image";

export default function SignInButtons({
  providers,
  svg,
}: {
  providers: "google" | "github";
  svg: string;
}) {
  return (
    <>
      <Button
        variant="outline"
        className="w-full flex-1"
        onClick={() =>
          signIn(providers, {
            redirect: true,
          })
        }
      >
        <Image src={svg} height={20} width={20} alt={providers} />
      </Button>
    </>
  );
}
