"use client";

import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

function AuthError() {
  const pathName = useSearchParams();
  const error = Object.fromEntries(pathName).error ?? "";
  const provider = Object.fromEntries(pathName).provider ?? "";
  const { toast } = useToast();
  const { push } = useRouter();

  const redirect = useCallback(
    (path: string) => {
      push(path);
    },
    [push]
  );

  useEffect(() => {
    switch (error) {
      case "error_to_create_account":
        toast({
          title: "Warning",
          description: "Server error. Please try again later.",
          variant: "destructive",
        });
        redirect("/sign-in");
        break;
      case "login-with-other-provider":
        toast({
          title: "Warning",
          description: `You are already registered with ${provider} provider. Please sign in with ${provider} provider.`,
          variant: "destructive",
        });
        redirect("/sign-in");
        break;
      case "invalid-email":
        toast({
          title: "Warning",
          description: `Invalid email. Please try again.`,
          variant: "destructive",
        });
        redirect("/sign-in");
        break;
      case "invalid-password":
        toast({
          title: "Warning",
          description: `Invalid password. Please try again.`,
          variant: "destructive",
        });
        redirect("/sign-in");
        break;
      case "something-went-wrong":
        toast({
          title: "Error",
          description: `Something went wrong. Please try again later.`,
          variant: "destructive",
        });
        redirect("/sign-in");
        break;
      default:
        break;
    }
  }, [error, provider, push, redirect, toast]);

  return null;
}

export default AuthError;
