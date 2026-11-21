export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid";

export type Appointment = {
  id: string;
  serviceName: string;
  date: string;
  time: string;
  price: number;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
};

export const initialAppointments: Appointment[] = [
  {
    id: "SB-1001",
    serviceName: "Signature Haircut & Styling",
    date: "2026-12-05",
    time: "10:00 AM",
    price: 1800,
    status: "pending",
    paymentStatus: "unpaid",
  },
  {
    id: "SB-1002",
    serviceName: "Radiance Facial",
    date: "2026-12-08",
    time: "02:00 PM",
    price: 2200,
    status: "confirmed",
    paymentStatus: "unpaid",
  },
  {
    id: "SB-1003",
    serviceName: "Luxury Hair Spa",
    date: "2026-11-12",
    time: "11:00 AM",
    price: 2500,
    status: "completed",
    paymentStatus: "paid",
  },
  {
    id: "SB-1004",
    serviceName: "Classic Manicure",
    date: "2026-11-15",
    time: "03:00 PM",
    price: 1200,
    status: "cancelled",
    paymentStatus: "unpaid",
  },
];
