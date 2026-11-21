import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Sign In | SalonBook",
  description: "Sign in to your SalonBook account.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
