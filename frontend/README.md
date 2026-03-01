# Breach Frontend

A modern React + TypeScript + Tailwind CSS frontend application.

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **React Router v6** - Client-side routing

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── pages/          # Page components
│   │   ├── HomePage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── DatasetsPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── layouts/        # Layout components
│   │   └── MainLayout.tsx
│   ├── services/       # API services (ready for backend integration)
│   ├── assets/         # Static assets (images, fonts, etc.)
│   ├── App.tsx         # Main app component with routing
│   ├── main.tsx        # Application entry point
│   └── index.css       # Global styles with Tailwind
├── index.html          # HTML entry point
├── package.json
├── tsconfig.json       # TypeScript configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── vite.config.ts      # Vite configuration
```

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

### Use Ollama For Dataset Chat

1. Copy env template:

```bash
cp .env.example .env.local
```

2. Ensure Ollama is running and model is available:

```bash
ollama serve
ollama pull gpt-oss:120b-cloud
```

3. Start the frontend and open a dataset quality breakdown page. The chat panel will call Ollama at `VITE_OLLAMA_BASE_URL`.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Available Routes

- `/` - Home page
- `/dashboard` - Dashboard overview
- `/datasets` - Datasets listing
- `*` - 404 Not Found page

## Features

✅ Modern React with TypeScript
✅ Tailwind CSS configured and ready
✅ React Router with multiple pages
✅ Responsive layout with header and footer
✅ Dark theme design
✅ Scalable folder structure
✅ Clean, production-ready code

## Next Steps

The project structure is ready for:
- Backend API integration (via `src/services/`)
- Adding more components
- Implementing authentication
- Building dashboard features
- Adding dataset management features

## Notes

- No backend integration yet - the project is frontend-only
- All pages are placeholder components ready to be expanded
- The `services/` directory is prepared for future API calls
- Tailwind CSS is configured with dark theme as default
