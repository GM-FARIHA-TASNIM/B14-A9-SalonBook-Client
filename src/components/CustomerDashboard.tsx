"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { API_URL, type ApiAppointment } from "@/lib/salon-api";
import PayNowButton from "@/components/PayNowButton";

type Tab = "overview" | "appointments" | "profile";
type AppointmentStatus = ApiAppointment["status"];

const navigation: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "appointments", label: "My Appointments" },
  { id: "profile", label: "My Profile" },
];

const statusStyles: Record<AppointmentStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  completed: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

const currency = (value: number) =>
  `৳${Number(value || 0).toLocaleString("en-BD")}`;

function formatTime(time: string) {
  if (!/^\d{2}:\d{2}$/.test(time)) return time;

  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 || 12;

  return `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}

export default function CustomerDashboard() {
  const searchParams = useSearchParams();

  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const user = session?.user;
  const name = user?.name || "Customer";
  const email = user?.email || "";
  const profileImage = user?.image || "";

  useEffect(() => {
    const tab = searchParams.get("tab");

    if (tab === "overview" || tab === "appointments" || tab === "profile") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/appointments/my`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Failed to load appointments");
      }

      const items = Array.isArray(result)
        ? result
        : Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.appointments)
            ? result.appointments
            : null;

      if (!items) {
        throw new Error("Invalid appointments response");
      }

      setAppointments(items);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load appointments",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionLoading) return;

    if (!user) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    void loadAppointments();
  }, [sessionLoading, user?.id, loadAppointments]);

  const stats = useMemo(
    () => ({
      total: appointments.length,

      pending: appointments.filter(
        (appointment) => appointment.status === "pending",
      ).length,

      confirmed: appointments.filter(
        (appointment) => appointment.status === "confirmed",
      ).length,

      completed: appointments.filter(
        (appointment) => appointment.status === "completed",
      ).length,
    }),
    [appointments],
  );

  async function cancelAppointment(id: string) {
    const appointment = appointments.find((item) => item._id === id);

    if (
      !appointment ||
      !["pending", "confirmed"].includes(appointment.status) ||
      appointment.paymentStatus !== "unpaid"
    ) {
      setNotice(
        "Only unpaid pending or confirmed appointments can be cancelled.",
      );
      return;
    }

    if (!window.confirm("Cancel this appointment?")) {
      return;
    }

    setCancellingId(id);
    setNotice("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/appointments/${encodeURIComponent(id)}/cancel`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to cancel appointment");
      }

      await loadAppointments();

      setNotice("Appointment cancelled successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to cancel appointment.",
      );
    } finally {
      setCancellingId(null);
    }
  }

  if (sessionLoading) {
    return (
      <main className="min-h-screen bg-[#FFFCF9] px-5 py-24 text-center text-[#81736E]">
        Loading your dashboard...
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#FFFCF9] px-5 py-24 text-center">
        <h1 className="font-serif text-3xl text-[#342D2C]">Please Sign In</h1>

        <p className="mt-4 text-[#81736E]">
          Sign in to manage your appointments.
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

  return (
    <main className="min-h-screen bg-[#FFFCF9] text-[#342D2C]">
      <section className="bg-[#F8F0EB] px-5 py-12 text-center md:py-16">
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-[#A75F66]">
          Your Personal Beauty Space
        </p>

        <h1 className="font-serif text-4xl md:text-5xl">Customer Dashboard</h1>

        <p className="mt-4 text-sm text-[#81736E]">
          Manage your appointments and personal details.
        </p>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:px-8 lg:grid-cols-[250px_1fr]">
        <aside className="h-fit border border-[#EADDD6] bg-white p-5">
          <div className="mb-7 border-b border-[#EADDD6] pb-6">
            <div className="mb-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#F3E1DD] font-serif text-2xl text-[#984E59]">
              {profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profileImage}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>

            <h2 className="font-serif text-xl">{name}</h2>

            <p className="mt-1 break-all text-xs text-[#81736E]">{email}</p>
          </div>

          <nav className="flex flex-col gap-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setNotice("");
                }}
                className={`px-4 py-3 text-left text-sm ${
                  activeTab === item.id
                    ? "bg-[#984E59] text-white"
                    : "text-[#665B58]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <Link
            href="/services"
            className="mt-7 block border border-[#984E59] px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#984E59]"
          >
            Explore Services
          </Link>
        </aside>

        <div className="min-w-0">
          {notice && (
            <div
              role="status"
              className="mb-6 border border-[#EADDD6] bg-[#F8F0EB] p-4 text-sm text-[#984E59]"
            >
              {notice}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-6 border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}

              <button
                type="button"
                onClick={() => void loadAppointments()}
                className="ml-4 font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          {activeTab === "overview" && (
            <section>
              <div className="mb-8">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#A75F66]">
                  Welcome Back
                </p>

                <h2 className="font-serif text-3xl">
                  Hello, {name.split(" ")[0]}!
                </h2>

                <p className="mt-3 text-sm text-[#81736E]">
                  Here is a quick look at your beauty appointments.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: "Total Appointments",
                    value: stats.total,
                  },
                  {
                    label: "Pending",
                    value: stats.pending,
                  },
                  {
                    label: "Confirmed",
                    value: stats.confirmed,
                  },
                  {
                    label: "Completed",
                    value: stats.completed,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="border border-[#EADDD6] bg-white p-6"
                  >
                    <p className="text-xs text-[#81736E]">{stat.label}</p>

                    <p className="mt-4 font-serif text-4xl text-[#984E59]">
                      {loading ? "..." : stat.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-10 border border-[#EADDD6] bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h3 className="font-serif text-2xl">Recent Appointments</h3>

                  <button
                    type="button"
                    onClick={() => setActiveTab("appointments")}
                    className="text-sm font-medium text-[#984E59] underline underline-offset-4"
                  >
                    View All
                  </button>
                </div>

                {loading ? (
                  <p className="mt-6 text-sm text-[#81736E]">
                    Loading appointments...
                  </p>
                ) : error ? (
                  <p className="mt-6 text-sm text-[#81736E]">
                    Unable to display appointments.
                  </p>
                ) : appointments.length === 0 ? (
                  <div className="mt-6 py-10 text-center">
                    <p className="text-sm text-[#81736E]">
                      You have no appointments yet.
                    </p>

                    <Link
                      href="/services"
                      className="mt-4 inline-block text-sm font-medium text-[#984E59] underline"
                    >
                      Explore Services
                    </Link>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {appointments.slice(0, 3).map((appointment) => (
                      <div
                        key={appointment._id}
                        className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0E6E0] pb-4"
                      >
                        <div>
                          <p className="font-medium">
                            {appointment.serviceName}
                          </p>

                          <p className="mt-1 text-xs text-[#81736E]">
                            {appointment.date} · {formatTime(appointment.time)}
                          </p>
                        </div>

                        <span
                          className={`px-3 py-1.5 text-xs capitalize ${
                            statusStyles[appointment.status] || ""
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === "appointments" && (
            <section>
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="mb-3 font-serif text-3xl">My Appointments</h2>

                  <p className="text-sm text-[#81736E]">
                    View your booking history and appointment status.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void loadAppointments()}
                  disabled={loading}
                  className="border border-[#984E59] px-5 py-2.5 text-xs font-semibold text-[#984E59] disabled:opacity-60"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <p className="py-10 text-center text-[#81736E]">
                  Loading your appointments...
                </p>
              ) : error ? (
                <p className="py-10 text-center text-[#81736E]">
                  Appointments could not be loaded.
                </p>
              ) : appointments.length === 0 ? (
                <div className="border border-[#EADDD6] bg-white px-6 py-14 text-center">
                  <h3 className="font-serif text-2xl">No Appointments Yet</h3>

                  <p className="mt-3 text-sm text-[#81736E]">
                    Your beauty journey starts with your first appointment.
                  </p>

                  <Link
                    href="/services"
                    className="mt-6 inline-block bg-[#984E59] px-6 py-3 text-sm text-white"
                  >
                    Explore Services
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
                  {appointments.map((appointment) => (
                    <article
                      key={appointment._id}
                      className="border border-[#EADDD6] bg-white p-5 md:p-7"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="mb-2 break-all text-xs text-[#A75F66]">
                            Booking #{appointment._id.slice(-8).toUpperCase()}
                          </p>

                          <h3 className="font-serif text-2xl">
                            {appointment.serviceName}
                          </h3>
                        </div>

                        <span
                          className={`px-3 py-1.5 text-xs capitalize ${
                            statusStyles[appointment.status] || ""
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </div>

                      <div className="mt-6 grid gap-4 border-y border-[#F0E6E0] py-5 text-sm sm:grid-cols-3">
                        <div>
                          <p className="mb-1 text-xs text-[#81736E]">
                            Date & Time
                          </p>

                          <p>
                            {appointment.date}
                            <br />
                            {formatTime(appointment.time)}
                          </p>
                        </div>

                        <div>
                          <p className="mb-1 text-xs text-[#81736E]">Price</p>

                          <p className="font-semibold text-[#984E59]">
                            {currency(appointment.price)}
                          </p>
                        </div>

                        <div>
                          <p className="mb-1 text-xs text-[#81736E]">Payment</p>

                          <p className="capitalize">
                            {appointment.paymentStatus || "unpaid"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        {["pending", "confirmed"].includes(
                          appointment.status,
                        ) &&
                          appointment.paymentStatus === "unpaid" && (
                            <button
                              type="button"
                              onClick={() =>
                                void cancelAppointment(appointment._id)
                              }
                              disabled={cancellingId === appointment._id}
                              className="border border-[#984E59] px-5 py-2.5 text-xs font-semibold text-[#984E59] disabled:opacity-60"
                            >
                              {cancellingId === appointment._id
                                ? "Cancelling..."
                                : "Cancel Appointment"}
                            </button>
                          )}

                        {appointment.status === "confirmed" &&
                          appointment.paymentStatus === "unpaid" && (
                            <PayNowButton appointmentId={appointment._id} />
                          )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "profile" && (
            <section>
              <h2 className="mb-3 font-serif text-3xl">My Profile</h2>

              <p className="mb-8 text-sm text-[#81736E]">
                View and manage your personal information.
              </p>

              <div className="max-w-2xl border border-[#EADDD6] bg-white p-6 md:p-8">
                <div className="mb-6 flex items-center gap-5 border-b border-[#EADDD6] pb-6">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F3E1DD] font-serif text-3xl text-[#984E59]">
                    {profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profileImage}
                        alt={name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      name.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div>
                    <h3 className="font-serif text-2xl">{name}</h3>

                    <p className="mt-2 break-all text-sm text-[#81736E]">
                      {email}
                    </p>
                  </div>
                </div>

                <Link
                  href="/profile"
                  className="inline-block bg-[#984E59] px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-white"
                >
                  Edit My Profile
                </Link>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
