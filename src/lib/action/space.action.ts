"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { CreateStreamType } from "@/types";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function createSpace({
  data,
  stream,
}: {
  data: { spaceName: string };
  stream: CreateStreamType[];
}) {
  try {
    const currentUser = await getServerSession(authOptions);
    const host = headers().get("host");
    const protocol = process?.env.NODE_ENV === "development" ? "http" : "https";
    const addStream = await fetch(`${protocol}://${host}/api/space`, {
      method: "POST",
      body: JSON.stringify({
        spaceName: data.spaceName,
        streams: stream,
        email: currentUser?.user?.email,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const res = await addStream.json();
    if (addStream.status >= 400) {
      throw new Error(res.message);
    }
    revalidatePath("/dashboard");
    return res;
  } catch (error) {
    console.log("Error is:- ", error);
  }
}

export async function getAllSpace() {
  try {
    const currentUser = await getServerSession(authOptions);
    const host = headers().get("host");
    const protocol = process?.env.NODE_ENV === "development" ? "http" : "https";
    const res = await fetch(
      `${protocol}://${host}/api/get-all-spaces/${encodeURIComponent(
        currentUser?.user?.email as string
      )}`,
      {
        method: "GET",
      }
    );
    return res;
  } catch (error) {
    console.log("Error is:- ", error);
  }
}

export async function deleteSpaceApi({ id }: { id: string }) {
  try {
    const host = headers().get("host");
    const protocol = process?.env.NODE_ENV === "development" ? "http" : "https";
    const res = await fetch(`${protocol}://${host}/api/space/more/${id}`, {
      method: "DELETE",
    });
    if (res.statusText !== "OK") {
      return {
        status: "Error",
        message: "Something went wrong while deleting space",
      };
    }
    revalidatePath("/dashboard");
    return {
      status: "Success",
      message: "Space is deleted successfully",
    };
  } catch (error) {
    console.log("Error is:- ", error);
  }
}

export async function getSpaceById({ id }: { id: string }) {
  try {
    const host = headers().get("host");
    const protocol = process?.env.NODE_ENV === "development" ? "http" : "https";
    const res = await fetch(`${protocol}://${host}/api/space/more/${id}`, {
      method: "GET",
    });
    if (res.statusText !== "OK") {
      return {
        status: "Error",
        message: "Something went wrong while fetching space",
      };
    }
    const data = await res.json();

    if (!data.data) {
      return {
        status: "Error",
        message: "Something went wrong while fetching space",
      };
    }
    return data.data;
  } catch (error) {
    console.log("Error is:- ", error);
  }
}

export async function updateSpaceName({
  spaceId,
  spaceName,
}: {
  spaceId: string;
  spaceName: string;
}) {
  try {
    const host = headers().get("host");
    const protocol = process?.env.NODE_ENV === "development" ? "http" : "https";
    const res = await fetch(`${protocol}://${host}/api/space/more/${spaceId}`, {
      method: "PATCH",
      body: JSON.stringify({
        spaceName,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.statusText !== "OK") {
      return {
        status: "Error",
        message: "Something went wrong while updating space name",
      };
    }
    revalidatePath(`/dashboard/stream/${spaceId}`);
    return {
      status: "Success",
      message: "Space name updated successfully",
    };
  } catch (error) {
    console.log("Error is:- ", error);
  }
}
