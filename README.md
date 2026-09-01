# Kunhīn Musliyār Library & Research Institute (KMLRI)
## Full-Stack Library Management & Research Repository System

A comprehensive, enterprise-ready **Next.js (Frontend)** and **NestJS (Backend)** Library Management System featuring:
- **Client & Public Portal (`kmlri.in`)**: Public website, OPAC faceted catalogue search, digital manuscript folio reader, member self-service portal, research tools, space booking, and citation generator.
- **Librarian & Admin Portal (`admin.kmlri.in` or `/admin`)**: Librarian circulation desk (barcode/RFID rapid checkout & checkin), Dublin Core/MARC21 cataloger, member & role management, and analytics reporting.

---

## 🏗️ Architecture & Monorepo Structure

```
library-software-design/
├── apps/
│   ├── web/                     # Next.js 14+ (App Router, Tailwind CSS, TypeScript)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (public)/    # kmlri.in Public website & OPAC
│   │   │   │   │   ├── page.tsx          # Heritage Homepage
│   │   │   │   │   ├── collections/      # Collections & Holdings
│   │   │   │   │   ├── search/           # Faceted OPAC Search
│   │   │   │   │   ├── items/[id]/       # Digital Folio Reader & Citations
│   │   │   │   │   ├── advanced/         # 8-Field Advanced Search
│   │   │   │   │   ├── services/         # Services & Opening Hours
│   │   │   │   │   ├── news/             # News & Events
│   │   │   │   │   ├── stories/          # Archive Stories
│   │   │   │   │   ├── about/            # History & Stats
│   │   │   │   │   ├── faqs/             # Accordion FAQs
│   │   │   │   │   ├── ask/              # Ask a Librarian Form
│   │   │   │   │   └── account/          # Member Portal (Loans, Holds, Fines)
│   │   │   │   └── admin/       # admin.kmlri.in Librarian Console
│   │   │   │       ├── page.tsx          # Real-time KPI Dashboard
│   │   │   │       ├── circulation/      # Barcode/RFID Issue & Return Desk
│   │   │   │       ├── catalog/          # MARC21/Dublin Core Title Manager
│   │   │   │       ├── members/          # Patron Management & Roles
│   │   │   │       ├── reports/          # Circulation & Usage CSV Exports
│   │   │   │       └── login/            # Staff Login
│   │   │   ├── components/      # Heritage Navbar, TopBar, Footer, AdminSidebar
│   │   │   ├── lib/             # API Client & Auth Context
│   │   │   └── middleware.ts    # Subdomain routing & RBAC redirect guard
│   │   └── package.json
│   │
│   └── api/                     # NestJS Backend API (Modular Architecture, TypeScript)
│       ├── src/
│       │   ├── auth/            # JWT authentication, guards, roles decorator
│       │   ├── catalog/         # Search, faceted aggregation, record CRUD
│       │   ├── circulation/     # Loan checkout/checkin, fines, holds, renewals
│       │   ├── users/           # User profiles, role elevation
│       │   ├── reports/         # Operational metrics & circulation reports
│       │   ├── newsletter/      # Subscriber list management
│       │   └── prisma/          # Prisma database client service
│       ├── prisma/
│       │   ├── schema.prisma    # Relational Database Schema
│       │   └── seed.ts          # Authentic sample data & users
│       └── package.json
│
├── package.json                 # Workspaces Configuration
└── .env.example                 # Environment variables template
```

---

## 🔑 Default Credentials

| Portal | Role | Identifier / Email | Password | Membership ID |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Portal** (`/admin`) | Super Admin | `admin@kmlri.in` | `Admin@123456` | `KMLRI-ADMIN-01` |
| **Admin Portal** (`/admin`) | Librarian | `librarian@kmlri.in` | `Librarian@123456` | `KMLRI-STAFF-02` |
| **Client Portal** (`/account`) | Researcher | `rashid@kmlri.in` | `Member@123456` | `KMLRI-2026-0001` |
| **Client Portal** (`/account`) | Student | `student@kmlri.in` | `Member@123456` | `KMLRI-2026-0002` |

---

## 🚀 Quick Start (Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `apps/api/.env` and `apps/web/.env.local`:
```bash
cp .env.example apps/api/.env
```

### 3. Initialize & Seed Database
```bash
# Generate Prisma Client
npm run prisma:generate

# Run DB Migrations / Push
npm run prisma:migrate

# Seed with KMLRI records, folios, and users
npm run prisma:seed
```

### 4. Run Development Servers
In separate terminal windows or concurrently:
```bash
# Start NestJS Backend API (runs on port 4000)
npm run dev:api

# Start Next.js Frontend (runs on port 3000)
npm run dev:web
```

- Open **Client Portal**: [http://localhost:3000](http://localhost:3000)
- Open **Librarian / Admin Portal**: [http://localhost:3000/admin](http://localhost:3000/admin)
- Backend API is available at: [http://localhost:4000/api](http://localhost:4000/api)

---

## 🌐 Production Deployment (Ubuntu Server / Droplet)

### Subdomain Setup via Nginx / Cloudflare
Set up DNS records:
- `A record` $\rightarrow$ `kmlri.in` $\rightarrow$ Server IP
- `A record` $\rightarrow$ `admin.kmlri.in` $\rightarrow$ Server IP

### Nginx Configuration Template
```nginx
# Client Portal
server {
    server_name kmlri.in www.kmlri.in;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Admin Portal
server {
    server_name admin.kmlri.in;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    server_name api.kmlri.in;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
