/* Ambient bindings for Cloudflare Worker environment */

declare interface CloudflareBindings {
  R2_ENDPOINT: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET_NAME: string;
  ENVIRONMENT: string;
}
