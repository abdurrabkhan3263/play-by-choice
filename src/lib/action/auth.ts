"use server";

import { redirect } from "next/navigation";

export async function signInWithGoogle() {
  await redirect("/api/auth/google");
}
