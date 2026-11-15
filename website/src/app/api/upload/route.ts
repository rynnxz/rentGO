import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getEnv, hasSupabaseServiceCredentials } from "@/lib/env";
import { AuthError, requireAuthenticatedUser } from "@/lib/rbac";

const ALLOWED_MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jfif": ".jfif",
  "image/pjpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "application/pdf": ".pdf",
};

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export async function POST(request: NextRequest) {
  try {
    await requireAuthenticatedUser();
    const formData = await request.formData();
    const file = formData.get("file");
    const folderRaw = formData.get("folder");
    const folder =
      typeof folderRaw === "string" &&
      /^[a-z0-9-_]+$/i.test(folderRaw.trim())
        ? folderRaw.trim()
        : "vehicles";

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Pilih berkas gambar atau PDF terlebih dahulu." },
        { status: 400 },
      );
    }

    const ext = ALLOWED_MIME_EXT[file.type];
    if (!ext) {
      return NextResponse.json(
        {
          error:
            "Tipe berkas tidak didukung. Hanya menerima JPG, JFIF, PNG, WebP, SVG, atau PDF.",
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Ukuran berkas melebihi batas maksimal 2 MB." },
        { status: 400 },
      );
    }

    const safeFileName = `rg-${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    // 1. Try uploading to Supabase Storage Cloud Bucket (honhszsloegvpbmczkqf) when credentials are set
    if (hasSupabaseServiceCredentials()) {
      try {
        const env = getEnv();
        const bucket = env.SUPABASE_STORAGE_BUCKET || "rentgo-media";
        const objectPath = `${folder}/${safeFileName}`;
        const uploadRes = await fetch(
          `${env.SUPABASE_URL}/storage/v1/object/${bucket}/${objectPath}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
              apikey: env.SUPABASE_SERVICE_ROLE_KEY,
              "Content-Type": file.type,
              "x-upsert": "true",
            },
            body: bytes,
            signal: AbortSignal.timeout(4000),
          },
        );
        if (uploadRes.ok) {
          const publicUrl = `${env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${objectPath}`;
          return NextResponse.json(
            { url: publicUrl, storage: "supabase-cloud" },
            { status: 201 },
          );
        }
      } catch {
        // Fallback to local public/uploads storage
      }
    }

    // 2. Local persistent fallback storage in public/uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    fs.writeFileSync(path.join(uploadsDir, safeFileName), bytes);

    return NextResponse.json(
      { url: `/uploads/${safeFileName}`, storage: "local-public" },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal mengunggah berkas" },
      { status: 400 },
    );
  }
}
