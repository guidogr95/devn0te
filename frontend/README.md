<div align="center">

```
╔═══════════════════════════════════════╗
║  devn0te / frontend                   ║
║  React 19 SPA                         ║
╚═══════════════════════════════════════╝
```

[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite 6](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-764ABC?logo=redux&logoColor=white)](https://redux-toolkit.js.org/)

</div>

---

The frontend for devn0te. A React 19 single-page app built with Vite 6, TypeScript 5, Redux Toolkit, TanStack Router, and Monaco editor. Notes live in an OPFS-backed SQLite database inside a Web Worker (the local source of truth) and sync to the Laravel backend when you're online.

---

## Setup

### Prerequisites

- [Node.js 20+](https://nodejs.org/)

### Install and run

```sh
cd frontend

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app is now running at **http://localhost:5173**.

> **Note:** The backend must be running at the URL specified in `VITE_API_BASE_URL` for API calls to work. See the root [README](../README.md) for backend setup.

---

## Environment Variables

| Variable            | Purpose                             | Required | Default                 |
|---------------------|-------------------------------------|----------|-------------------------|
| `VITE_API_BASE_URL` | Base URL of the Laravel backend API | Yes      | `http://localhost:8000` |

---

## Scripts

| Command            | Description                                         |
|--------------------|-----------------------------------------------------|
| `npm run dev`      | Start the Vite dev server with HMR                  |
| `npm run start`    | Start the dev server bound to `0.0.0.0` (for Docker)|
| `npm run build`    | Type-check with `tsc` then build for production      |
| `npm run preview`  | Preview the production build locally                 |
| `npm run lint`     | Run ESLint                                           |
| `npm run test`     | Run Vitest in watch mode                             |
| `npm run test:run` | Run Vitest once (CI-friendly)                        |

---

## Module Structure

The app is organized into feature modules. Each module follows the same internal layout:

```
modules/{name}/
├── core/          Types, entities, response shapes: no framework code
├── hooks/         Dispatch wrappers and state selectors exposed to UI
├── interface/
│   └── adapters/  HTTP adapters (static classes)
├── redux/
│   ├── middleware/
│   ├── selector/
│   └── slice/
└── ui/            React components and their local hooks
```

### Modules

```
frontend/src/modules/
├── auth/          Authentication (register, login)
├── config/        App configuration
├── connectors/    GitHub connector management
├── console/       In-app terminal
├── dashboard/     Dashboard layout and navigation
├── login/         Login page
├── nodes/         Graph view (reagraph)
├── notes/         Note editor, list, preview, sharing
└── shared/        Public shared-note viewer
```

### Routing

Routes are file-based via TanStack Router:

```
frontend/src/routes/
├── __root.tsx                         Root layout
├── index.lazy.tsx                     /
├── login.lazy.tsx                     /login
├── dashboard.lazy.tsx                 /dashboard
├── dashboard/
│   ├── index.lazy.tsx                 /dashboard
│   ├── notes.lazy.tsx                 /dashboard/notes
│   ├── notes/$id.lazy.tsx             /dashboard/notes/:id
│   ├── nodes/{-$id}.lazy.tsx          /dashboard/nodes/:id
│   └── settings.lazy.tsx              /dashboard/settings
└── shared/$id.lazy.tsx                /shared/:id
```

---

## Testing

```sh
# Lint
npm run lint

# Type check
npx tsc -b

# Build
npm run build

# Tests (Vitest)
npm run test:run
```

---

## Tech Stack

| Library               | Purpose                                     |
|-----------------------|---------------------------------------------|
| React 19              | UI framework                                |
| Vite 6                | Build tool and dev server                   |
| TypeScript 5          | Type safety                                 |
| Redux Toolkit         | State management                            |
| TanStack Router       | File-based routing                          |
| TanStack Query        | Server-state caching                        |
| Monaco Editor         | Markdown editing with syntax highlighting   |
| react-markdown        | Markdown rendering (GFM, raw HTML, highlight)|
| reagraph              | Interactive graph visualization             |
| fuse.js               | Fuzzy search fallback                       |
| fflate                | Zip compression for import/export           |
| shadcn/ui             | Component library (Radix + Tailwind)        |
| sonner                | Toast notifications                         |
| zod                   | Schema validation                           |
| vite-plugin-wasm      | WebAssembly support for SQLite              |
| Vitest                | Test runner                                 |
| ESLint                | Linting                                     |

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
