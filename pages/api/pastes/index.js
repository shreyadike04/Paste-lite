import kv from "../../../lib/db";
import { nanoid } from "nanoid";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { content } = req.body;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({ error: "Content is required" });
    }

    const id = nanoid(8);

    await kv.set(`paste:${id}`, {
      content,
      created_at: Date.now(),
      remaining_views: null,
      ttl_seconds: null
    });

    return res.status(201).json({
      id,
      url: `http://localhost:3000/p/${id}`
    });
  } catch (err) {
    console.error("API ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
