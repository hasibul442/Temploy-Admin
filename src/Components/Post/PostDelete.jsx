"use client";
import React from "react";

function PostDelete({ postId }) {
  const handleDelete = () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    fetch(`${baseUrl}/api/v1/post`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: postId }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to delete post");
        }
        return res.json();
      })
      .then(() => {
        console.log("Post deleted successfully");
        // Optionally, you can refresh the page or update the UI
      })
      .catch((error) => {
        console.error("Error deleting post:", error);
      });
  };
  return (
    <>
      <button className="btn btn-sm btn-danger mx-2" onClick={handleDelete}>
        Delete
      </button>
    </>
  );
}

export default PostDelete;
