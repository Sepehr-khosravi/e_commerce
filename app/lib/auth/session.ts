import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "../prisma";

const SESSION_COOKIE = "session";
const SESSION_DURATION_DAYS = 7;

export async function createSession(userId: number) {
  const sessionId = crypto.randomBytes(32).toString("hex");

  const expiresAt = new Date(
    Date.now() +
      SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
  );

  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production", //((development environment))
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return sessionId;
}

export async function deleteSession() {
  const cookieStore = await cookies();

  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionId) {
    await prisma.session.deleteMany({
      where: {
        id: sessionId,
      },
    });
  }

  cookieStore.delete(SESSION_COOKIE);
}