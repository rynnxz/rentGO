import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyFirebaseIdTokenJwtWithCerts } from "@/lib/firebase-admin";

function signRs256Jwt(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
  privateKey: string,
): string {
  const headerB64 = Buffer.from(JSON.stringify(header), "utf8").toString(
    "base64url",
  );
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(`${headerB64}.${payloadB64}`);
  signer.end();
  const sigB64 = signer.sign(privateKey).toString("base64url");
  return `${headerB64}.${payloadB64}.${sigB64}`;
}

describe("Firebase ID Token RS256 Verification", () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  const certs = { "kid-1": publicKey };
  const nowSec = 1_800_000_000;

  it("verifies a valid Firebase ID token and extracts normalized identity", () => {
    const token = signRs256Jwt(
      { alg: "RS256", kid: "kid-1" },
      {
        aud: "rentgo-medan",
        iss: "https://securetoken.google.com/rentgo-medan",
        sub: "uid-123",
        email: "AkbarRiansyah339@gmail.com",
        name: "Akbar Riansyah",
        iat: nowSec - 60,
        auth_time: nowSec - 60,
        exp: nowSec + 3600,
      },
      privateKey,
    );

    const identity = verifyFirebaseIdTokenJwtWithCerts({
      idToken: token,
      certs,
      projectId: "rentgo-medan",
      nowSeconds: nowSec,
    });

    expect(identity).toEqual({
      firebase_uid: "uid-123",
      email: "akbarriansyah339@gmail.com",
      full_name: "Akbar Riansyah",
      avatar_url: null,
    });
  });

  it("rejects expired, wrong-audience, or tampered Firebase ID tokens", () => {
    const expiredToken = signRs256Jwt(
      { alg: "RS256", kid: "kid-1" },
      {
        aud: "rentgo-medan",
        iss: "https://securetoken.google.com/rentgo-medan",
        sub: "uid-123",
        email: "user@gmail.com",
        iat: nowSec - 7200,
        exp: nowSec - 10,
      },
      privateKey,
    );

    expect(
      verifyFirebaseIdTokenJwtWithCerts({
        idToken: expiredToken,
        certs,
        projectId: "rentgo-medan",
        nowSeconds: nowSec,
      }),
    ).toBeNull();

    const wrongAudToken = signRs256Jwt(
      { alg: "RS256", kid: "kid-1" },
      {
        aud: "other-project",
        iss: "https://securetoken.google.com/rentgo-medan",
        sub: "uid-123",
        email: "user@gmail.com",
        iat: nowSec - 60,
        exp: nowSec + 3600,
      },
      privateKey,
    );

    expect(
      verifyFirebaseIdTokenJwtWithCerts({
        idToken: wrongAudToken,
        certs,
        projectId: "rentgo-medan",
        nowSeconds: nowSec,
      }),
    ).toBeNull();

    const validToken = signRs256Jwt(
      { alg: "RS256", kid: "kid-1" },
      {
        aud: "rentgo-medan",
        iss: "https://securetoken.google.com/rentgo-medan",
        sub: "uid-123",
        email: "user@gmail.com",
        iat: nowSec - 60,
        exp: nowSec + 3600,
      },
      privateKey,
    );
    const [h, p, s] = validToken.split(".");
    const tamperedPayload = Buffer.from(
      JSON.stringify({
        aud: "rentgo-medan",
        iss: "https://securetoken.google.com/rentgo-medan",
        sub: "uid-999",
        email: "attacker@gmail.com",
        iat: nowSec - 60,
        exp: nowSec + 3600,
      }),
      "utf8",
    ).toString("base64url");

    expect(
      verifyFirebaseIdTokenJwtWithCerts({
        idToken: `${h}.${tamperedPayload}.${s}`,
        certs,
        projectId: "rentgo-medan",
        nowSeconds: nowSec,
      }),
    ).toBeNull();
  });
});
