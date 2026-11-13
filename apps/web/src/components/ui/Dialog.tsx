import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: ReactNode;
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!open || !dialog) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    if (!dialog.open) {
      dialog.showModal();
    }

    return () => {
      if (dialog.open) {
        dialog.close();
      }

      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-panel border border-line bg-white p-6 text-navy shadow-2xl sm:p-9"
    >
      <div className="flex items-start justify-between gap-5">
        <h2 id={titleId} className="type-title">
          {title}
        </h2>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="-mr-2 -mt-2 flex size-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-warm"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <p id={descriptionId} className="type-body mt-4">
        {description}
      </p>

      <div className="mt-7">{children}</div>
    </dialog>
  );
}