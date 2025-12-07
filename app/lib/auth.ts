import crypto from "crypto";

const TOKEN_EXPIRY_DAYS = 30;

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function getTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + TOKEN_EXPIRY_DAYS);
  return expiry;
}
