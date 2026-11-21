export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
  blocked: boolean;
};

export type AdminAppointment = {
  id: string;
  customer: string;
  service: string;
  date: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
};

export type AdminTransaction = {
  id: string;
  customer: string;
  service: string;
  amount: number;
  date: string;
  status: "paid" | "refunded";
};

export const initialUsers: AdminUser[] = [
  {
    id: "U-001",
    name: "Demo Admin",
    email: "admin@example.com",
    role: "admin",
    blocked: false,
  },
  {
    id: "U-002",
    name: "Ayesha Rahman",
    email: "ayesha@example.com",
    role: "customer",
    blocked: false,
  },
  {
    id: "U-003",
    name: "Nusrat Jahan",
    email: "nusrat@example.com",
    role: "customer",
    blocked: false,
  },
];

export const initialAdminAppointments: AdminAppointment[] = [
  {
    id: "SB-1001",
    customer: "Ayesha Rahman",
    service: "Signature Haircut & Styling",
    date: "2026-12-05",
    status: "pending",
  },
  {
    id: "SB-1002",
    customer: "Nusrat Jahan",
    service: "Radiance Facial",
    date: "2026-12-08",
    status: "confirmed",
  },
  {
    id: "SB-1003",
    customer: "Ayesha Rahman",
    service: "Luxury Hair Spa",
    date: "2026-11-12",
    status: "completed",
  },
];

export const initialTransactions: AdminTransaction[] = [
  {
    id: "TXN-001",
    customer: "Ayesha Rahman",
    service: "Luxury Hair Spa",
    amount: 2500,
    date: "2026-11-12",
    status: "paid",
  },
  {
    id: "TXN-002",
    customer: "Nusrat Jahan",
    service: "Bridal Makeup",
    amount: 8500,
    date: "2026-11-15",
    status: "paid",
  },
];
