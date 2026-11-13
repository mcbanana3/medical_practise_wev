import type { ReactNode } from "react";
import { Header } from "./Header";
import type { NavigationItem } from "./Header";
import { Footer } from "./Footer";

type PublicLayoutProps = {
  children: ReactNode;
  homeHref: string;
  items: NavigationItem[];
  action: NavigationItem;
};

export function PublicLayout({
  children,
  homeHref,
  items,
  action,
}: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <a
        href="#main"
        className="sr-only fixed left-4 top-4 z-50 rounded-xl bg-white px-5 py-3 font-semibold text-navy shadow-soft focus:not-sr-only"
      >
        Skip to main content
      </a>

      <Header homeHref={homeHref} items={items} action={action} />

      <main id="main" tabIndex={-1} className="flex-1">
        {children}
      </main>

      <Footer items={items} />
    </div>
  );
}