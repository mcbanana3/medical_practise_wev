import { ArrowUpRight } from "lucide-react";
import { Container } from "./Container";
import { homeContent } from "../../content/home";

const footerLinks = [
  { label: "About the doctor", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Reviews", href: "/reviews" },
  { label: "Contact", href: "/contact" },
  { label: "Appointment information", href: "/#appointments" },
  { label: "Common questions", href: "/#faqs" },
];

export function HomeFooter() {
  return (
    <footer className="border-t border-line bg-warm">
      <Container>
        <div className="grid gap-10 py-14 md:grid-cols-[1.15fr_1fr_1fr]">
          <div>
            <a
              href="/"
              className="inline-block font-serif text-3xl tracking-tight"
            >
              {homeContent.practiceName}
            </a>

            <p className="type-body mt-4 max-w-xs">
              A private medical practice website in development.
              Practice details are awaiting verification.
            </p>

            <p className="type-caption mt-5">
              Preview only · No appointments are being scheduled.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Explore</h2>
            <nav
              aria-label="Footer navigation"
              className="mt-4 flex flex-col items-start gap-1"
            >
              {footerLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="inline-flex min-h-11 items-center gap-2 text-sm text-ink-muted transition-colors hover:text-navy"
                >
                  {item.label}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-semibold">
              Before contacting the practice
            </h2>
            <p className="type-caption mt-5">
              Do not send patient information through this preview.
              Contact details and scheduling arrangements require
              verification before launch.
            </p>
            <p className="type-caption mt-4">
              For a medical emergency in the United States, call 911.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5 border-t border-line py-6 md:flex-row md:items-center md:justify-between">
          <p className="type-caption">
            © {new Date().getFullYear()} · Practice name placeholder
          </p>

          <nav
            aria-label="Legal navigation"
            className="flex flex-wrap gap-x-6 gap-y-2"
          >
            <a
              href="/privacy"
              className="text-link inline-flex min-h-11 items-center text-xs"
            >
              Privacy policy · Draft
            </a>
            <a
              href="/terms"
              className="text-link inline-flex min-h-11 items-center text-xs"
            >
              Terms · Draft
            </a>
          </nav>
        </div>
      </Container>
    </footer>
  );
}