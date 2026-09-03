# Caramel Vibe (caramel.vibe)

> **Curated Pre-Loved Luxury Bags & Private Atelier Appointments**

**Caramel Vibe** is a full-stack luxury boutique and atelier web application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS v4**, and **Supabase**. It provides a storefront for vintage and archival handbags, private session booking, a client portal, and an administrative console for clinic and studio operations.

---

## 🛠 Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server & Client Components, Server Actions, Route Handlers)
- **UI Library**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom inline luxury tokens (Georgia serif display typography, warm terracotta, espresso, and honey palette)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend & Database**: [Supabase](https://supabase.com/)
  - **Database**: PostgreSQL with Row-Level Security (RLS) & DB Triggers
  - **Auth**: GoTrue Session Cookies, Role-Based Access Control (Admin, Client, User)
  - **Storage**: Media buckets for session photography and user avatars
  - **Edge Functions**: Transactional notifications (booking confirmation, cancellation, waitlist alerts)
- **Monitoring & Observability**: [Sentry](https://sentry.io/) (`@sentry/nextjs`)
- **Package Manager**: [pnpm](https://pnpm.io/)

---

## 🏛 Application Structure & Portals

```
caramel-vibe/
├── app/
│   ├── (public)/              # Public Storefront & Catalog
│   │   ├── page.tsx           # Home & Handbag Edit Showcase
│   │   └── sessions/          # Private Sessions & Booking Checkout (/sessions/[slug])
│   ├── (client)/client/       # Authenticated Client Portal
│   │   ├── dashboard/         # Upcoming appointments, countdown & stats
│   │   ├── bookings/          # Bookings history, .ics export & cancellation
│   │   └── profile/           # Profile settings & avatar upload
│   ├── (admin)/admin/         # Operational Admin Console
│   │   ├── dashboard/         # KPIs, live attendance & revenue metrics
│   │   ├── sessions/          # Sessions CRUD, calendar availability & roster
│   │   ├── session-types/     # Reusable service catalog templates
│   │   ├── bookings/          # Master bookings ledger with CSV export
│   │   ├── clients/           # Client directory, RBAC & moderation (ban/reject)
│   │   ├── reporting/         # Capacity utilization & revenue reports
│   │   ├── logs/              # Audit logs & login history
│   │   └── settings/          # Atelier settings & policy thresholds
│   ├── api/                   # Route handlers (auth callback, login tracking, notifications)
│   ├── globals.css            # Custom design tokens and typography
│   └── layout.tsx             # Root layout with top-left toast provider
├── components/
│   ├── ui/                    # Reusable Shadcn-styled primitives (Button, Dialog, Badge, Input, Toast)
│   └── layout/                # Headers & sidebars (PublicHeader, ClientHeader, AdminSidebar)
├── lib/
│   ├── supabase/              # Browser, server, middleware Supabase clients & TS types
│   └── products.ts            # Featured catalog data
├── IMPLEMENTATION_PLAN.md     # Detailed architecture & database implementation plan
└── package.json
```

---

## 🎨 Brand Design Tokens

The application follows an editorial luxury aesthetic inspired by warm cognac leather, terracotta, linen, and espresso tones:

- **`background`**: `#f8f3eb` (Warm Linen Cream)
- **`foreground`**: `#3b2720` (Deep Espresso Roast)
- **`card` / `surface`**: `#fffaf3` (Warm Alabaster)
- **`primary`**: `#a85d35` (Caramel Terracotta)
- **`accent`**: `#c99555` (Golden Caramel Honey)
- **`border`**: `#dfcdbb` (Warm Tan Hairline)
- **`destructive`**: `#9e3b32` (Terracotta Crimson)
- **`success`**: `#3e6b48` (Forest Sage)

---

## 🚀 Getting Started for Developers

### 1. Prerequisites
- Node.js (v20+ recommended)
- `pnpm` (v9+)

### 2. Installation
```bash
# Clone the repository
git clone <repo-url>
cd caramel-vibe

# Install dependencies
pnpm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-supabase-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### 4. Running the Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

### 5. Build for Production
```bash
pnpm build
pnpm start
```

---

## 📋 Key Architecture Notes

1. **Role-Based Access Control (RBAC)**:
   - `user`: Registered member who has not yet completed a booking.
   - `client`: Automatically upgraded from `user` upon placing their first session reservation.
   - `admin`: Full operational control over inventory, pricing, availability rules, and client moderation.
2. **On-Premise Settlement**:
   - Appointments default to on-premise payment (`pending_on_premise`, `paid_on_premise`, `waived`).
   - The schema is designed for seamless Stripe online payment activation in future releases.
3. **Session Availability Engine**:
   - Weekly recurring availability windows combined with specific date blackout exceptions (holidays, private events).
4. **Toast System**:
   - Fixed to the **Top-Left** (`top-4 left-4 z-50`) across all public, client, and admin routes.
5. **Implementation Reference**:
   - See [IMPLEMENTATION_PLAN.md](file:///Users/admin/caramel-vibe/IMPLEMENTATION_PLAN.md) for the complete database ERD, table definitions, and edge function workflows.