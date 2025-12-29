import kv from "../../../lib/db";

export default function PastePage({ paste, error }) {
  if (error) return <h1>404 - Paste Not Found</h1>;

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Paste</h1>
      <pre style={{ background: "#f4f4f4", padding: "1rem", whiteSpace: "pre-wrap" }}>
        {paste.content}
      </pre>
      {paste.remaining_views !== null && <p>Remaining Views: {paste.remaining_views}</p>}
      {paste.expires_at && <p>Expires At: {paste.expires_at}</p>}
    </div>
  );
}

export async function getServerSideProps({ params, req }) {
  const id = params.id;
  try {
    const paste = await kv.get(`paste:${id}`);
    if (!paste) return { props: { error: true } };

    const now =
  process.env.TEST_MODE === "1" && req.headers["x-test-now-ms"]
    ? parseInt(req.headers["x-test-now-ms"])
    : Date.now();


    if (paste.ttl_seconds && now > paste.created_at + paste.ttl_seconds * 1000) {
      await kv.del(`paste:${id}`);
      return { props: { error: true } };
    }

    if (paste.remaining_views !== null) {
      if (paste.remaining_views <= 0) {
        await kv.del(`paste:${id}`);
        return { props: { error: true } };
      }
      paste.remaining_views -= 1;
      await kv.set(`paste:${id}`, paste);
    }

    paste.expires_at = paste.ttl_seconds
      ? new Date(paste.created_at + paste.ttl_seconds * 1000).toISOString()
      : null;

    return { props: { paste } };
  } catch {
    return { props: { error: true } };
  }
}
