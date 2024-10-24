"use client";

import React from "react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { LogOut } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";

function NavBar() {
  const { status, data } = useSession();

  return (
    <div className="flex justify-between items-center px-6 lg:px-8 xl:px-16 h-24">
      <Link href="/dashboard">
        <Image src={"/logo/music.svg"} height={38} width={38} alt="logo" />
      </Link>
      <div className={cn(status === "loading" && "hidden")}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {status === "authenticated" && (
              <Button
                className="h-14 w-14 rounded-full p-0 overflow-hidden"
                variant="ghost"
              >
                <Image
                  src={data?.user?.image ?? "/logo/user.svg"}
                  width={56}
                  height={56}
                  className="object-cover"
                  alt={data?.user?.name ?? "User avatar"}
                />
                <span className="sr-only">Open user menu</span>
              </Button>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-[#1e201e] text-white border-gray-700">
            <DropdownMenuLabel className="text-gray-400">
              My Account
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => signOut()}
              className="focus:bg-[#2a2c2a] focus:text-white"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default NavBar;
