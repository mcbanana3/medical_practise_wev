import { useEffect } from "react";
import type { ReactNode } from "react";
import { Header } from "./Header";
import { HomeFooter } from "./HomeFooter";
import { Container } from "./Container";
import { Reveal } from "../ui/Reveal";
import { homeContent } from "../../content/home";

type PracticeLayoutProps = {
  title: string;
  children: ReactNode;
};

export function PracticeLayout({
  title,
  children,
}: PracticeLayoutProps) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | Private Practice Preview`;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <a
        href="#main"
        className="sr-only fixed left-4 top-4 z-50 rounded-xl bg-white px-5 py-3 font-semibold text-navy shadow-soft focus:not-sr-only"
      >
        Skip to main content
      </a>

      <div className="border-b border-line bg-warm px-5 py-2.5 text-center text-xs leading-5 text-ink-muted">
        Development preview · Unverified practice information ·
        No patient bookings
      </div>

      <Header
        homeHref="/"
        homeLabel="Private practice homepage"
        brandName={homeContent.practiceName}
        brandSubtitle="Private practice · Website preview"
        items={[]}
        action={{
          label: "Appointment information",
          href: "/#appointments",
        }}
      />

      <main id="main" tabIndex={-1} className="flex-1">
        {children}
      </main>

      <HomeFooter />
    </div>
  );
}

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageIntro({
  eyebrow,
  title,
  description,
}: PageIntroProps) {
  return (
    <section className="border-b border-line bg-warm py-16 sm:py-20 lg:py-24">
      <Container>
        <Reveal>
          <div className="max-w-4xl">
            <p className="type-eyebrow">{eyebrow}</p>
            <h1 className="type-display mt-6">{title}</h1>
            <p className="type-body mt-7 max-w-2xl text-lg">
              {description}
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}