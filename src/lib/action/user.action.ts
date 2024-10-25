"use server";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export async function deleteAccount({ email }: { email: string }) {
  const response = await fetch(`${baseUrl}/api/user/${email}`, {
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
