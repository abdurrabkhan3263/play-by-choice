"use client";

import React from "react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Loader2Icon, LogOut, Trash2, UserCircle2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { deleteAccount } from "@/lib/action/user.action";
import { useToast } from "@/hooks/use-toast";

function NavBar() {
  const { status, data } = useSession();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDelete, setIsDelete] = React.useState(false);
  const { toast } = useToast();

  const handleDeleteAccount = async () => {
    try {
      setIsDelete(true);
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || window.location.origin;
      const res = await deleteAccount({
        email: data?.user?.email as string,
        baseUrl,
      });
      if (res.status === "Success") {
        toast({
          title: "Success",
          description: "Account deleted successfully",
        });
        signOut();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message ?? "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDelete(false);
      setIsDialogOpen(false);
    }
  };

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
                className="h-10 relative w-10 rounded-full p-0 overflow-hidden"
                variant="ghost"
              >
                {data?.user?.image ? (
                  <Image
                    src={data?.user?.image}
                    layout="fill"
                    className="object-cover"
                    alt={data?.user?.name ?? "User avatar"}
                  />
                ) : (
                  <UserCircle2 className="h-10 w-10" />
                )}
                <span className="sr-only">Open user menu</span>
              </Button>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-[#1e201e] text-white border-gray-700">
            <DropdownMenuLabel className="text-gray-400">
              My Account
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => setIsDialogOpen((prev) => !prev)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Account</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="focus:bg-[#2a2c2a] focus:text-white"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-gray-900 to-[#1e201e] text-white border border-gray-700 shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Trash2 className="w-6 h-6" />
                Delete Account
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Are you sure you want to delete your account? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            {/* Content */}
            <DialogFooter>
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white transition-colors duration-200"
                onClick={handleDeleteAccount}
                disabled={isDelete}
              >
                Delete Account
                {isDelete && <Loader2Icon className="animate-spin ml-4" />}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default NavBar;
