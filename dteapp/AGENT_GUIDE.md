# Project: Role-Based Dashboard System (DTE Portal)

This document serves as a guide for any AI agent or developer working on this codebase to understand the architecture and design decisions.

## 🏗️ Architecture: Clean & Modular
The project follows a feature-based modular structure to ensure scalability and separation of concerns.

### Folder Structure Overview
- `src/app/`: Core application setup (Redux Store).
- `src/features/`: Domain-specific logic and UI.
  - `auth/`: Login, registration, auth slices.
  - `admin/`, `principal/`, `ro/`, `candidate/`: Role-specific dashboards and components.
  - `ui/`, `user/`: Global state slices for UI and user profile.
- `src/components/`: Reusable components.
  - `common/`: Low-level UI atoms (Button, Input, Table).
  - `layout/`: Main application shells (Sidebar, Topbar, Layout).
- `src/routes/`: Routing logic and Auth guards.
- `src/theme/`: Global styling tokens and configuration.
- `src/services/`: Mock API and external service definitions.
- `src/constants/`: Enums and static configuration (ROLES, ROUTES).

## 🔐 Auth & Security
- **Role-Based Access Control (RBAC)**: Implemented via `ProtectedRoute.jsx`.
- **State Management**: Redux Toolkit manages the `auth` state.
- **Persistence**: Token and User data are stored in `localStorage` for session persistence.
- **Mocking**: Auth logic is currently simulated in `authSlice.js` using `createAsyncThunk`.

## 🎨 Styling (Tailwind CSS v4)
- **Engine**: Tailwind CSS v4 using `@tailwindcss/vite`.
- **Config**: Theme tokens are defined in `src/index.css` using the `@theme` block.
- **Dark Mode**: Managed via the `.dark` class on the root element. Logic resides in `uiSlice.js`.
- **Professionalism**: Colors are restricted to a professional palette (Slate/Gray, Blue/Indigo accents).

## 🚀 Key Patterns
- **Layouts**: Using React Router `<Outlet />` for nested dashboard routing.
- **Reusable Components**: Table and Form components are highly generic to support different data models.
- **CSS Utility**: `src/utils/cn.js` (clsx + tailwind-merge) is used for dynamic class generation.

## 🤖 AI Agent Notes
- If adding a new role: 
  1. Add to `src/constants/roles.js`.
  2. Create a folder in `src/features/`.
  3. Update `Sidebar.jsx` navigation.
  4. Add routes to `App.jsx`.
- To modify colors: Edit `src/index.css` under `@theme`.
