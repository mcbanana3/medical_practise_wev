import { useId, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Container } from "./Container";
import { buttonClasses } from "../ui/Button";

export type NavigationItem = {
  label: string;
  href: string;
};

type HeaderProps = {
  homeHref: string;
  items: NavigationItem[];
  action: NavigationItem;
  brandName?: string;
  brandSubtitle?: string;
  homeLabel?: string;
};

export function Header({
  homeHref,
  items,
  action,
  brandName = "Practice.",
  brandSubtitle = "Design-system preview",
  homeLabel = "Practice design system home",
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <Container>
        <div className="flex min-h-22 items-center justify-between gap-5">
          <a
            href={homeHref}
            aria-label={homeLabel}
            className="min-w-0"
          >
            <span className="block truncate font-serif text-2xl tracking-tight">
              {brandName}
            </span>

            <span className="mt-0.5 block text-[0.625rem] uppercase tracking-[0.16em] text-ink-muted">
              {brandSubtitle}
            </span>
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden shrink-0 items-center gap-6 lg:flex"
          >
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-ink-muted transition-colors hover:text-navy"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <a
            href={action.href}
            className={`hidden shrink-0 lg:inline-flex ${buttonClasses("primary", "sm")}`}
          >
            {action.label}
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>

          <button
            ref={menuButtonRef}
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((current) => !current)}
            className="flex size-12 shrink-0 items-center justify-center rounded-full border border-line lg:hidden"
          >
            {menuOpen ? (
              <X size={21} aria-hidden="true" />
            ) : (
              <Menu size={21} aria-hidden="true" />
            )}
          </button>
        </div>

        <nav
          id={menuId}
          aria-label="Mobile navigation"
          hidden={!menuOpen}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              closeMenu();
              menuButtonRef.current?.focus();
            }
          }}
          className="border-t border-line pb-6 pt-3 lg:hidden"
        >
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className="block rounded-xl px-2 py-3 text-base font-medium hover:bg-warm"
            >
              {item.label}
            </a>
          ))}

          <a
            href={action.href}
            onClick={closeMenu}
            className={`mt-4 w-full ${buttonClasses()}`}
          >
            {action.label}
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </nav>
      </Container>
    </header>
  );
}