"use client";

import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

function AuthError() {
  const pathName = useSearchParams();
  const error = Object.fromEntries(pathName).error ?? "";
  const provider = Object.fromEntries(pathName).provider ?? "";
  const { toast } = useToast();

  useEffect(() => {
    switch (error) {
      case "error_to_create_account":
        toast({
          title: "Warning",
          description: "Server error. Please try again later.",
          variant: "destructive",
        });
        break;
      case "login-with-other-provider":
        toast({
          title: "Warning",
          description: `You are already registered with ${provider} provider. Please sign in with ${provider} provider.`,
          variant: "destructive",
        });
        break;
      case "invalid-email":
        toast({
          title: "Warning",
          description: `Invalid email. Please try again.`,
          variant: "destructive",
        });
        break;
      case "invalid-password":
        toast({
          title: "Warning",
          description: `Invalid password. Please try again.`,
          variant: "destructive",
        });
        break;
      case "something-went-wrong":
        toast({
          title: "Error",
          description: `Something went wrong. Please try again later.`,
          variant: "destructive",
        });
        break;
      default:
        break;
    }
  }, [error, provider, toast]);

  return null;
}

export default AuthError;
