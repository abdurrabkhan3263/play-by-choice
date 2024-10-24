"use server";
export async function deleteAccount({
  email,
  baseUrl,
}: {
  email: string;
  baseUrl: string;
}) {
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
