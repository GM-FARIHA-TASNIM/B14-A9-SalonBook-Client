import { initialAppointments, type Appointment } from "@/data/appointments";

const STORAGE_KEY = "salonbook-demo-appointments";

export function getAppointments(): Appointment[] {
  if (typeof window === "undefined") {
    return initialAppointments;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [...initialAppointments];
    }

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [...initialAppointments];
    }

    return parsed as Appointment[];
  } catch {
    return [...initialAppointments];
  }
}

export function saveAppointments(appointments: Appointment[]): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));

  window.dispatchEvent(new Event("salonbook-bookings-updated"));
}

export function addAppointment(appointment: Appointment): void {
  const currentAppointments = getAppointments();

  saveAppointments([appointment, ...currentAppointments]);
}
