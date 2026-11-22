"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type AuthMode = "login" | "register";

type Props = {
  mode: AuthMode;
};

export default function AuthForm({ mode }: Props) {
  const router = useRouter();
  const isRegister = mode === "register";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (isRegister && !name.trim()) {
      setMessage("Please enter your full name.");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const result = await authClient.signUp.email({
          name: name.trim(),
          email: email.trim(),
          password,
        });

        if (result.error) {
          setMessage(result.error.message || "Registration failed.");
          return;
        }
      } else {
        const result = await authClient.signIn.email({
          email: email.trim(),
          password,
        });

        if (result.error) {
          setMessage(result.error.message || "Login failed.");
          return;
        }
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setMessage("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setMessage("");
    setGoogleLoading(true);

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });

      if (result.error) {
        setMessage(result.error.message || "Google Sign-In failed.");
        setGoogleLoading(false);
      }
    } catch {
      setMessage("Unable to start Google Sign-In.");
      setGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFFCF9] text-[#342D2C]">
      <div className="grid min-h-[calc(100vh-80px)] lg:grid-cols-2">
        {/* Left Branding Panel */}
        <section className="relative hidden overflow-hidden bg-[#F3E5DF] lg:flex lg:flex-col lg:justify-between lg:p-14">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#F7EAE4_0%,#E9CCC7_55%,#D7AFA9_100%)]" />

          <div className="relative z-10">
            <Link
              href="/"
              className="font-serif text-3xl tracking-wide text-[#7D414B]"
            >
              SalonBook
            </Link>
          </div>

          <div className="relative z-10 max-w-lg">
            <p className="mb-5 text-xs uppercase tracking-[0.3em] text-[#8F4C56]">
              Your Beauty, Our Passion
            </p>

            <h2 className="font-serif text-5xl leading-tight text-[#342D2C] xl:text-6xl">
              A Little Luxury,
              <br />
              Just for You.
            </h2>

            <p className="mt-6 max-w-md text-base leading-8 text-[#6E5B59]">
              Discover your favorite treatments, reserve your perfect
              appointment, and enjoy a beautiful salon experience.
            </p>
          </div>

          <p className="relative z-10 text-xs tracking-wider text-[#7C6260]">
            BEAUTY • WELLNESS • CONFIDENCE
          </p>
        </section>

        {/* Right Form Panel */}
        <section className="flex items-center justify-center px-5 py-14 sm:px-10 lg:px-16">
          <div className="w-full max-w-md">
            <div className="mb-9 text-center">
              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-[#A75F66]">
                The SalonBook Experience
              </p>

              <h1 className="font-serif text-4xl md:text-5xl">
                {isRegister ? "Create Account" : "Welcome Back"}
              </h1>

              <p className="mt-4 text-sm leading-7 text-[#81736E]">
                {isRegister
                  ? "Join SalonBook and begin your beauty journey."
                  : "Sign in to continue your beauty journey."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegister && (
                <div>
                  <label
                    htmlFor="auth-name"
                    className="mb-2 block text-sm font-medium"
                  >
                    Full Name
                  </label>

                  <input
                    id="auth-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full border border-[#E7DAD3] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#984E59]"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="auth-email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email Address
                </label>

                <input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full border border-[#E7DAD3] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#984E59]"
                />
              </div>

              <div>
                <label
                  htmlFor="auth-password"
                  className="mb-2 block text-sm font-medium"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete={
                      isRegister ? "new-password" : "current-password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full border border-[#E7DAD3] bg-white px-4 py-3.5 pr-20 text-sm outline-none focus:border-[#984E59]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[#984E59]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {isRegister && (
                <div>
                  <label
                    htmlFor="auth-confirm-password"
                    className="mb-2 block text-sm font-medium"
                  >
                    Confirm Password
                  </label>

                  <input
                    id="auth-confirm-password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full border border-[#E7DAD3] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#984E59]"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full bg-[#984E59] px-5 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#803F49] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Please Wait..."
                  : isRegister
                    ? "Create Account"
                    : "Sign In"}
              </button>

              {message && (
                <p
                  role="status"
                  className="border border-[#E7DAD3] bg-[#F8F0EB] p-4 text-sm leading-6 text-[#984E59]"
                >
                  {message}
                </p>
              )}
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#E7DAD3]" />
              <span className="text-xs uppercase tracking-wider text-[#81736E]">
                Or Continue With
              </span>
              <div className="h-px flex-1 bg-[#E7DAD3]" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              className="flex w-full items-center justify-center gap-3 border border-[#E7DAD3] bg-white px-5 py-3.5 text-sm font-medium text-[#342D2C] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.27 5.48-4.8 7.18l7.73 6C44.38 38.03 46.98 31.88 46.98 24.55z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59A14.41 14.41 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.2A23.88 23.88 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.73-6c-2.14 1.44-4.89 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>

              {googleLoading ? "Connecting..." : "Continue with Google"}
            </button>

            <p className="mt-8 text-center text-sm text-[#81736E]">
              {isRegister
                ? "Already have an account?"
                : "Don't have an account?"}{" "}
              <Link
                href={isRegister ? "/login" : "/register"}
                className="font-semibold text-[#984E59] underline underline-offset-4"
              >
                {isRegister ? "Sign In" : "Create Account"}
              </Link>
            </p>

            <p className="mt-6 text-center text-xs text-[#9A8A84]">
              Your beauty journey starts here.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
