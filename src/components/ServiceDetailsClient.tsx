"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import type { SalonService } from "@/data/services";

type Props = {
  service: SalonService;
};

const timeSlots = [
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

function getLocalDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function ServiceDetailsClient({ service }: Props) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!date || !time || !name.trim() || !email.trim() || !phone.trim()) {
      setMessage("Please complete all required fields.");
      return;
    }

    if (date < getLocalDate()) {
      setMessage("Please select today or a future date.");
      return;
    }

    setMessage(
      "Booking preview completed! Actual appointment submission will be available after authentication and backend integration.",
    );
  };

  return (
    <main className="min-h-screen bg-[#FFFCF9] text-[#342D2C]">
      <section className="bg-[#F8F0EB] px-6 py-14 text-center md:py-20">
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-[#A75F66]">
          The SalonBook Experience
        </p>

        <h1 className="font-serif text-4xl md:text-6xl">{service.name}</h1>

        <p className="mt-5 text-sm text-[#756A67]">
          Beauty, care and a little moment just for you.
        </p>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <Link
          href="/services"
          className="text-sm text-[#984E59] underline underline-offset-4"
        >
          ← Back to All Services
        </Link>

        <div className="mt-9 grid gap-12 lg:grid-cols-2">
          {/* Service Information */}
          <div>
            <div className="overflow-hidden bg-[#F5EBE6]">
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

              <h2 className="mb-4 font-serif text-3xl">About This Treatment</h2>

              <p className="leading-8 text-[#756A67]">
                {service.description} Enjoy a thoughtfully curated salon
                experience designed to help you feel refreshed, confident and
                beautiful.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-5 border-y border-[#EADDD6] py-6">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wider text-[#81736E]">
                    Duration
                  </p>
                  <p className="font-medium">{service.duration} Minutes</p>
                </div>

                <div>
                  <p className="mb-2 text-xs uppercase tracking-wider text-[#81736E]">
                    Price
                  </p>
                  <p className="text-xl font-semibold text-[#984E59]">
                    ৳{service.price.toLocaleString("en-BD")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="border border-[#EADDD6] bg-white p-6 md:p-9">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#A75F66]">
              Reserve Your Moment
            </p>

            <h2 className="mb-7 font-serif text-3xl">Book an Appointment</h2>

            <form onSubmit={handleBooking} className="space-y-6">
              <div>
                <label
                  htmlFor="booking-date"
                  className="mb-2 block text-sm font-medium"
                >
                  Preferred Date *
                </label>

                <input
                  id="booking-date"
                  type="date"
                  required
                  min={getLocalDate()}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setMessage("");
                  }}
                  className="w-full border border-[#E7DAD3] bg-[#FFFCF9] px-4 py-3 outline-none focus:border-[#984E59]"
                />
              </div>

              <div>
                <p className="mb-3 text-sm font-medium">Preferred Time *</p>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      aria-pressed={time === slot}
                      onClick={() => {
                        setTime(slot);
                        setMessage("");
                      }}
                      className={`border px-3 py-3 text-xs ${
                        time === slot
                          ? "border-[#984E59] bg-[#984E59] text-white"
                          : "border-[#E7DAD3] bg-[#FFFCF9] text-[#665B58]"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>

                <p className="mt-2 text-xs text-[#81736E]">
                  Time slots are previews; live availability will be checked
                  after backend integration.
                </p>
              </div>

              <div>
                <label
                  htmlFor="customer-name"
                  className="mb-2 block text-sm font-medium"
                >
                  Full Name *
                </label>

                <input
                  id="customer-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full border border-[#E7DAD3] bg-[#FFFCF9] px-4 py-3 outline-none focus:border-[#984E59]"
                />
              </div>

              <div>
                <label
                  htmlFor="customer-email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email Address *
                </label>

                <input
                  id="customer-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full border border-[#E7DAD3] bg-[#FFFCF9] px-4 py-3 outline-none focus:border-[#984E59]"
                />
              </div>

              <div>
                <label
                  htmlFor="customer-phone"
                  className="mb-2 block text-sm font-medium"
                >
                  Phone Number *
                </label>

                <input
                  id="customer-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full border border-[#E7DAD3] bg-[#FFFCF9] px-4 py-3 outline-none focus:border-[#984E59]"
                />
              </div>

              {/* Booking Summary */}
              <div className="bg-[#F8F0EB] p-5">
                <h3 className="mb-4 font-serif text-xl">Booking Summary</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <span>Service</span>
                    <span className="text-right font-medium">
                      {service.name}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span>Date</span>
                    <span>{date || "Not selected"}</span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span>Time</span>
                    <span>{time || "Not selected"}</span>
                  </div>

                  <div className="flex justify-between border-t border-[#E4D4CB] pt-3">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold text-[#984E59]">
                      ৳{service.price.toLocaleString("en-BD")}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#984E59] px-5 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white hover:bg-[#803F49]"
              >
                Preview Booking
              </button>

              {message && (
                <p
                  role="status"
                  className="border border-[#E7DAD3] bg-[#FFFCF9] p-4 text-sm leading-6 text-[#984E59]"
                >
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
