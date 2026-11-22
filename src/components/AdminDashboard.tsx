"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import {
  apiRequest,
  apiAction,
  type ApiService,
  type ApiAppointment,
  type ApiUser,
  type ServiceCategory,
} from "@/lib/salon-api";

type Tab = "overview" | "services" | "users" | "appointments";

type ServiceForm = {
  name: string;
  category: ServiceCategory;
  description: string;
  price: string;
  duration: string;
  image: string;
  featured: boolean;
};

const emptyForm: ServiceForm = {
  name: "",
  category: "Hair",
  description: "",
  price: "",
  duration: "",
  image: "",
  featured: false,
};

const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "services", label: "Manage Services" },
  { id: "users", label: "Registered Users" },
  { id: "appointments", label: "Appointments" },
];

const categories: ServiceCategory[] = [
  "Hair",
  "Facial",
  "Nails",
  "Makeup",
  "Spa",
];

const currency = (value: number) =>
  `৳${Number(value || 0).toLocaleString("en-BD")}`;

const fieldClass =
  "w-full border border-[#E7DAD3] bg-white p-3 text-sm outline-none focus:border-[#984E59]";

export default function AdminDashboard() {
  const { data: session, isPending } = authClient.useSession();

  const [tab, setTab] = useState<Tab>("overview");
  const [services, setServices] = useState<ApiService[]>([]);
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);

  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>({ ...emptyForm });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const bookings = await apiRequest<ApiAppointment[]>("/api/appointments");

      setAuthorized(true);

      const [serviceData, userData] = await Promise.all([
        apiRequest<ApiService[]>("/api/services"),
        apiRequest<ApiUser[]>("/api/users"),
      ]);

      setAppointments(bookings);
      setServices(serviceData);
      setUsers(userData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load data";

      setError(message);

      if (
        message.includes("Admin access required") ||
        message.includes("Unauthorized")
      ) {
        setAuthorized(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      setAuthorized(false);
      setLoading(false);
      return;
    }

    void loadData();
  }, [isPending, session?.user?.id, loadData]);

  function resetForm() {
    setEditingId(null);
    setForm({ ...emptyForm });
  }

  function updateField<K extends keyof ServiceForm>(
    key: K,
    value: ServiceForm[K],
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  async function saveService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const price = Number(form.price);
    const duration = Number(form.duration);

    if (
      form.name.trim().length < 2 ||
      form.description.trim().length < 10 ||
      !form.image.trim() ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isInteger(duration) ||
      duration <= 0
    ) {
      setError("Please enter valid service information.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim(),
        price,
        duration,
        image: form.image.trim(),
        featured: form.featured,
      };

      await apiAction(
        editingId ? `/api/services/${editingId}` : "/api/services",
        {
          method: editingId ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        },
      );

      const wasEditing = Boolean(editingId);

      resetForm();
      await loadData();

      setNotice(
        wasEditing
          ? "Service updated successfully."
          : "Service added successfully.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save service");
    } finally {
      setSaving(false);
    }
  }

  function editService(service: ApiService) {
    setEditingId(service._id);

    setForm({
      name: service.name,
      category: service.category,
      description: service.description,
      price: String(service.price),
      duration: String(service.duration),
      image: service.image,
      featured: service.featured,
    });

    setTab("services");
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteService(id: string) {
    if (!window.confirm("Delete this service permanently?")) return;

    setBusyId(id);
    setError("");
    setNotice("");

    try {
      await apiAction(`/api/services/${id}`, {
        method: "DELETE",
      });

      if (editingId === id) resetForm();

      await loadData();
      setNotice("Service deleted successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete service");
    } finally {
      setBusyId(null);
    }
  }

  async function updateAppointment(
    id: string,
    status: ApiAppointment["status"],
  ) {
    setBusyId(id);
    setError("");
    setNotice("");

    try {
      await apiAction(`/api/appointments/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      await loadData();
      setNotice("Appointment status updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update appointment",
      );
    } finally {
      setBusyId(null);
    }
  }

  const pendingCount = appointments.filter(
    (item) => item.status === "pending",
  ).length;

  const completedCount = appointments.filter(
    (item) => item.status === "completed",
  ).length;

  if (isPending || loading) {
    return (
      <main className="min-h-[70vh] bg-[#FFFCF9] px-5 py-24 text-center text-[#984E59]">
        Loading Admin Dashboard...
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="min-h-[70vh] bg-[#FFFCF9] px-5 py-24 text-center">
        <h1 className="font-serif text-3xl">Please Sign In</h1>
        <Link
          href="/login"
          className="mt-5 inline-block text-[#984E59] underline"
        >
          Go to Login
        </Link>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="min-h-[70vh] bg-[#FFFCF9] px-5 py-20 text-center">
        <h1 className="font-serif text-4xl text-[#984E59]">
          Admin Access Required
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-[#81736E]">
          {error || "Only administrators can access this dashboard."}
        </p>

        <button
          type="button"
          onClick={() => void loadData()}
          className="mt-7 bg-[#984E59] px-6 py-3 text-white"
        >
          Try Again
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFCF9] text-[#342D2C]">
      <section className="bg-[#F8F0EB] px-5 py-12 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-[#A75F66]">
          Salon Management
        </p>

        <h1 className="font-serif text-4xl md:text-5xl">Admin Dashboard</h1>

        <p className="mt-4 text-sm text-[#81736E]">
          Manage your salon in one beautiful space.
        </p>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:px-8 lg:grid-cols-[250px_1fr]">
        <aside className="h-fit border border-[#EADDD6] bg-white p-5">
          <h2 className="mb-6 border-b border-[#EADDD6] pb-5 font-serif text-2xl text-[#984E59]">
            SalonBook Admin
          </h2>

          <nav className="flex flex-col gap-2">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(item.id);
                  setError("");
                  setNotice("");
                }}
                className={`px-4 py-3 text-left text-sm ${
                  tab === item.id ? "bg-[#984E59] text-white" : "text-[#665B58]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => void loadData()}
            className="mt-6 w-full border border-[#EADDD6] px-4 py-3 text-sm text-[#984E59]"
          >
            Refresh Data
          </button>

          <Link
            href="/"
            className="mt-3 block border border-[#984E59] px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#984E59]"
          >
            Back to Website
          </Link>
        </aside>

        <div className="min-w-0">
          {error && (
            <p
              role="alert"
              className="mb-6 border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {notice && (
            <p
              role="status"
              className="mb-6 border border-[#EADDD6] bg-[#F8F0EB] p-4 text-sm text-[#984E59]"
            >
              {notice}
            </p>
          )}

          {tab === "overview" && (
            <section>
              <h2 className="mb-8 font-serif text-3xl">Dashboard Overview</h2>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  { label: "Registered Users", value: users.length },
                  { label: "Total Services", value: services.length },
                  {
                    label: "Total Appointments",
                    value: appointments.length,
                  },
                  {
                    label: "Pending Appointments",
                    value: pendingCount,
                  },
                  {
                    label: "Completed Appointments",
                    value: completedCount,
                  },
                  {
                    label: "Featured Services",
                    value: services.filter((item) => item.featured).length,
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

              <div className="mt-8 border border-[#EADDD6] bg-white p-7">
                <h3 className="font-serif text-2xl">Salon Management</h3>

                <p className="mt-3 text-sm leading-7 text-[#81736E]">
                  Your dashboard displays live information from MongoDB. Manage
                  services, registered users and appointments using the sidebar.
                </p>
              </div>
            </section>
          )}

          {tab === "services" && (
            <section>
              <h2 className="mb-7 font-serif text-3xl">Manage Services</h2>

              <form
                onSubmit={saveService}
                className="mb-8 grid gap-4 border border-[#EADDD6] bg-white p-6 sm:grid-cols-2"
              >
                <h3 className="font-serif text-2xl sm:col-span-2">
                  {editingId ? "Edit Service" : "Add New Service"}
                </h3>

                <input
                  required
                  minLength={2}
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Service name"
                  aria-label="Service name"
                  className={fieldClass}
                />

                <select
                  value={form.category}
                  onChange={(e) =>
                    updateField("category", e.target.value as ServiceCategory)
                  }
                  aria-label="Service category"
                  className={fieldClass}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  placeholder="Price (BDT)"
                  aria-label="Service price"
                  className={fieldClass}
                />

                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={form.duration}
                  onChange={(e) => updateField("duration", e.target.value)}
                  placeholder="Duration (minutes)"
                  aria-label="Service duration"
                  className={fieldClass}
                />

                <input
                  required
                  type="url"
                  value={form.image}
                  onChange={(e) => updateField("image", e.target.value)}
                  placeholder="Service image URL"
                  aria-label="Service image URL"
                  className={`${fieldClass} sm:col-span-2`}
                />

                <textarea
                  required
                  minLength={10}
                  rows={3}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Service description"
                  aria-label="Service description"
                  className={`${fieldClass} sm:col-span-2`}
                />

                <label className="flex items-center gap-3 text-sm sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => updateField("featured", e.target.checked)}
                  />
                  Featured Service
                </label>

                <div className="flex flex-wrap gap-3 sm:col-span-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-[#984E59] px-6 py-3 text-sm text-white disabled:opacity-60"
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Update Service"
                        : "Add Service"}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="border border-[#E7DAD3] px-6 py-3 text-sm"
                    >
                      Cancel Editing
                    </button>
                  )}
                </div>
              </form>

              <div className="space-y-4">
                {services.length === 0 && (
                  <p className="text-sm text-[#81736E]">No services found.</p>
                )}

                {services.map((service) => (
                  <article
                    key={service._id}
                    className="flex flex-wrap items-center justify-between gap-5 border border-[#EADDD6] bg-white p-5"
                  >
                    <div>
                      <p className="text-xs text-[#A75F66]">
                        {service.category} · {service.duration} min
                      </p>

                      <h3 className="mt-2 font-serif text-xl">
                        {service.name}
                      </h3>

                      <p className="mt-2 font-semibold text-[#984E59]">
                        {currency(service.price)}
                      </p>

                      {service.featured && (
                        <p className="mt-2 text-xs text-[#A75F66]">Featured</p>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => editService(service)}
                        className="border border-[#984E59] px-4 py-2 text-sm text-[#984E59]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={busyId === service._id}
                        onClick={() => void deleteService(service._id)}
                        className="border border-red-300 px-4 py-2 text-sm text-red-600 disabled:opacity-60"
                      >
                        {busyId === service._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {tab === "users" && (
            <section>
              <h2 className="mb-3 font-serif text-3xl">Registered Users</h2>

              <p className="mb-7 text-sm text-[#81736E]">
                View customer accounts registered on SalonBook.
              </p>

              <div className="space-y-4">
                {users.length === 0 && (
                  <p className="text-sm text-[#81736E]">
                    No registered users found.
                  </p>
                )}

                {users.map((user) => (
                  <article
                    key={user._id}
                    className="flex flex-wrap items-center justify-between gap-5 border border-[#EADDD6] bg-white p-5"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F8F0EB] font-serif text-2xl text-[#984E59]">
                        {user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.image}
                            alt={user.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-serif text-xl">{user.name}</h3>

                        <p className="mt-1 break-all text-sm text-[#81736E]">
                          {user.email}
                        </p>

                        <p className="mt-2 text-xs text-[#81736E]">
                          Email:{" "}
                          {user.emailVerified ? "Verified" : "Not verified"}
                        </p>

                        <p className="mt-1 text-xs text-[#81736E]">
                          Joined:{" "}
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString(
                                "en-BD",
                              )
                            : "Unknown"}
                        </p>
                      </div>
                    </div>

                    <span className="bg-[#F8F0EB] px-4 py-2 text-xs font-semibold capitalize text-[#984E59]">
                      {user.role}
                    </span>
                  </article>
                ))}
              </div>
            </section>
          )}

          {tab === "appointments" && (
            <section>
              <h2 className="mb-7 font-serif text-3xl">Manage Appointments</h2>

              <div className="space-y-4">
                {appointments.length === 0 && (
                  <p className="text-sm text-[#81736E]">
                    No appointments found.
                  </p>
                )}

                {appointments.map((appointment) => (
                  <article
                    key={appointment._id}
                    className="flex flex-wrap items-center justify-between gap-5 border border-[#EADDD6] bg-white p-6"
                  >
                    <div>
                      <p className="break-all text-xs text-[#A75F66]">
                        {appointment._id}
                      </p>

                      <h3 className="mt-2 font-serif text-xl">
                        {appointment.serviceName}
                      </h3>

                      <p className="mt-2 text-sm text-[#81736E]">
                        {appointment.customerName}
                      </p>

                      <p className="mt-1 break-all text-sm text-[#81736E]">
                        {appointment.customerEmail}
                      </p>

                      <p className="mt-2 text-sm text-[#81736E]">
                        {appointment.date} · {appointment.time}
                      </p>

                      <p className="mt-2 font-semibold text-[#984E59]">
                        {currency(appointment.price)}
                      </p>

                      <p className="mt-2 text-xs capitalize text-[#81736E]">
                        Payment: {appointment.paymentStatus}
                      </p>
                    </div>

                    <select
                      aria-label={`Status for ${appointment._id}`}
                      value={appointment.status}
                      disabled={
                        busyId === appointment._id ||
                        appointment.status === "cancelled"
                      }
                      onChange={(e) =>
                        void updateAppointment(
                          appointment._id,
                          e.target.value as ApiAppointment["status"],
                        )
                      }
                      className="border border-[#E7DAD3] bg-white px-4 py-3 text-sm capitalize disabled:opacity-60"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
