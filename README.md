# SalonBook — Salon Appointment Booking Platform

SalonBook is a modern, full-stack salon appointment booking platform designed to make beauty and wellness services easier to discover, book, and manage.

Built with a clean, responsive interface, SalonBook provides a smooth booking experience for customers and an efficient management dashboard for administrators.

## Features

### Customer Features
- Explore salon services by category.
- View detailed service information, pricing, and duration.
- Create an account and securely sign in.
- Book appointments by selecting a preferred date and time.
- View and manage personal appointments.
- Cancel eligible unpaid appointments.
- Complete payments through Stripe Checkout.
- Manage personal profile information.

### Admin Features
- Access a role-based admin dashboard.
- Add, update, and delete salon services.
- View registered users.
- Monitor customer appointments.
- Confirm and manage appointment statuses.
- Track booking and payment information.

## Technologies Used

**Frontend**
- Next.js
- React
- TypeScript
- Tailwind CSS

**Backend**
- Node.js
- Express.js
- MongoDB Atlas
- Better Auth
- Stripe Checkout

## Authentication and Security

SalonBook uses Better Auth for user authentication and role-based access control for customer and administrator features.

Payment processing is handled through Stripe Checkout, with server-side webhook verification.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/GM-FARIHA-TASNIM/b14-a9-salonbook-client.git
cd b14-a9-salonbook-client
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 4. Start the development server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

**Note:** The frontend requires the SalonBook backend API to be running for authentication, booking, and payment features.

## Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas
- **Payments:** Stripe Sandbox

The deployed frontend must use the public backend URL in `NEXT_PUBLIC_API_URL`.

## Project Repositories

**Frontend:** https://github.com/GM-FARIHA-TASNIM/b14-a9-salonbook-client

**Backend:** Add the backend repository URL here.

## Author

**Fariha Tasnim**

GitHub: https://github.com/GM-FARIHA-TASNIM

---

Developed as part of Programming Hero — Assignment 9.
