export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type ServiceCategory = "Hair" | "Facial" | "Nails" | "Makeup" | "Spa";

export type ApiService = {
  _id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  price: number;
  duration: number;
  image: string;
  featured: boolean;
};

export type ApiAppointment = {
  _id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  customerName: string;
  customerEmail: string;
  price: number;
  date: string;
  time: string;
  phone: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus: "unpaid" | "paid";
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const result = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !result.success) {
    throw new Error(result.message || `Request failed (${response.status})`);
  }

  if (result.data === undefined) {
    throw new Error("API response has no data");
  }

  return result.data;
}
