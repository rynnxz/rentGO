import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { AuthError, requireAuthenticatedUser } from "@/lib/rbac";

const ALLOWED_MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
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
            "Tipe berkas tidak didukung. Hanya menerima JPG, PNG, WebP, SVG, atau PDF.",
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
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(uploadsDir, safeFileName), bytes);

    return NextResponse.json(
      { url: `/uploads/${safeFileName}` },
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
