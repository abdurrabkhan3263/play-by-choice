"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import SignInButtons from "@/components/SignInButton";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { CreateUser } from "@/lib/zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

function SignUpForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { handleSubmit, register } = useForm<z.infer<typeof CreateUser>>({
    resolver: zodResolver(CreateUser),
  });

  const { status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "authenticated") {
    redirect("/dashboard");
  }

  const formSubmit = async (data: z.infer<typeof CreateUser>) => {
    const result = CreateUser.safeParse(data);

    setIsSubmitting(true);

    if (!result.success) {
      const errorMessage = result.error.errors
        .map(({ message }) => message)
        .join(", ");

      return toast({
        title: "Warning",
        description: errorMessage,
        variant: "destructive",
      });
    }

    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...result.data,
          provider: "Credential",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: data.status ?? "Success",
          description: data.message ?? "User created successfully",
        });
        router.push("/sign-in");
      } else {
        toast({
          title: data.status ?? "Error",
          description: data.message ?? "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      return toast({
        title: "Error",
        description: `Something went wrong. ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <Card className="mx-auto w-96 max-w-lg">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <form onSubmit={handleSubmit(formSubmit)}>
              <div className="grid gap-4">
                <div className="grid gap-2 col-span-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input
                    id="first-name"
                    placeholder="Max"
                    required
                    {...register("name")}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  {...register("email")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  required
                  {...register("password")}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>
            <div className="flex gap-8">
              <SignInButtons providers="google" svg="/logo/google.svg" />
              <SignInButtons providers="github" svg="/logo/github.svg" />
            </div>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/sign-in" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SignUpForm;
