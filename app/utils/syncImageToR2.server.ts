import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const R2_BUCKET_NAME = "ti4-lab-images";
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_PUBLIC_URL) {
  throw new Error(
    "Missing R2 environment variables: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PUBLIC_URL"
  );
}

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export async function syncImageToR2(
  draftId: string,
  imageBuffer: Buffer,
  status: "complete" | "incomplete" = "complete",
): Promise<string> {
  const suffix = status === "incomplete" ? "-incomplete" : "";
  const key = `drafts/${draftId}${suffix}.png`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: imageBuffer,
      ContentType: "image/png",
    })
  );

  return `${R2_PUBLIC_URL}/${key}`;
}
