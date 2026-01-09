import admin from "firebase-admin";
import type { Request, Response, NextFunction } from "express";

// Initialize Firebase Admin using environment variables only.
// This avoids committing any credentials to the repo.
if (!admin.apps.length) {
  const {
    FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY,
  } = process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    // We don't throw here so the server can still start for /health checks,
    // but auth-protected routes will fail with a clear message.
    console.warn(
      "[firebase-admin] Missing one or more of FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.",
    );
  } else {
    const privateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
  }
}

export interface AuthedRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

export async function authenticateFirebase(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization || "";
  const match = authHeader.match(/^Bearer (.+)$/);
  const idToken = match?.[1];

  if (!idToken) {
    return res.status(401).json({ error: "Missing Authorization: Bearer <token>" });
  }

  try {
    if (!admin.apps.length) {
      return res.status(500).json({ error: "Firebase Admin is not initialized" });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    return next();
  } catch (err) {
    console.error("Firebase auth verification failed:", err);
    return res.status(401).json({ error: "Invalid or expired ID token" });
  }
}

