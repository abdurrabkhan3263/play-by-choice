"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { playAgainStream } from "@/lib/action/stream.action";
import { useToast } from "@/hooks/use-toast";
import { Loader, Loader2 } from "lucide-react";

function PlayAgain({
  spaceId,
  playAgain,
  role,
}: {
  spaceId: string;
  playAgain: boolean;
  role: "OWNER" | "MEMBER";
}) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePlayAgain = async () => {
    if (role !== "OWNER") return;

    setLoading(true);
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
      setLoading(false);
    }
  };
  return (
    <div
      className="music_player"
      style={{ display: "flex", justifyContent: "center" }}
    >
      <Button onClick={handlePlayAgain} disabled={loading || role !== "OWNER"}>
        {playAgain ? "Play Again" : "Play"}
      </Button>
    </div>
  );
}

export default PlayAgain;
