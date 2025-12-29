import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  async function createPaste() {
    setError("");
    setUrl("");

    try {
      const res = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create paste");
        return;
      }

      setUrl(data.url);
    } catch (err) {
      setError("Network error");
    }
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Pastebin Lite</h1>

      <textarea
        rows={10}
        cols={60}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <br /><br />

      <button onClick={createPaste}>Create Paste</button>

      {url && <p>Paste URL: <a href={url}>{url}</a></p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
