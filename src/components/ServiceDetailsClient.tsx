"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  apiRequest,
  type ApiService,
  type ApiAppointment,
} from "@/lib/salon-api";

type Props = {
  serviceId: string;
};

const timeSlots = [
  { label: "10:00 AM", value: "10:00" },
  { label: "11:00 AM", value: "11:00" },
  { label: "12:00 PM", value: "12:00" },
  { label: "01:00 PM", value: "13:00" },
  { label: "02:00 PM", value: "14:00" },
  { label: "03:00 PM", value: "15:00" },
  { label: "04:00 PM", value: "16:00" },
  { label: "05:00 PM", value: "17:00" },
];

function getLocalDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const fieldClass =
  "w-full border border-[#E7DAD3] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#984E59]";

export default function ServiceDetailsClient({ serviceId }: Props) {
  const router = useRouter();

  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const [service, setService] = useState<ApiService | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const loadService = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest<ApiService>(
        `/api/services/${encodeURIComponent(serviceId)}`,
      );

      setService(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load service details.",
      );
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    void loadService();
  }, [loadService]);

  async function handleBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!session?.user) {
      router.push(
        `/login?callbackURL=${encodeURIComponent(`/services/${serviceId}`)}`,
      );
      return;
    }

    if (!service) {
      setError("Service information is unavailable.");
      return;
    }

    if (!date || !time || !phone.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    if (date < getLocalDate()) {
      setError("Please choose today or a future date.");
      return;
    }

    if (date === getLocalDate()) {
      const now = new Date();
      const selectedMinutes =
        Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      if (selectedMinutes <= currentMinutes) {
        setError("Please choose a future time.");
        return;
      }
    }

    if (phone.trim().length < 7 || phone.trim().length > 20) {
      setError("Please enter a valid phone number.");
      return;
    }

    setSubmitting(true);

    try {
      await apiRequest<ApiAppointment>("/api/appointments", {
        method: "POST",
        body: JSON.stringify({
          serviceId: service._id,
          date,
          time,
          phone: phone.trim(),
          message: message.trim(),
        }),
      });

      router.push("/dashboard?tab=appointments");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to book appointment. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#FFFCF9]">
        <p className="text-sm text-[#984E59]">Loading service details...</p>
      </main>
    );
  }

  if (!service) {
    return (
      <main className="min-h-[70vh] bg-[#FFFCF9] px-5 py-24 text-center">
        <h1 className="font-serif text-3xl text-[#342D2C]">
          Service Unavailable
        </h1>

        <p className="mt-4 text-sm text-red-600">
          {error || "Service not found."}
        </p>

        <div className="mt-7 flex justify-center gap-4">
          <button
            type="button"
            onClick={() => void loadService()}
            className="bg-[#984E59] px-6 py-3 text-sm text-white"
          >
            Try Again
          </button>

          <Link
            href="/services"
            className="border border-[#984E59] px-6 py-3 text-sm text-[#984E59]"
          >
            All Services
          </Link>
        </div>
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
                  appointment in a few simple steps.
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

              {error && (
                <div
                  role="alert"
                  className="mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              {!sessionLoading && !session?.user && (
                <div className="mt-6 border border-[#EADDD6] bg-[#F8F0EB] p-4 text-sm text-[#81736E]">
                  Please{" "}
                  <Link
                    href={`/login?callbackURL=${encodeURIComponent(
                      `/services/${serviceId}`,
                    )}`}
                    className="font-semibold text-[#984E59] underline"
                  >
                    sign in
                  </Link>{" "}
                  to confirm your appointment.
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
                    onChange={(event) => setDate(event.target.value)}
                    className={fieldClass}
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
                    onChange={(event) => setTime(event.target.value)}
                    className={fieldClass}
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
                    value={session?.user?.name || ""}
                    readOnly
                    placeholder="Your account name"
                    className={`${fieldClass} bg-[#F8F0EB]`}
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
                    value={session?.user?.email || ""}
                    readOnly
                    placeholder="Your account email"
                    className={`${fieldClass} bg-[#F8F0EB]`}
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
                    minLength={7}
                    maxLength={20}
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="01XXXXXXXXX"
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="booking-message"
                    className="mb-2 block text-sm font-medium"
                  >
                    Special Request (Optional)
                  </label>

                  <textarea
                    id="booking-message"
                    rows={4}
                    maxLength={500}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Any special requests?"
                    className={fieldClass}
                  />
                </div>

                <div className="border border-[#EADDD6] bg-[#FFFCF9] p-5">
                  <h3 className="font-serif text-xl">Booking Summary</h3>

                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-[#81736E]">Service</span>
                      <span className="text-right font-medium">
                        {service.name}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-[#81736E]">Duration</span>
                      <span>{service.duration} min</span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-[#81736E]">Appointment Status</span>
                      <span>Pending</span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-[#81736E]">Payment Status</span>
                      <span>Unpaid</span>
                    </div>

                    <div className="flex justify-between gap-4 border-t border-[#EADDD6] pt-4 font-semibold">
                      <span>Total Price</span>
                      <span className="text-[#984E59]">
                        ৳{service.price.toLocaleString("en-BD")}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || sessionLoading}
                  className="w-full bg-[#984E59] px-6 py-4 text-sm font-semibold uppercase tracking-wider text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Booking Appointment..."
                    : sessionLoading
                      ? "Checking Session..."
                      : session?.user
                        ? "Confirm Booking"
                        : "Sign In to Book"}
                </button>

                <p className="text-center text-xs leading-6 text-[#81736E]">
                  Your appointment request will be saved to your account.
                  Payment will be available after Stripe integration.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
