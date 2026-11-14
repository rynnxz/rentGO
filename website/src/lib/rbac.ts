import "server-only";
import { getCurrentSessionUser } from "./session";
import type { UserRecord } from "./types";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number = 401) {
    super(message);
    this.status = status;
  }
}

export async function requireAuthenticatedUser(): Promise<UserRecord> {
  const user = await getCurrentSessionUser();
  if (!user) {
    throw new AuthError(
      "Silakan masuk dengan akun Google terlebih dahulu.",
      401,
    );
  }
  return user;
}

export async function requireAdminUser(): Promise<UserRecord> {
  const user = await requireAuthenticatedUser();
  if (user.role !== "admin") {
    throw new AuthError(
      "Akses ditolak: halaman dan endpoint ini khusus Administrator RentGo.",
      403,
    );
  }
  return user;
}
