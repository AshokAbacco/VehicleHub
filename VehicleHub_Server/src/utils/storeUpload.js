// VehicleHub/VehicleHub_Server/src/utils/storeUpload.js
// ============================================================
// Every uploaded file (vehicle photos, RC / insurance documents, seller documents, shop logos,
// inspection photos) is stored in Cloudflare R2. Nothing is written to the server's disk.
//
// .env (all required):
//   CF_ACCOUNT_ID          Cloudflare account id
//   CF_ACCESS_KEY_ID       R2 API token — access key id
//   CF_SECRET_ACCESS_KEY   R2 API token — secret access key
//   CF_BUCKET_NAME         bucket name
//   CF_PUBLIC_BASE_URL     the bucket's public URL, e.g. https://pub-xxxx.r2.dev (or a custom domain)
// Optional:
//   CF_R2_ENDPOINT         override the S3 endpoint (default https://<CF_ACCOUNT_ID>.r2.cloudflarestorage.com)
//   CF_KEY_PREFIX          folder inside the bucket for this app (default "vehiclehub")
//
// Files are saved as <prefix>/<folder>/<yyyy>/<mm>/<random>.<ext> and the public URL is stored in the database.
// ============================================================
import path from "path";
import crypto from "crypto";
import { S3Client, PutObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";

const REQUIRED = ["CF_ACCOUNT_ID", "CF_ACCESS_KEY_ID", "CF_SECRET_ACCESS_KEY", "CF_BUCKET_NAME", "CF_PUBLIC_BASE_URL"];

export const missingStorageSettings = () => REQUIRED.filter((k) => !String(process.env[k] || "").trim());
export const storageConfigured = () => missingStorageSettings().length === 0;

const publicBase = () => String(process.env.CF_PUBLIC_BASE_URL || "").trim().replace(/\/+$/, "");
const keyPrefix = () => String(process.env.CF_KEY_PREFIX || "vehiclehub").trim().replace(/^\/+|\/+$/g, "");

let client = null;
const r2 = () => {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: process.env.CF_R2_ENDPOINT || `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.CF_ACCESS_KEY_ID,
        secretAccessKey: process.env.CF_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    });
  }
  return client;
};

const storageError = (message, statusCode = 503) => Object.assign(new Error(message), { statusCode });

const EXT_BY_TYPE = {
  "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif",
  "image/heic": ".heic", "image/avif": ".avif", "application/pdf": ".pdf",
};

/**
 * Uploads one multer (memory storage) file to R2 and returns its public URL.
 * @param {{ buffer: Buffer, originalname?: string, mimetype?: string }} file
 * @param {string} folder  e.g. "vehiclehub/vehicles" -> stored under <prefix>/vehicles/...
 */
export const storeUpload = async (file, folder = "misc") => {
  if (!file?.buffer) return null;
  const missing = missingStorageSettings();
  if (missing.length) {
    throw storageError(`File storage is not configured. Add ${missing.join(", ")} to the server .env file.`);
  }

  const sub = String(folder).replace(/^vehiclehub\/?/, "").replace(/[^a-z0-9/_-]/gi, "") || "misc";
  const ext = (path.extname(file.originalname || "") || EXT_BY_TYPE[file.mimetype] || ".bin").toLowerCase().replace(/[^.a-z0-9]/g, "");
  const now = new Date();
  const key = [
    keyPrefix(),
    sub,
    String(now.getUTCFullYear()),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`,
  ].filter(Boolean).join("/");

  try {
    await r2().send(new PutObjectCommand({
      Bucket: process.env.CF_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype || "application/octet-stream",
      CacheControl: "public, max-age=31536000, immutable",
    }));
  } catch (err) {
    console.error("R2 upload failed:", err?.name, err?.message);
    throw storageError("The file could not be uploaded. Please try again.", 502);
  }
  return `${publicBase()}/${key}`;
};

/** Object key for a URL that points into our R2 bucket, else null (other / old URLs are left alone). */
const keyFromUrl = (url) => {
  const base = publicBase();
  if (!base || typeof url !== "string" || !url.startsWith(`${base}/`)) return null;
  return decodeURIComponent(url.slice(base.length + 1).split("?")[0]);
};

/**
 * Deletes files from R2 (e.g. a removed vehicle photo). Best effort: never throws, so a storage
 * hiccup doesn't block the user's action. URLs outside our bucket are ignored.
 */
export const deleteStoredFiles = async (urls = []) => {
  if (!storageConfigured()) return;
  const keys = [...new Set([].concat(urls).map(keyFromUrl).filter(Boolean))];
  if (!keys.length) return;
  try {
    for (let i = 0; i < keys.length; i += 1000) {
      await r2().send(new DeleteObjectsCommand({
        Bucket: process.env.CF_BUCKET_NAME,
        Delete: { Objects: keys.slice(i, i + 1000).map((Key) => ({ Key })), Quiet: true },
      }));
    }
  } catch (err) {
    console.error("R2 delete failed:", err?.name, err?.message);
  }
};