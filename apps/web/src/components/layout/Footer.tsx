import { ArrowUpRight } from "lucide-react";
import { Container } from "./Container";
import type { NavigationItem } from "./Header";

type FooterProps = {
  items: NavigationItem[];
};

export function Footer({ items }: FooterProps) {
  return (
    <footer className="border-t border-line bg-warm">
      <Container>
        <div className="grid gap-10 py-14 md:grid-cols-[1.3fr_1fr]">
          <div className="max-w-sm">
            <p className="font-serif text-3xl tracking-tight">
              Practice.
            </p>
            <p className="type-body mt-4">
              A considered visual foundation for a future private
              medical practice website.
            </p>
            <p className="type-caption mt-4">
              Design preview only. No medical services or appointment
              bookings are offered here.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="grid content-start gap-3 sm:grid-cols-2"
          >
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex min-h-11 items-center gap-2 text-sm font-medium hover:underline"
              >
                {item.label}
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            ))}

            <a
              href="/"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium hover:underline"
            >
              API connection check
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </nav>
        </div>

        <div className="flex flex-col gap-3 border-t border-line py-6 sm:flex-row sm:justify-between">
          <p className="type-caption">
            {new Date().getFullYear()} · Development preview
          </p>
          <p className="type-caption max-w-md">
            Verified practice details and reviewed legal pages will
            be added before launch.
          </p>
        </div>
      </Container>
    </footer>
  );
}