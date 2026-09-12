import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'smartinvites-media';
const publicUrl = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '').replace(/\/$/, '');

let s3ClientInstance: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!s3ClientInstance) {
    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error('Cloudflare R2 credentials are not configured in environment variables.');
    }
    s3ClientInstance = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return s3ClientInstance;
}

export interface UploadOptions {
  key: string;
  body: Buffer | Uint8Array | Blob | string;
  contentType: string;
  cacheControl?: string;
}

/**
 * Upload a file directly to Cloudflare R2
 * Returns the public URL to access the uploaded file.
 */
export async function uploadToR2({
  key,
  body,
  contentType,
  cacheControl = 'public, max-age=31536000, immutable',
}: UploadOptions): Promise<string> {
  const client = getR2Client();
  const cleanKey = key.replace(/^\/+/, '');

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: cleanKey,
      Body: body,
      ContentType: contentType,
      CacheControl: cacheControl,
    })
  );

  return `${publicUrl}/${cleanKey}`;
}

/**
 * Generate a presigned upload URL for direct client-to-R2 uploads
 */
export async function getPresignedUploadUrl(key: string, contentType: string, expiresIn = 3600): Promise<{ uploadUrl: string; publicUrl: string }> {
  const client = getR2Client();
  const cleanKey = key.replace(/^\/+/, '');

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: cleanKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn });
  return {
    uploadUrl,
    publicUrl: `${publicUrl}/${cleanKey}`,
  };
}

/**
 * Delete a file from Cloudflare R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  const client = getR2Client();
  const cleanKey = key.replace(/^\/+/, '');

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: cleanKey,
    })
  );
}

/**
 * Get public URL for a given object key
 */
export function getR2PublicUrl(key: string): string {
  const cleanKey = key.replace(/^\/+/, '');
  return `${publicUrl}/${cleanKey}`;
}
