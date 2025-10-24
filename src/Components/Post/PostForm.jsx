"use client";
import React, { useEffect, useState } from "react";

function PostForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [users, setUsers] = useState([]);

  // 🚫 No `await` – use Promises
  const getUsers = () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    return fetch(`${baseUrl}/api/v1/users`, {
      method: "GET",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }
        return res.json();
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        return []; // fallback to empty users list
      });
  };

  // ✅ Only calling logic inside useEffect
  useEffect(() => {
    getUsers().then((data) => setUsers(data));
  }, []);


    const handleSubmit = (e) => {
    e.preventDefault();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const postData = {
        title,
        content,
        authorId,
        status: "true",
        };
    fetch(`${baseUrl}/api/v1/post`, {
      method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to create post");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Post created:", data);
        // Reset form fields
        setTitle("");
        setContent("");
        setAuthorId("");
      })
      .catch((error) => {
        console.error("Error creating post:", error);
      });
    };

  return (
    <div>
      <form>
        <div className="form-group">
          <div className="mb-3">
            <label htmlFor="authorId">Author ID</label>
            <select
              name="authorId"
              id="authorId"
              className="form-control"
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
            >
              <option value="">Select Author</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              className="form-control"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="content">Content</label>
            <textarea
              className="form-control"
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
          Submit
        </button>
      </form>
    </div>
  );
}

export default PostForm;
