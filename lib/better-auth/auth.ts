import { betterAuth } from "better-auth";
import type { BetterAuthOptions } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectToDataBase } from "@/database/mongoose";
import { nextCookies } from "better-auth/next-js";

let authInstance: ReturnType<typeof betterAuth> | null = null;

export const getauth = async () => {
  if (authInstance) return authInstance;

  const mongoose = await connectToDataBase();
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database connection failed");
  }

  const options: BetterAuthOptions = {
    database: mongodbAdapter(db),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    emailAndPassword: {
      enabled: true,
      disableSignUp: false,
      requireEmailVerification: false,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      autoSignIn: true,
    },
    plugins: [nextCookies()],
  };

  authInstance = betterAuth(options);

  return authInstance;
};

export const auth = await getauth();
