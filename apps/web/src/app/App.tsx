import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { healthResponseSchema } from "@private-practice/shared";

type ConnectionState =
  | { status: "loading" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export default function App() {
  const reduceMotion = useReducedMotion();
  const [attempt, setAttempt] = useState(0);
  const [connection, setConnection] = useState<ConnectionState>({
    status: "loading",
  });

  useEffect(() => {
    const controller = new AbortController();
    let timedOut = false;

    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 8000);

    async function checkConnection() {
      try {
        const response = await fetch("/api/v1/health", {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`The API returned HTTP ${response.status}.`);
        }

        const result = healthResponseSchema.safeParse(
          await response.json(),
        );

        if (!result.success) {
          throw new Error("The API returned an unexpected response.");
        }

        if (!controller.signal.aborted) {
          setConnection({
            status: "success",
            message: result.data.message,
          });
        }
      } catch (error) {
        if (controller.signal.aborted && !timedOut) {
          return;
        }

        setConnection({
          status: "error",
          message: timedOut
            ? "The connection timed out. Check that the API server is running."
            : error instanceof Error
              ? error.message
              : "Unable to connect to the local API.",
        });
      } finally {
        window.clearTimeout(timeout);
      }
    }

    void checkConnection();

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);

  function retryConnection() {
    setConnection({ status: "loading" });
    setAttempt((current) => current + 1);
  }

  return (
    <div className="min-h-screen bg-warm">
      <a
        href="#main"
        className="sr-only fixed left-4 top-4 z-50 rounded-lg bg-white px-4 py-3 text-navy shadow-lg focus:not-sr-only"
      >
        Skip to main content
      </a>

      <header className="border-b border-navy/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-6">
          <p className="font-semibold tracking-tight">
            Private Practice
          </p>

          <span className="rounded-full bg-sage px-3 py-1 text-xs font-semibold text-sage-ink">
            Development foundation
          </span>
        </div>
      </header>

      <main
        id="main"
        className="mx-auto max-w-6xl px-6 py-16 sm:py-24"
      >
        <motion.section
          aria-labelledby="page-title"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid items-start gap-12 lg:grid-cols-[1.2fr_1fr]"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sage-ink">
              Phase 2 · Local environment
            </p>

            <h1
              id="page-title"
              className="mt-6 max-w-2xl font-serif text-5xl leading-[1.1] tracking-tight sm:text-6xl"
            >
              A thoughtful foundation for what comes next.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-navy/75">
              React, TypeScript, and Tailwind are running. The connection
              check verifies that this website can communicate with the
              local Cloudflare Worker.
            </p>

            <a
              href="#connection"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 font-semibold text-white transition-colors hover:bg-navy/90"
            >
              View connection status
              <ArrowRight size={18} aria-hidden="true" />
            </a>

            <div className="mt-10 flex items-start gap-3 text-sm leading-6 text-navy/75">
              <ShieldCheck
                className="mt-0.5 shrink-0 text-sage-ink"
                size={20}
                aria-hidden="true"
              />
              <p>
                Development only. Do not enter patient information.
                No medical appointments are being scheduled.
              </p>
            </div>
          </div>

          <section
            id="connection"
            aria-labelledby="connection-title"
            className="scroll-mt-8 rounded-3xl border border-navy/10 bg-white p-7 shadow-sm sm:p-9"
          >
            <p className="text-sm font-medium text-sage-ink">
              System verification
            </p>

            <h2
              id="connection-title"
              className="mt-2 text-2xl font-semibold tracking-tight"
            >
              Website → API
            </h2>

            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="mt-7 min-h-32"
            >
              {connection.status === "loading" && (
                <div className="flex items-start gap-3">
                  <LoaderCircle
                    size={22}
                    className="mt-1 shrink-0 motion-safe:animate-spin"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-semibold">
                      Checking connection…
                    </p>
                    <p className="mt-2 text-sm leading-6 text-navy/75">
                      Waiting for the local API to respond.
                    </p>
                  </div>
                </div>
              )}

              {connection.status === "success" && (
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={22}
                    className="mt-1 shrink-0 text-sage-ink"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-semibold">
                      Connected successfully
                    </p>
                    <p className="mt-2 text-sm leading-6 text-navy/75">
                      {connection.message}
                    </p>
                  </div>
                </div>
              )}

              {connection.status === "error" && (
                <div className="flex items-start gap-3">
                  <TriangleAlert
                    size={22}
                    className="mt-1 shrink-0 text-red-700"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-semibold">
                      Connection unavailable
                    </p>
                    <p className="mt-2 text-sm leading-6 text-navy/75">
                      {connection.message}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-navy/75">
                      Start the API terminal, then try again.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={retryConnection}
              disabled={connection.status === "loading"}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-navy/20 px-5 py-3 text-sm font-semibold transition-colors hover:bg-warm disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={16} aria-hidden="true" />
              Check again
            </button>

            <p className="mt-6 border-t border-navy/10 pt-5 text-xs leading-5 text-navy/65">
              This check confirms API connectivity only. No patient
              database, authentication, or scheduling integration is
              configured.
            </p>
          </section>
        </motion.section>
      </main>
    </div>
  );
}