"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending, refetch } = authClient.useSession();

  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      return;
    }

    let cancelled = false;

    async function checkAdminRole() {
      setCheckingRole(true);
      setIsAdmin(false);

      try {
        const response = await fetch(`${API_URL}/api/appointments`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!cancelled) {
          setIsAdmin(response.ok);
        }
      } catch {
        if (!cancelled) {
          setIsAdmin(false);
        }
      } finally {
        if (!cancelled) {
          setCheckingRole(false);
        }
      }
    }

    void checkAdminRole();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, isPending]);

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!name.trim()) {
      setMessage("Name cannot be empty.");
      return;
    }

    setSaving(true);

    try {
      const result = await authClient.updateUser({
        name: name.trim(),
      });

      if (result.error) {
        throw new Error(result.error.message || "Unable to update profile.");
      }

      await refetch();
      setEditing(false);
      setMessage("Profile updated successfully.");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to update profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (isPending) {
    return (
      <main className="min-h-screen bg-[#FFFCF9] px-5 py-24 text-center">
        Loading your profile...
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-[#FFFCF9] px-5 py-24 text-center">
        <h1 className="font-serif text-3xl text-[#342D2C]">Please Sign In</h1>

        <p className="mt-4 text-[#81736E]">
          Sign in to view your SalonBook profile.
        </p>

        <Link
          href="/login"
          className="mt-6 inline-block bg-[#984E59] px-8 py-3 text-sm text-white"
        >
          Sign In
        </Link>
      </main>
    );
  }

  const user = session.user;

  return (
    <main className="min-h-screen bg-[#FFFCF9] text-[#342D2C]">
      <section className="bg-[#F8F0EB] px-5 py-16 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-[#A75F66]">
          Your Personal Space
        </p>

        <h1 className="font-serif text-4xl md:text-5xl">My Profile</h1>

        <p className="mt-4 text-sm text-[#81736E]">
          Manage your personal information.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-14">
        <div className="border border-[#EADDD6] bg-white p-6 md:p-10">
          <div className="mb-8 flex flex-col items-center border-b border-[#EADDD6] pb-8 text-center">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#F8F0EB] font-serif text-4xl text-[#984E59]">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}

            <h2 className="mt-5 font-serif text-3xl">{user.name}</h2>

            <p className="mt-2 text-sm text-[#81736E]">{user.email}</p>

            {checkingRole ? (
              <p className="mt-3 text-xs text-[#81736E]">
                Checking account access...
              </p>
            ) : (
              <span className="mt-4 bg-[#F8F0EB] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#984E59]">
                {isAdmin ? "Administrator" : "Customer"}
              </span>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-[#A75F66]">
                Full Name
              </p>
              <p className="text-lg">{user.name}</p>
            </div>

            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-[#A75F66]">
                Email Address
              </p>
              <p className="text-lg">{user.email}</p>
            </div>

            {!editing ? (
              <button
                type="button"
                onClick={() => {
                  setName(user.name);
                  setEditing(true);
                  setMessage("");
                }}
                className="bg-[#984E59] px-7 py-3 text-sm font-semibold text-white"
              >
                Edit Profile
              </button>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label
                    htmlFor="profile-name"
                    className="mb-2 block text-sm font-medium"
                  >
                    Update Name
                  </label>

                  <input
                    id="profile-name"
                    type="text"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full border border-[#E7DAD3] px-4 py-3 text-sm outline-none focus:border-[#984E59]"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-[#984E59] px-7 py-3 text-sm text-white disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="border border-[#E7DAD3] px-7 py-3 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {message && (
              <p role="status" className="text-sm text-[#984E59]">
                {message}
              </p>
            )}

            <div className="border-t border-[#EADDD6] pt-6">
              <h3 className="mb-5 font-serif text-2xl">Quick Access</h3>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center bg-[#984E59] px-6 py-3 text-sm font-semibold text-white"
                >
                  My Dashboard
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center justify-center border border-[#984E59] px-6 py-3 text-sm font-semibold text-[#984E59]"
                  >
                    Admin Dashboard
                  </Link>
                )}

                <Link
                  href="/services"
                  className="inline-flex items-center justify-center border border-[#E7DAD3] px-6 py-3 text-sm font-semibold text-[#665B58]"
                >
                  Explore Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
