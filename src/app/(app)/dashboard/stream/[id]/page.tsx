import React from "react";

function page({ params }: { params: { id: string } }) {
  return (
    <div>
      <p>This is stream {params.id}</p>
    </div>
  );
}

export default page;
