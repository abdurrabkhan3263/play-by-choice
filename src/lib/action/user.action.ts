"use server";
import { headers } from "next/headers";

export async function deleteAccount({ email }: { email: string }) {
  const host = headers().get("host");
  const protocol = process?.env.NODE_ENV === "development" ? "http" : "https";
  const response = await fetch(`${protocol}://${host}/api/user/${email}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (response.ok) {
    return { status: "Success" };
  } else {
    throw new Error(await response.text());
  }
}
