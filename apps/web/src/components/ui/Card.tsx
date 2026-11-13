import type { HTMLAttributes, ReactNode } from "react";
import { Inbox } from "lucide-react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: "white" | "warm" | "sage";
};

const tones = {
  white: "bg-white",
  warm: "bg-warm",
  sage: "bg-sage/50",
};

export function Card({
  tone = "white",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={`rounded-card border border-line p-6 sm:p-8 ${tones[tone]} ${className}`}
    >
      {children}
    </div>
  );
}

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-card border border-dashed border-line bg-white px-6 py-12 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-warm">
        <Inbox size={21} aria-hidden="true" />
      </span>

      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="type-caption mx-auto mt-2 max-w-sm">
        {description}
      </p>

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}