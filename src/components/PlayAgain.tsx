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
      await playAgainStream({
        spaceId: spaceId,
        allPlayed: playAgain,
      });
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
    <div
      className="music_player"
      style={{ display: "flex", justifyContent: "center" }}
    >
      <Button onClick={handlePlayAgain} disabled={submitting}>
        Play {playAgain && "again"}
      </Button>
    </div>
  );
}

export default PlayAgain;
