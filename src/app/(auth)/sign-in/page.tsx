"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SignInButtons from "@/components/SignInButton";
import { redirect } from "next/navigation";
import AuthError from "@/components/AuthError";
import { useSession } from "next-auth/react";

function LoginForm() {
  const { status } = useSession();
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  // const [isSubmitting, setIsSubmitting] = useState(false);
  // const { toast } = useToast();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "authenticated") {
    redirect("/dashboard");
  }

  // const handleFormSubmit = async () => {
  //   setIsSubmitting(true);
  //   if (!email || !password) {
  //     toast({
  //       title: "Warning",
  //       description: "Email and Password is required",
  //       variant: "destructive",
  //     });
  //     return;
  //   }
  //   signIn("credentials", {
  //     email,
  //     password,
  //   });
  // };

  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <Card className="mx-auto w-96 max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <AuthError />
            {/* <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              type="button"
              className="w-full"
              onClick={handleFormSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Log in"}
            </Button> */}
            <div className="flex gap-4">
              <SignInButtons providers="spotify" svg="/logo/spotify.svg" />
              <SignInButtons providers="google" svg="/logo/google.svg" />
            </div>
          </div>
          {/* <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="underline">
              Sign up
            </Link>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginForm;
