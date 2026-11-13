import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import App from "./app/App";
import HomePage from "./pages/HomePage";
import DesignSystemPage from "./pages/DesignSystemPage";
import { buttonClasses } from "./components/ui/Button";
import "./styles/globals.css";

function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-warm px-6 py-16">
      <div className="max-w-lg text-center">
        <p className="type-eyebrow">Page not found</p>

        <h1 className="type-heading mt-5">
          Let’s find your way back.
        </h1>

        <p className="type-body mt-5">
          This address does not match an available page.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className={buttonClasses()}>
            Return home
          </Link>

          <Link
            to="/design-system"
            className={buttonClasses("secondary")}
          >
            Design system
          </Link>
        </div>

        <Link
          to="/development"
          className="text-link mt-7 inline-flex min-h-11 items-center text-sm"
        >
          API connection check
        </Link>
      </div>
    </main>
  );
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("The root HTML element could not be found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/development" element={<App />} />
        <Route path="/design-system" element={<DesignSystemPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);