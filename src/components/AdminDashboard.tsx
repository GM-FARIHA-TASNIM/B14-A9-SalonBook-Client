"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { services, type SalonService } from "@/data/services";
import {
  initialUsers,
  initialAdminAppointments,
  initialTransactions,
  type AdminUser,
  type AdminAppointment,
} from "@/data/admin";

type Tab = "overview" | "services" | "users" | "appointments" | "transactions";

const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "services", label: "Manage Services" },
  { id: "users", label: "Manage Users" },
  { id: "appointments", label: "Appointments" },
  { id: "transactions", label: "Transactions" },
];

const currency = (value: number) => `৳${value.toLocaleString("en-BD")}`;

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [serviceList, setServiceList] = useState<SalonService[]>(services);
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [appointments, setAppointments] = useState<AdminAppointment[]>(
    initialAdminAppointments,
  );
  const [notice, setNotice] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceCategory, setServiceCategory] =
    useState<SalonService["category"]>("Hair");
  const [serviceDuration, setServiceDuration] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [serviceImage, setServiceImage] = useState("");

  const revenue = initialTransactions
    .filter((transaction) => transaction.status === "paid")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const resetForm = () => {
    setEditingId(null);
    setServiceName("");
    setServicePrice("");
    setServiceCategory("Hair");
    setServiceDuration("");
    setServiceDescription("");
    setServiceImage("");
  };

  const saveService = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const price = Number(servicePrice);
    const duration = Number(serviceDuration);

    if (
      !serviceName.trim() ||
      !serviceDescription.trim() ||
      !serviceImage.trim() ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isFinite(duration) ||
      duration <= 0
    ) {
      setNotice("Please enter valid service information.");
      return;
    }

    const updatedService: SalonService = {
      id: editingId ?? `demo-${Date.now()}`,
      name: serviceName.trim(),
      category: serviceCategory,
      description: serviceDescription.trim(),
      price,
      duration,
      image: serviceImage.trim(),
      featured: false,
    };

    if (editingId) {
      setServiceList((previous) =>
        previous.map((item) => (item.id === editingId ? updatedService : item)),
      );
    } else {
      setServiceList((previous) => [...previous, updatedService]);
    }

    setNotice(
      editingId
        ? "Demo service updated successfully."
        : "Demo service added successfully.",
    );

    resetForm();
  };

  const editService = (service: SalonService) => {
    setEditingId(service.id);
    setServiceName(service.name);
    setServicePrice(String(service.price));
    setServiceCategory(service.category);
    setServiceDuration(String(service.duration));
    setServiceDescription(service.description);
    setServiceImage(service.image);
    setNotice("");
  };

  const deleteService = (id: string) => {
    if (!window.confirm("Delete this demo service?")) return;

    setServiceList((previous) => previous.filter((item) => item.id !== id));

    if (editingId === id) resetForm();

    setNotice("Demo service deleted successfully.");
  };

  const toggleBlock = (id: string) => {
    const selectedUser = users.find((user) => user.id === id);

    if (!selectedUser || selectedUser.role === "admin") return;

    setUsers((previous) =>
      previous.map((user) =>
        user.id === id ? { ...user, blocked: !user.blocked } : user,
      ),
    );

    setNotice(
      selectedUser.blocked ? "Demo user unblocked." : "Demo user blocked.",
    );
  };

  const updateAppointment = (
    id: string,
    status: AdminAppointment["status"],
  ) => {
    setAppointments((previous) =>
      previous.map((item) => (item.id === id ? { ...item, status } : item)),
    );

    setNotice("Demo appointment status updated.");
  };

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
                  setNotice("");
                }}
                className={`px-4 py-3 text-left text-sm ${
                  tab === item.id
                    ? "bg-[#984E59] text-white"
                    : "text-[#665B58] hover:bg-[#F8F0EB]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <Link
            href="/"
            className="mt-7 block border border-[#984E59] px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#984E59]"
          >
            Back to Website
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

          {tab === "overview" && (
            <section>
              <h2 className="mb-8 font-serif text-3xl">Dashboard Overview</h2>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Total Services", value: serviceList.length },
                  { label: "Total Users", value: users.length },
                  {
                    label: "Appointments",
                    value: appointments.length,
                  },
                  { label: "Demo Revenue", value: currency(revenue) },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="border border-[#EADDD6] bg-white p-6"
                  >
                    <p className="text-xs text-[#81736E]">{stat.label}</p>
                    <p className="mt-4 font-serif text-3xl text-[#984E59]">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 border border-[#EADDD6] bg-white p-7">
                <h3 className="font-serif text-2xl">Salon Management</h3>
                <p className="mt-3 text-sm leading-7 text-[#81736E]">
                  Use the sidebar to manage services, customer accounts,
                  appointment requests, and transaction history.
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
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="Service name"
                  aria-label="Service name"
                  className="border border-[#E7DAD3] p-3 text-sm"
                />

                <select
                  value={serviceCategory}
                  onChange={(e) =>
                    setServiceCategory(
                      e.target.value as SalonService["category"],
                    )
                  }
                  aria-label="Service category"
                  className="border border-[#E7DAD3] p-3 text-sm"
                >
                  {["Hair", "Facial", "Nails", "Makeup", "Spa"].map(
                    (category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ),
                  )}
                </select>

                <input
                  required
                  type="number"
                  min="1"
                  value={servicePrice}
                  onChange={(e) => setServicePrice(e.target.value)}
                  placeholder="Price (BDT)"
                  aria-label="Service price"
                  className="border border-[#E7DAD3] p-3 text-sm"
                />

                <input
                  required
                  type="number"
                  min="1"
                  value={serviceDuration}
                  onChange={(e) => setServiceDuration(e.target.value)}
                  placeholder="Duration (minutes)"
                  aria-label="Service duration"
                  className="border border-[#E7DAD3] p-3 text-sm"
                />

                <input
                  required
                  type="url"
                  value={serviceImage}
                  onChange={(e) => setServiceImage(e.target.value)}
                  placeholder="Service image URL"
                  aria-label="Service image URL"
                  className="border border-[#E7DAD3] p-3 text-sm sm:col-span-2"
                />

                <textarea
                  required
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  placeholder="Service description"
                  aria-label="Service description"
                  rows={3}
                  className="border border-[#E7DAD3] p-3 text-sm sm:col-span-2"
                />

                <div className="flex flex-wrap gap-3 sm:col-span-2">
                  <button
                    type="submit"
                    className="bg-[#984E59] px-6 py-3 text-sm text-white"
                  >
                    {editingId ? "Update Service" : "Add Service"}
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
                {serviceList.map((service) => (
                  <article
                    key={service.id}
                    className="flex flex-wrap items-center justify-between gap-5 border border-[#EADDD6] bg-white p-5"
                  >
                    <div>
                      <p className="text-xs text-[#A75F66]">
                        {service.category} · {service.duration} min
                      </p>
                      <h3 className="mt-2 font-serif text-xl">
                        {service.name}
                      </h3>
                      <p className="mt-2 text-sm font-semibold text-[#984E59]">
                        {currency(service.price)}
                      </p>
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
                        onClick={() => deleteService(service.id)}
                        className="border border-red-300 px-4 py-2 text-sm text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {tab === "users" && (
            <section>
              <h2 className="mb-7 font-serif text-3xl">Manage Users</h2>

              <div className="space-y-4">
                {users.map((user) => (
                  <article
                    key={user.id}
                    className="flex flex-wrap items-center justify-between gap-4 border border-[#EADDD6] bg-white p-6"
                  >
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="mt-1 text-sm text-[#81736E]">
                        {user.email}
                      </p>
                      <p className="mt-2 text-xs capitalize text-[#984E59]">
                        {user.role} · {user.blocked ? "Blocked" : "Active"}
                      </p>
                    </div>

                    {user.role !== "admin" && (
                      <button
                        type="button"
                        onClick={() => toggleBlock(user.id)}
                        className="border border-[#984E59] px-5 py-2.5 text-sm text-[#984E59]"
                      >
                        {user.blocked ? "Unblock" : "Block"}
                      </button>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {tab === "appointments" && (
            <section>
              <h2 className="mb-7 font-serif text-3xl">Manage Appointments</h2>

              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <article
                    key={appointment.id}
                    className="flex flex-wrap items-center justify-between gap-5 border border-[#EADDD6] bg-white p-6"
                  >
                    <div>
                      <p className="text-xs text-[#A75F66]">{appointment.id}</p>
                      <h3 className="mt-2 font-serif text-xl">
                        {appointment.service}
                      </h3>
                      <p className="mt-2 text-sm text-[#81736E]">
                        {appointment.customer} · {appointment.date}
                      </p>
                    </div>

                    <select
                      aria-label={`Status for ${appointment.id}`}
                      value={appointment.status}
                      onChange={(e) =>
                        updateAppointment(
                          appointment.id,
                          e.target.value as AdminAppointment["status"],
                        )
                      }
                      className="border border-[#E7DAD3] bg-white px-4 py-3 text-sm capitalize"
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

          {tab === "transactions" && (
            <section>
              <h2 className="mb-7 font-serif text-3xl">Transactions</h2>

              <div className="overflow-x-auto border border-[#EADDD6] bg-white">
                <table className="w-full min-w-160 text-left text-sm">
                  <thead className="bg-[#F8F0EB]">
                    <tr>
                      {[
                        "Transaction",
                        "Customer",
                        "Service",
                        "Amount",
                        "Status",
                      ].map((heading) => (
                        <th key={heading} className="px-5 py-4 font-semibold">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {initialTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-t border-[#EADDD6]"
                      >
                        <td className="px-5 py-4">{transaction.id}</td>
                        <td className="px-5 py-4">{transaction.customer}</td>
                        <td className="px-5 py-4">{transaction.service}</td>
                        <td className="px-5 py-4">
                          {currency(transaction.amount)}
                        </td>
                        <td className="px-5 py-4 capitalize">
                          {transaction.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
