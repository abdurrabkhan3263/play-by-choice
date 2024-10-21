"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { playAgainStream } from "@/lib/action/stream.action";
import { useToast } from "@/hooks/use-toast";

function PlayAgain({
  spaceId,
  playAgain,
}: {
  spaceId: string;
  playAgain: boolean;
}) {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handlePlayAgain = async () => {
    setSubmitting(true);
    try {
      await playAgainStream({ spaceId: spaceId, allPlayed: playAgain });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to play again",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="fixed bottom-0 xl:px-16 py-4 flex justify-center items-center right-1/2 translate-x-1/2 translate-y-0 h-fit w-full bg-gray-800">
      <Button onClick={handlePlayAgain} disabled={submitting}>
        Play {playAgain && "again"}
      </Button>
    </div>
  );
}

export default PlayAgain;
