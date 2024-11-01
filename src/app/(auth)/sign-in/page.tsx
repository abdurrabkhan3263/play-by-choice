import { Metadata } from "next";
import Login from "@/components/Login";
import { getServerSession } from "next-auth";

export const metadata: Metadata = {
  title: "Login",
  description: "Login",
};

async function LoginForm() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#1e201e]">
      <Login />
    </div>
  );
}

export default LoginForm;
