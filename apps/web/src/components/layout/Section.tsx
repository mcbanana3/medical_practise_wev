import type { ReactNode } from "react";
import { Container } from "./Container";

type SectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  tone?: "white" | "warm";
  children: ReactNode;
};

export function Section({
  id,
  eyebrow,
  title,
  description,
  tone = "white",
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`py-16 sm:py-20 lg:py-24 ${
        tone === "warm" ? "bg-warm" : "bg-white"
      }`}
    >
      <Container>
        <div className="mb-10 max-w-2xl sm:mb-12">
          <p className="type-eyebrow">{eyebrow}</p>
          <h2 id={`${id}-title`} className="type-heading mt-4">
            {title}
          </h2>

          {description && (
            <p className="type-body mt-5">{description}</p>
          )}
        </div>

        {children}
      </Container>
    </section>
  );
}