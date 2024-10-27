import React from "react";
import "@/app/style/loader.css";

function Loader() {
  return (
    <div className="container">
      <div className="plate">
        <div className="black">
          <div className="border">
            <div className="white">
              <div className="center"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="player">
        <div className="circ"></div>
        <div className="rect"></div>
      </div>
    </div>
  );
}

export default Loader;
