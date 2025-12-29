import kv from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  const paste = await kv.get(`paste:${id}`);
  if (!paste) {
    return res.status(404).json({ error: "Paste not found" });
  }

  // Deterministic time support
  const now =
    process.env.TEST_MODE === "1" && req.headers["x-test-now-ms"]
      ? parseInt(req.headers["x-test-now-ms"])
      : Date.now();

  // TTL check
  if (
    paste.ttl_seconds &&
    now > paste.created_at + paste.ttl_seconds * 1000
  ) {
    await kv.del(`paste:${id}`);
    return res.status(404).json({ error: "Paste expired" });
  }

  // View count check
  if (paste.remaining_views !== null) {
    if (paste.remaining_views <= 0) {
      await kv.del(`paste:${id}`);
      return res.status(404).json({ error: "View limit exceeded" });
    }

    paste.remaining_views -= 1;
    await kv.set(`paste:${id}`, paste);
  }

  const expires_at = paste.ttl_seconds
    ? new Date(
        paste.created_at + paste.ttl_seconds * 1000
      ).toISOString()
    : null;

  return res.status(200).json({
    content: paste.content,
    remaining_views: paste.remaining_views,
    expires_at
  });
}
