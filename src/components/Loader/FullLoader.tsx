import React from "react";
import Loader from "./Loader";

function FullLoader() {
  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <Loader />
    </div>
  );
}

export default FullLoader;
