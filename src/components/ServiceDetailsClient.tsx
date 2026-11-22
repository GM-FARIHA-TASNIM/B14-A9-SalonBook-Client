"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import {
  API_URL,
  type ApiService,
  type ApiAppointment,
  apiRequest,
} from "@/lib/salon-api";

type Props = {
  serviceId: string;
};

const timeSlots = [
  { label: "10:00 AM", value: "10:00" },
  { label: "11:00 AM", value: "11:00" },
  { label: "12:00 PM", value: "12:00" },
  { label: "02:00 PM", value: "14:00" },
  { label: "03:00 PM", value: "15:00" },
  { label: "04:00 PM", value: "16:00" },
  { label: "05:00 PM", value: "17:00" },
];

function getLocalDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function ServiceDetailsClient({ serviceId }: Props) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [service, setService] = useState<ApiService | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadService() {
      try {
        const response = await fetch(
          `${API_URL}/api/services/${encodeURIComponent(serviceId)}`,
          { signal: controller.signal },
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Service not found");
        }

        setService(result.data);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(err instanceof Error ? err.message : "Unable to load service");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadService();

    return () => controller.abort();
  }, [serviceId]);

  async function handleBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!session) {
      router.push("/login");
      return;
    }

    if (!service || !date || !time || !phone.trim()) {
      setMessage("Please complete all required fields.");
      return;
    }

    if (date < getLocalDate()) {
      setMessage("Please select today or a future date.");
      return;
    }

    setBooking(true);

    try {
      await apiRequest<ApiAppointment>("/api/appointments", {
        method: "POST",
        body: JSON.stringify({
          serviceId: service._id,
          date,
          time,
          phone: phone.trim(),
        }),
      });

      router.push("/dashboard?tab=appointments");
      router.refresh();
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Unable to book appointment.",
      );
    } finally {
      setBooking(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FFFCF9] px-6 py-24 text-center text-[#81736E]">
        Loading service details...
      </main>
    );
  }

  if (!service) {
    return (
      <main className="min-h-screen bg-[#FFFCF9] px-6 py-24 text-center">
        <h1 className="font-serif text-3xl text-[#342D2C]">
          Service Not Available
        </h1>
        <p className="mt-4 text-[#984E59]">{error}</p>
        <Link
          href="/services"
          className="mt-6 inline-block text-[#984E59] underline"
        >
          Back to Services
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFCF9] text-[#342D2C]">
      <section className="bg-[#F8F0EB] px-5 py-14 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-[#A75F66]">
          The SalonBook Experience
        </p>

        <h1 className="font-serif text-4xl md:text-5xl">Service Details</h1>

        <p className="mt-4 text-sm text-[#81736E]">
          Discover your perfect beauty experience.
        </p>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <Link
          href="/services"
          className="mb-8 inline-block text-sm font-medium text-[#984E59]"
        >
          ← Back to Services
        </Link>

        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="overflow-hidden bg-[#F3E5DF]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={service.image}
                alt={service.name}
                className="h-80 w-full object-cover md:h-112"
              />
            </div>

            <div className="mt-8">
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#A75F66]">
                {service.category}
              </p>

              <h2 className="font-serif text-3xl md:text-4xl">
                {service.name}
              </h2>

              <p className="mt-5 text-sm leading-8 text-[#81736E]">
                {service.description}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="border border-[#EADDD6] bg-white p-5">
                  <p className="text-xs text-[#81736E]">Service Price</p>
                  <p className="mt-2 font-serif text-2xl text-[#984E59]">
                    ৳{service.price.toLocaleString("en-BD")}
                  </p>
                </div>

                <div className="border border-[#EADDD6] bg-white p-5">
                  <p className="text-xs text-[#81736E]">Duration</p>
                  <p className="mt-2 font-serif text-2xl text-[#984E59]">
                    {service.duration} min
                  </p>
                </div>
              </div>

              <div className="mt-8 border border-[#EADDD6] bg-[#F8F0EB] p-6">
                <h3 className="font-serif text-xl">A Moment Just for You</h3>

                <p className="mt-3 text-sm leading-7 text-[#81736E]">
                  Choose your preferred date and time, and reserve your beauty
                  appointment in just a few simple steps.
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="border border-[#EADDD6] bg-white p-6 md:p-8">
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#A75F66]">
                Reserve Your Experience
              </p>

              <h2 className="font-serif text-3xl">Book an Appointment</h2>

              <p className="mt-3 text-sm leading-7 text-[#81736E]">
                Select your preferred date and time to request an appointment.
              </p>

              {!isPending && !session && (
                <div className="mt-6 border border-[#EADDD6] bg-[#F8F0EB] p-4 text-sm">
                  Please{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-[#984E59] underline"
                  >
                    sign in
                  </Link>{" "}
                  before booking.
                </div>
              )}

              <form onSubmit={handleBooking} className="mt-8 space-y-5">
                <div>
                  <label
                    htmlFor="booking-date"
                    className="mb-2 block text-sm font-medium"
                  >
                    Preferred Date
                  </label>

                  <input
                    id="booking-date"
                    type="date"
                    required
                    min={getLocalDate()}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-[#E7DAD3] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#984E59]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="booking-time"
                    className="mb-2 block text-sm font-medium"
                  >
                    Preferred Time
                  </label>

                  <select
                    id="booking-time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full border border-[#E7DAD3] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#984E59]"
                  >
                    <option value="">Select a time slot</option>

                    {timeSlots.map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="booking-name"
                    className="mb-2 block text-sm font-medium"
                  >
                    Full Name
                  </label>

                  <input
                    id="booking-name"
                    type="text"
                    readOnly
                    value={session?.user.name || ""}
                    placeholder="Sign in to continue"
                    className="w-full border border-[#E7DAD3] bg-[#FAF7F4] px-4 py-3.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="booking-email"
                    className="mb-2 block text-sm font-medium"
                  >
                    Email Address
                  </label>

                  <input
                    id="booking-email"
                    type="email"
                    readOnly
                    value={session?.user.email || ""}
                    placeholder="Sign in to continue"
                    className="w-full border border-[#E7DAD3] bg-[#FAF7F4] px-4 py-3.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="booking-phone"
                    className="mb-2 block text-sm font-medium"
                  >
                    Phone Number
                  </label>

                  <input
                    id="booking-phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full border border-[#E7DAD3] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#984E59]"
                  />
                </div>

                <div className="border border-[#EADDD6] bg-[#F8F0EB] p-5">
                  <h3 className="font-serif text-xl">Booking Summary</h3>

                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-[#81736E]">Service</span>
                      <span className="text-right font-medium">
                        {service.name}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-[#81736E]">Duration</span>
                      <span>{service.duration} min</span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-[#81736E]">Date</span>
                      <span>{date || "Not selected"}</span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-[#81736E]">Time</span>
                      <span>
                        {timeSlots.find((s) => s.value === time)?.label ||
                          "Not selected"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3 border-t border-[#E7DAD3] pt-3">
                      <span className="font-medium">Total Price</span>
                      <span className="font-semibold text-[#984E59]">
                        ৳{service.price.toLocaleString("en-BD")}
                      </span>
                    </div>
                  </div>
                </div>

                {message && (
                  <p
                    role="alert"
                    className="border border-[#EADDD6] bg-[#F8F0EB] p-4 text-sm text-[#984E59]"
                  >
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={booking || isPending}
                  className="w-full bg-[#984E59] px-6 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white hover:bg-[#803F49] disabled:opacity-60"
                >
                  {booking ? "Booking..." : "Confirm Booking"}
                </button>

                <p className="text-center text-xs leading-6 text-[#81736E]">
                  Your appointment request will be saved securely. Payment is
                  not collected at this stage.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
