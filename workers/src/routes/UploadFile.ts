import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import type { Context } from "hono";

export default async function uploadFile(
  c: Context<{ Bindings: CloudflareBindings }>
) {
  try {
    const formData = await c.req.formData();
    const fileEntry = formData.get("file");
    const filename = formData.get("filename");
    const type = formData.get("type");

    if (!(fileEntry instanceof File)) {
      return c.json({ error: "No valid file provided" }, 400);
    }

    if (typeof filename !== "string" || typeof type !== "string") {
      return c.json({ error: "Invalid filename or type" }, 400);
    }

    const arrayBuffer = await fileEntry.arrayBuffer();

    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${c.env.R2_ENDPOINT}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: c.env.R2_ACCESS_KEY_ID,
        secretAccessKey: c.env.R2_SECRET_ACCESS_KEY,
      },
    });

    const command = new PutObjectCommand({
      Bucket: c.env.R2_BUCKET_NAME,
      Key: filename,
      Body: arrayBuffer,
      ContentType: type,
    });

    await s3Client.send(command);
    console.log(filename);

    return c.json({ filename });
  } catch (err) {
    console.error("Upload error:", err);
    return c.json({ error: "Upload failed" }, 500);
  }
}
