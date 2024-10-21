"use client";

import React from "react";
import { useEffect } from "react";

function YoutubePlayer() {
  useEffect(() => {
    console.log("Youtube Player");
  }, []);
  return <div>Youtube Player</div>;
}

export default YoutubePlayer;
