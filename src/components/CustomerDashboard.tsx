"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import {
  initialAppointments,
  type Appointment,
  type AppointmentStatus,
} from "@/data/appointments";

import { getAppointments, saveAppointments } from "@/lib/booking-storage";

type Tab = "overview" | "appointments" | "profile";

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

const currency = (value: number) => `৳${value.toLocaleString("en-BD")}`;

export default function CustomerDashboard() {
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const [appointments, setAppointments] =
    useState<Appointment[]>(initialAppointments);

  const [notice, setNotice] = useState("");

  const [name, setName] = useState("Demo Customer");
  const [email, setEmail] = useState("customer@example.com");
  const [phone, setPhone] = useState("01700000000");
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    const loadBookings = () => {
      setAppointments(getAppointments());
    };

    const handleStorageChange = () => {
      loadBookings();
    };

    loadBookings();

    window.addEventListener("salonbook-bookings-updated", loadBookings);

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("salonbook-bookings-updated", loadBookings);

      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (searchParams.get("tab") === "appointments") {
      setActiveTab("appointments");
    }
  }, [searchParams]);

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

  const cancelAppointment = (id: string) => {
    const appointment = appointments.find((item) => item.id === id);

    if (!appointment || appointment.status !== "pending") {
      setNotice("Only pending appointments can be cancelled.");
      return;
    }

    if (!window.confirm("Cancel this appointment?")) {
      return;
    }

    const updatedAppointments: Appointment[] = appointments.map((item) =>
      item.id === id ? { ...item, status: "cancelled" } : item,
    );

    try {
      saveAppointments(updatedAppointments);
      setAppointments(updatedAppointments);
      setNotice("Demo appointment cancelled successfully.");
    } catch {
      setNotice("Unable to save the cancellation.");
    }
  };

  const handlePayment = (appointment: Appointment) => {
    if (
      appointment.status !== "confirmed" ||
      appointment.paymentStatus === "paid"
    ) {
      return;
    }

    setNotice(
      `Payment preview for ${appointment.id}: ${currency(
        appointment.price,
      )}. Stripe Checkout will be connected later.`,
    );
  };

  const handleProfileSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setNotice(
      "Profile preview updated. Changes are not saved to the database yet.",
    );
  };

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
                  alt="Profile"
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
                    : "text-[#665B58] hover:bg-[#F8F0EB]"
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
                      {stat.value}
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

                {appointments.length === 0 ? (
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
                        key={appointment.id}
                        className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0E6E0] pb-4"
                      >
                        <div>
                          <p className="font-medium">
                            {appointment.serviceName}
                          </p>

                          <p className="mt-1 text-xs text-[#81736E]">
                            {appointment.date} · {appointment.time}
                          </p>
                        </div>

                        <span
                          className={`px-3 py-1.5 text-xs capitalize ${
                            statusStyles[appointment.status]
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
              <h2 className="mb-3 font-serif text-3xl">My Appointments</h2>

              <p className="mb-8 text-sm text-[#81736E]">
                View your booking history and appointment status.
              </p>

              {appointments.length === 0 ? (
                <div className="border border-[#EADDD6] bg-white px-6 py-14 text-center">
                  <h3 className="font-serif text-2xl">No Appointments Yet</h3>

                  <p className="mt-3 text-sm text-[#81736E]">
                    Your beauty journey starts with your first appointment.
                  </p>

                  <Link
                    href="/services"
                    className="mt-6 inline-block bg-[#984E59] px-6 py-3 text-sm text-white"
                  >
                    Book a Service
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
                  {appointments.map((appointment) => (
                    <article
                      key={appointment.id}
                      className="border border-[#EADDD6] bg-white p-5 md:p-7"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="mb-2 text-xs text-[#A75F66]">
                            {appointment.id}
                          </p>

                          <h3 className="font-serif text-2xl">
                            {appointment.serviceName}
                          </h3>
                        </div>

                        <span
                          className={`px-3 py-1.5 text-xs capitalize ${
                            statusStyles[appointment.status]
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
                            {appointment.time}
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
                            {appointment.paymentStatus}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        {appointment.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => cancelAppointment(appointment.id)}
                            className="border border-[#984E59] px-5 py-2.5 text-xs font-semibold text-[#984E59]"
                          >
                            Cancel Appointment
                          </button>
                        )}

                        {appointment.status === "confirmed" &&
                          appointment.paymentStatus === "unpaid" && (
                            <button
                              type="button"
                              onClick={() => handlePayment(appointment)}
                              className="bg-[#984E59] px-5 py-2.5 text-xs font-semibold text-white"
                            >
                              Pay Now
                            </button>
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
                Manage your personal information.
              </p>

              <form
                onSubmit={handleProfileSave}
                className="max-w-2xl space-y-6 border border-[#EADDD6] bg-white p-6 md:p-8"
              >
                <div className="flex items-center gap-5">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F3E1DD] font-serif text-3xl text-[#984E59]">
                    {profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profileImage}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      name.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="profile-image"
                      className="mb-2 block text-sm font-medium"
                    >
                      Profile Image URL
                    </label>

                    <input
                      id="profile-image"
                      type="url"
                      value={profileImage}
                      onChange={(event) => setProfileImage(event.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      className="w-full max-w-sm border border-[#E7DAD3] px-3 py-2 text-sm outline-none focus:border-[#984E59]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="profile-name"
                    className="mb-2 block text-sm font-medium"
                  >
                    Full Name
                  </label>

                  <input
                    id="profile-name"
                    type="text"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full border border-[#E7DAD3] px-4 py-3 outline-none focus:border-[#984E59]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-email"
                    className="mb-2 block text-sm font-medium"
                  >
                    Email Address
                  </label>

                  <input
                    id="profile-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full border border-[#E7DAD3] px-4 py-3 outline-none focus:border-[#984E59]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-phone"
                    className="mb-2 block text-sm font-medium"
                  >
                    Phone Number
                  </label>

                  <input
                    id="profile-phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="w-full border border-[#E7DAD3] px-4 py-3 outline-none focus:border-[#984E59]"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#984E59] px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-white"
                >
                  Save Changes
                </button>
              </form>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
