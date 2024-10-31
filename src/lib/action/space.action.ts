"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { CreateStreamType } from "@/types";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export async function createSpace({
  data,
  stream,
}: {
  data: { spaceName: string };
  stream: CreateStreamType[];
}) {
  try {
    const currentUser = await getServerSession(authOptions);

    if (!currentUser?.user?.email) {
      throw new Error("User not authenticated");
    }
    const addStream = await fetch(`${baseUrl}/api/space`, {
      method: "POST",
      body: JSON.stringify({
        spaceName: data.spaceName,
        streams: stream,
        email: currentUser?.user?.email,
        type: currentUser?.user?.provider === "google" ? "youtube" : "spotify",
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
    console.error("Error while creating space", error);
    throw new Error(
      error instanceof Error
        ? error.message || "Something went wrong while creating space"
        : String(error) || "Something went wrong while creating space"
    );
  }
}

export async function getAllSpace() {
  try {
    const currentUser = await getServerSession(authOptions);
    if (!currentUser?.user?.email) {
      throw new Error("User not authenticated");
    }
    const res = await fetch(
      `${baseUrl}/api/get-all-spaces/${encodeURIComponent(
        currentUser?.user?.email as string
      )}`,
      {
        method: "GET",
      }
    );
    return res;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message || "Something went wrong while getting the space"
        : String(error) || "Something went wrong while getting the space"
    );
  }
}

export async function deleteSpaceApi({ id }: { id: string }) {
  try {
    const res = await fetch(`${baseUrl}/api/space/more/${id}`, {
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
    throw new Error(
      error instanceof Error
        ? error.message || "Something went wrong while deleting space"
        : String(error) || "Something went wrong while deleting space"
    );
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
    const res = await fetch(`${baseUrl}/api/space/more/${spaceId}`, {
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
    revalidatePath(`/dashboard/space/${spaceId}`);
    return {
      status: "Success",
      message: "Space name updated successfully",
    };
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message || "Something went wrong while updating space name"
        : String(error) || "Something went wrong while updating space name"
    );
  }
}

export async function getSpaceById({ id }: { id: string }) {
  try {
    const res = await fetch(`${baseUrl}/api/space/more/${id}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        status: "Error",
        message: "Space not found",
      };
    }
    const jsonRes = await res.json();

    if (jsonRes?.status !== "Success") {
      return {
        status: "Error",
        message: jsonRes?.message ?? "Space not found",
      };
    }

    return jsonRes?.data;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message || "Something went wrong while getting space"
        : String(error) || "Something went wrong while getting space"
    );
  }
}
