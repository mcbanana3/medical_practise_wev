import { Info } from "lucide-react";
import type { ReactNode } from "react";

type ContentNoticeProps = {
  title?: string;
  children: ReactNode;
};

export function ContentNotice({
  title = "Content awaiting verification",
  children,
}: ContentNoticeProps) {
  return (
    <aside className="rounded-card border border-line bg-warm p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <Info
          size={19}
          className="mt-0.5 shrink-0 text-sage-ink"
          aria-hidden="true"
        />

        <div>
          <p className="text-sm font-semibold">{title}</p>
          <div className="type-caption mt-2">{children}</div>
        </div>
      </div>
    </aside>
  );
}