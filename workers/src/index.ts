import { Hono } from "hono";
import uploadFile from "./routes/UploadFile";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use("*", async (c, next) => {
  const originUrl =
    c.env.ENVIRONMENT === "production"
      ? "https://website.com"
      : "http://localhost:5173";

  const referer = c.req.header("referer");
  const origin = c.req.header("origin");

  // Add CORS headers to every response
  c.res.headers.set("Access-Control-Allow-Origin", originUrl);
  c.res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  c.res.headers.set("Access-Control-Allow-Headers", "*");
  c.res.headers.set("Access-Control-Max-Age", "86400");

  // Handle OPTIONS request
  if (c.req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: c.res.headers,
    });
  }

  // if (!referer.includes(originUrl) || !origin.includes(originUrl)) {
  // 	return new Response('Unauthorized API request', {
  // 		status: 403,
  // 		headers: c.res.headers,
  // 	});
  // }

  await next();
});

app.get("/message", (c) => {
  return c.text("Hello Hono!");
});
app.post("/upload-file", uploadFile);

export default app;
