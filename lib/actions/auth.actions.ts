"use server";

import { auth } from "@/lib/better-auth/auth";
import { inngest } from "../inngest/client";
import { headers } from "next/headers";

export const signUpWithEmail = async ({
  email,
  password,
  fullName,
  country,
  investmentGoals,
  riskTolerance,
  preferredIndustry,
}: SignUpFormData) => {
  try {
    const response = await auth.api.signUpEmail({
      body: { email, password, name: fullName },
    });

    if (response) {
      await inngest.send({
        name: "app/user.created",
        data: {
          email,
          name: fullName,
          country,
          investmentGoals,
          riskTolerance,
          preferredIndustry,
        },
      });
    }
    return { success: true, message: "Account created successfully.", data: response };
  } catch (e) {
    console.log("Error signing up user:", e);
    return { success: false, message: "Failed to create an account." };
  }
};

export const sigInWithEmail = async ({ email, password }: SignInFormData) => {
  try {
    const response = await auth.api.signInEmail({ body: { email, password } });
    return { success: true, message: "Logged in successfully.", data: response };
  } catch (error) {
    console.log("Login failed:", error);
    return { success: false, message: "Login failed." };
  }
};

export const signOut = async () => {
  try {
    await auth.api.signOut({ headers: await headers() });
    return { success: true, message: "Logged out successfully." };
  } catch (e) {
    console.log("Logout failed:", e);
    return { success: false, message: "Logout failed." };
  }
};
