# 🎓 Classroom — Frontend

A modern **school / classroom management dashboard** for administering departments, subjects, classes, faculty, students and enrollments. Built as a headless [Refine](https://refine.dev) admin panel on top of **React 19 + Vite**, with a [shadcn/ui](https://ui.shadcn.com) design system, role-based access control, charts, and Cloudinary image uploads.

<p align="center">
  <a href="https://classroom-frontend-peach.vercel.app"><b>🔗 Live Demo</b></a> &nbsp;•&nbsp;
  <a href="https://classroom-backend-production-5a9e.up.railway.app/"><b>⚙️ Live API</b></a>
</p>

| | URL |
|---|---|
| **Frontend (Vercel)** | https://classroom-frontend-peach.vercel.app |
| **Backend API (Railway)** | https://classroom-backend-production-5a9e.up.railway.app/ |

---
[README.md](README.md)
## ✨ Features

- **Role-based dashboards** — `admin`, `teacher`, and `student` see different actions. Access is enforced through Refine's `accessControlProvider`, so create / edit / delete buttons appear only for permitted roles.
- **Full CRUD** for Departments, Subjects, Classes and Faculty with list, create, show and edit views.
- **Analytics dashboard** — overview KPI cards plus Recharts visualisations (classes over time, users by role, classes by department, capacity utilisation).
- **Enrollment flows** — students join a class with an invite code; teachers/admins enroll students directly.
- **Authentication** — email & password via [Better Auth](https://www.better-auth.com/), with extra `role` and profile-image fields.
- **Image uploads** — class banners and avatars uploaded to **Cloudinary**.
- **Polished UX** — command palette (`⌘K` / kbar), light/dark themes, toasts, breadcrumbs, data tables with search, filtering and pagination.

---

## 🛠️ Tech Stack

| Area | Technology |
|------|-----------|
| **Framework** | [Refine](https://refine.dev) 5 (headless admin framework) |
| **UI Library** | [React](https://react.dev) 19 |
| **Build Tool** | [Vite](https://vitejs.dev) 6 + TypeScript 5 |
| **Routing** | [React Router](https://reactrouter.com) 7 (`@refinedev/react-router`) |
| **Components** | [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://www.radix-ui.com) primitives |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) 4 + `tailwind-merge`, `class-variance-authority` |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| **Data Fetching** | `@refinedev/rest` data provider → REST backend |
| **Auth** | [Better Auth](https://www.better-auth.com/) React client |
| **Charts** | [Recharts](https://recharts.org) |
| **Media** | [Cloudinary](https://cloudinary.com) (`@cloudinary/react`, `@cloudinary/url-gen`) |
| **Icons** | [Lucide](https://lucide.dev) |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) |
| **Deployment** | [Vercel](https://vercel.com) |

---

## 🧭 How It Works

```
React (Vite)  ──►  Refine core  ──►  Providers  ──►  REST API (Express + Drizzle + Neon)
                                      │
                                      ├─ dataProvider          (@refinedev/rest → /api/*)
                                      ├─ authProvider          (Better Auth: sign-in / up / out)
                                      └─ accessControlProvider  (role → can(resource, action))
```

- **`src/App.tsx`** registers Refine **resources** (`dashboard`, `departments`, `subjects`, `classes`, `users`/Faculty) and wires the route tree. Authenticated routes are wrapped in `<Authenticated>` and rendered inside the app `Layout` (sidebar + header); unauthenticated users are redirected to `/login`.
- **`src/providers/data.ts`** — maps Refine's CRUD calls to the backend REST endpoints (list / create / getOne / update / deleteOne), including query params for search, filtering and pagination.
- **`src/providers/auth.ts`** — wraps the Better Auth client; persists the signed-in user in `localStorage` and exposes identity / permissions to Refine.
- **`src/providers/access-control.ts`** — the single source of truth for permissions:
  - **admin** → full access
  - **teacher** → read everything; create/edit classes & manage enrollments; no deletes
  - **student** → read-only; may create enrollments (join a class)
- **`src/pages/*`** — one folder per resource (`list`, `create`, `edit`, `show`) plus the `dashboard` and `enrollments` flows.

---

## 📸 Screens

> Captured against the seeded demo database.

### Authentication
| Login | Register |
|---|---|
| ![Login](./screenshots/01-login.png) | ![Register](./screenshots/02-register.png) |

### Dashboard
![Dashboard](./screenshots/03-dashboard.png)

### Departments
| List | Create | Show | Edit |
|---|---|---|---|
| ![Departments list](./screenshots/04-departments-list.png) | ![Departments create](./screenshots/05-departments-create.png) | ![Departments show](./screenshots/06-departments-show.png) | ![Departments edit](./screenshots/07-departments-edit.png) |

### Subjects
| List | Create | Show | Edit |
|---|---|---|---|
| ![Subjects list](./screenshots/08-subjects-list.png) | ![Subjects create](./screenshots/09-subjects-create.png) | ![Subjects show](./screenshots/10-subjects-show.png) | ![Subjects edit](./screenshots/11-subjects-edit.png) |

### Classes
| List | Create | Show | Edit |
|---|---|---|---|
| ![Classes list](./screenshots/12-classes-list.png) | ![Classes create](./screenshots/13-classes-create.png) | ![Classes show](./screenshots/14-classes-show.png) | ![Classes edit](./screenshots/15-classes-edit.png) |

### Faculty
| List | Show | Edit |
|---|---|---|
| ![Faculty list](./screenshots/16-faculty-list.png) | ![Faculty show](./screenshots/17-faculty-show.png) | ![Faculty edit](./screenshots/18-faculty-edit.png) |

### Enrollments
| Join a class (invite code) | Enroll a student |
|---|---|
| ![Enrollments join](./screenshots/19-enrollments-join.png) | ![Enrollments create](./screenshots/20-enrollments-create.png) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js ≥ 20**
- The [Classroom backend](https://github.com/sushanth-web/classroom-backend) running locally or deployed
- A [Cloudinary](https://cloudinary.com) account (for image uploads)

### 1. Install
```bash
npm install
```

### 2. Configure environment
Create a `.env` file in the project root:

```env
# Backend REST base — note the trailing /api/
VITE_BACKEND_BASE_URL=http://localhost:8080/api/

# Cloudinary (unsigned upload preset)
VITE_CLOUDINARY_UPLOAD_URL=https://api.cloudinary.com/v1_1/<cloud-name>/image/upload
VITE_CLOUDINARY_CLOUD_NAME=<cloud-name>
VITE_CLOUDINARY_UPLOAD_PRESET=<unsigned-preset>
```

> Environment variables are validated at startup with Zod (`src/providers/constants.ts`) — the app fails fast with a clear message if any are missing or malformed.

### 3. Run
```bash
npm run dev      # start the dev server (Vite via Refine)
npm run build    # production build
npm run start    # preview the production build
```

---

## 📂 Project Structure

```
src/
├── App.tsx                  # Refine setup: resources, routes, providers
├── pages/                   # One folder per resource
│   ├── dashboard.tsx        # KPI cards + Recharts analytics
│   ├── departments/         # list · create · edit · show
│   ├── subjects/            # list · create · edit · show
│   ├── classes/             # list · create · edit · show
│   ├── faculty/             # list · edit · show  (users resource)
│   ├── enrollments/         # join · create · confirm
│   ├── login/  ·  register/ # auth pages
├── providers/
│   ├── data.ts              # REST data provider
│   ├── auth.ts              # Better Auth → Refine auth provider
│   └── access-control.ts    # role-based permissions
├── components/
│   ├── ui/                  # shadcn/ui primitives
│   └── refine-ui/           # Refine layout, forms, data-table, theme
├── lib/                     # auth client, cloudinary, schema, utils
├── constants/  ·  hooks/  ·  types/
```

---

## 🔐 Roles & Permissions

| Action | Admin | Teacher | Student |
|---|:---:|:---:|:---:|
| View all resources | ✅ | ✅ | ✅ |
| Create / edit departments, subjects | ✅ | ❌ | ❌ |
| Create / edit classes | ✅ | ✅ | ❌ |
| Manage enrollments | ✅ | ✅ | join only |
| Delete records | ✅ | ❌ | ❌ |

---

## ☁️ Deployment

Deployed to **Vercel**. `vercel.json` rewrites all paths to `index.html` so client-side routing works on refresh. Set the `VITE_*` environment variables in the Vercel project settings.

---

## 📄 License

MIT
