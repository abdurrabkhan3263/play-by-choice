"use client";

import React from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

function CreateSpaceButton() {
  const router = useRouter();

  return (
    <Button
      variant={"addBtn"}
      className="cursor-pointer"
      onClick={() => router.push("/dashboard/create-space")}
      type="button"
    >
      <p className="font-medium">Create New Stream</p>
    </Button>
  );
}

export default CreateSpaceButton;
