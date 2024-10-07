import NavBar from "@/components/NavBar";
import React from "react";

async function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-h-screen max-w-screen">
      <NavBar />
      {children}
    </div>
  );
}

export default layout;
