import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  CheckCircle2,
  Layers3,
  MoveUpRight,
  PanelTop,
  Sparkles,
} from "lucide-react";
import { PublicLayout } from "../components/layout/PublicLayout";
import { Container } from "../components/layout/Container";
import { Section } from "../components/layout/Section";
import { Button, buttonClasses } from "../components/ui/Button";
import { Card, EmptyState } from "../components/ui/Card";
import {
  CheckboxField,
  SelectField,
  TextAreaField,
  TextField,
} from "../components/ui/FormField";
import { Dialog } from "../components/ui/Dialog";
import { Reveal } from "../components/ui/Reveal";

const navigation = [
  { label: "Foundations", href: "/design-system#foundations" },
  { label: "Components", href: "/design-system#components" },
  { label: "Forms", href: "/design-system#forms" },
];

const colors = [
  { name: "Deep navy", hex: "#142B3A", className: "bg-navy" },
  { name: "Sage", hex: "#DFE8DF", className: "bg-sage" },
  { name: "Sage ink", hex: "#36513E", className: "bg-sage-ink" },
  { name: "Warm ivory", hex: "#F6F5F1", className: "bg-warm" },
  { name: "Paper", hex: "#FFFFFF", className: "bg-white" },
  { name: "Muted ink", hex: "#52616B", className: "bg-ink-muted" },
];

type FormStatus = "idle" | "loading" | "success";

type FormErrors = {
  label?: string;
  density?: string;
  notes?: string;
  confirmed?: string;
};

export default function DesignSystemPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [density, setDensity] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");

  const formRef = useRef<HTMLFormElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Design System | Private Practice";

    return () => {
      document.title = previousTitle;

      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  function submitPreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (formStatus === "loading") {
      return;
    }

    const nextErrors: FormErrors = {};
    const cleanLabel = label.trim();

    if (cleanLabel.length < 2 || cleanLabel.length > 40) {
      nextErrors.label = "Enter a button label between 2 and 40 characters.";
    }

    if (!["comfortable", "compact"].includes(density)) {
      nextErrors.density = "Choose a layout density.";
    }

    if (notes.length > 240) {
      nextErrors.notes = "Keep design notes to 240 characters or fewer.";
    }

    if (!confirmed) {
      nextErrors.confirmed = "Confirm that this is a design-only preview.";
    }

    setErrors(nextErrors);
    setFormStatus("idle");

    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => {
        formRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus();
      });
      return;
    }

    setFormStatus("loading");

    timerRef.current = setTimeout(() => {
      setFormStatus("success");
      timerRef.current = null;
    }, 700);
  }

  function resetPreview() {
    setLabel("");
    setDensity("");
    setNotes("");
    setConfirmed(false);
    setErrors({});
    setFormStatus("idle");
    firstFieldRef.current?.focus();
  }

  return (
    <PublicLayout
      homeHref="/design-system"
      items={navigation}
      action={{
        label: "Explore the form",
        href: "/design-system#forms",
      }}
    >
      <section className="overflow-hidden bg-warm py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <Reveal>
              <p className="type-eyebrow">
                The visual foundation · Version 01
              </p>

              <h1 className="type-display mt-6 max-w-3xl">
                Quiet confidence.
                <br />
                Considered detail.
              </h1>

              <p className="type-body mt-7 max-w-lg text-lg">
                An editorial design language built around clarity,
                warmth, and room to breathe. Refined enough to feel
                distinctive. Simple enough to use with confidence.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <a href="#foundations" className={buttonClasses()}>
                  Explore the system
                  <ArrowDown size={17} aria-hidden="true" />
                </a>

                <Button
                  variant="secondary"
                  onClick={() => setDialogOpen(true)}
                >
                  Preview a dialog
                  <ArrowUpRight size={17} aria-hidden="true" />
                </Button>
              </div>

              <p className="type-caption mt-6">
                Design preview only. No patient information.
              </p>
            </Reveal>

            <Reveal>
              <div
                aria-label="Photography placeholder composition"
                className="relative rounded-panel border border-line bg-[#e9eee7] p-5 sm:p-7"
              >
                <div className="flex min-h-96 flex-col justify-between rounded-t-[9rem] rounded-b-2xl border border-white/80 bg-gradient-to-br from-white/80 via-[#e1e7dc] to-[#cbd7c8] p-8">
                  <span className="self-start rounded-full border border-navy/15 bg-white/80 px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.15em]">
                    Image placeholder
                  </span>

                  <div>
                    <div
                      aria-hidden="true"
                      className="mb-5 h-14 w-px bg-sage-ink/40"
                    />
                    <p className="max-w-48 font-serif text-3xl leading-tight">
                      Space for an authentic perspective.
                    </p>
                    <p className="mt-4 max-w-56 text-xs leading-6 text-ink-muted">
                      Replace with licensed doctor or practice
                      photography before launch.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-4 text-xs text-ink-muted">
                  <span>Editorial image direction</span>
                  <span>01 / Foundation</span>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <Section
        id="foundations"
        eyebrow="01 · Foundations"
        title="A restrained palette. A clear point of view."
        description="Color supports hierarchy rather than competing with it. Deep text, warm surfaces, and a controlled accent create a calm, cohesive interface."
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {colors.map((color) => (
            <div key={color.name}>
              <div
                aria-hidden="true"
                className={`h-28 rounded-2xl border border-line ${color.className}`}
              />
              <p className="mt-3 text-sm font-semibold">
                {color.name}
              </p>
              <p className="type-caption mt-1">{color.hex}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-8 border-t border-line pt-10 md:grid-cols-2">
          <div>
            <p className="type-eyebrow">Typography</p>
            <h3 className="type-title mt-4">
              Editorial headings.
              <br />
              Effortless reading.
            </h3>
            <p className="type-body mt-5 max-w-md">
              Serif headlines bring character. Clear sans-serif text
              supports navigation, instructions, and longer reading.
              Text sizes adapt without overwhelming smaller screens.
            </p>
          </div>

          <Card tone="warm">
            <p className="type-eyebrow">Rhythm & proportion</p>
            <p className="mt-4 text-sm leading-7 text-ink-muted">
              Spacing follows a 4px base: 4, 8, 12, 16, 24, 32, 48,
              64, 80, and 96px. Sections receive generous separation;
              related controls stay close together.
            </p>
            <p className="mt-4 text-sm leading-7 text-ink-muted">
              Responsive steps: 640, 768, 1024, 1280, and 1536px.
              Content remains bounded at 1200px.
            </p>
          </Card>
        </div>
      </Section>

      <Section
        id="components"
        eyebrow="02 · Components"
        title="Purposeful, from the first interaction."
        description="Reusable building blocks keep future pages consistent without making every section look identical."
        tone="warm"
      >
        <div className="grid gap-5 md:grid-cols-3">
          <Reveal className="h-full">
            <Card className="h-full">
              <PanelTop
                size={23}
                strokeWidth={1.5}
                className="text-sage-ink"
                aria-hidden="true"
              />
              <h3 className="type-title mt-7">Clear hierarchy.</h3>
              <p className="type-body mt-4">
                A strong heading, a concise explanation, and one
                clear next step.
              </p>
              <a
                href="#forms"
                className="text-link mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold"
              >
                Explore form elements
                <MoveUpRight size={16} aria-hidden="true" />
              </a>
            </Card>
          </Reveal>

          <Reveal className="h-full">
            <Card tone="sage" className="h-full">
              <Layers3
                size={23}
                strokeWidth={1.5}
                className="text-sage-ink"
                aria-hidden="true"
              />
              <h3 className="type-title mt-7">Flexible surfaces.</h3>
              <p className="type-body mt-4">
                White and sage cards create contrast without heavy
                shadows or unnecessary decoration.
              </p>
              <Button
                variant="secondary"
                className="mt-7"
                onClick={() => setDialogOpen(true)}
              >
                Open dialog
              </Button>
            </Card>
          </Reveal>

          <Reveal className="h-full">
            <Card className="h-full">
              <Sparkles
                size={23}
                strokeWidth={1.5}
                className="text-sage-ink"
                aria-hidden="true"
              />
              <h3 className="type-title mt-7">Subtle movement.</h3>
              <p className="type-body mt-4">
                Short reveals add polish. Reduced-motion preferences
                remove unnecessary movement.
              </p>
              <a
                href="#foundations"
                className="text-link mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold"
              >
                Revisit foundations
                <MoveUpRight size={16} aria-hidden="true" />
              </a>
            </Card>
          </Reveal>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="type-title">Actions with intention.</h3>
            <p className="type-body mt-3">
              Primary, secondary, and quiet actions share a
              consistent shape and generous touch targets.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => setDialogOpen(true)}>
                Primary
              </Button>
              <Button
                variant="secondary"
                onClick={() => setDialogOpen(true)}
              >
                Secondary
              </Button>
              <Button
                variant="ghost"
                onClick={() => setDialogOpen(true)}
              >
                Quiet action
              </Button>
              <Button disabled>Unavailable</Button>
            </div>

            <p className="type-caption mt-4">
              Active examples open the dialog. The unavailable
              example demonstrates a disabled action.
            </p>
          </Card>

          <EmptyState
            title="Nothing here yet."
            description="Empty states explain what is missing and offer a useful next step rather than presenting a blank panel."
            action={
              <a
                href="#forms"
                className={buttonClasses("secondary", "sm")}
              >
                Explore the preview form
              </a>
            }
          />
        </div>
      </Section>

      <Section
        id="forms"
        eyebrow="03 · Forms & feedback"
        title="Clear instructions. Reassuring feedback."
        description="A design-only form for testing labels, validation, focus, loading, and success. Do not enter personal or medical information."
      >
        <div className="grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <h3 className="type-title">Good forms reduce uncertainty.</h3>

            <ul className="mt-6 space-y-5">
              {[
                "Visible labels remain in place while typing.",
                "Hints explain expectations before submission.",
                "Errors identify the field and how to fix it.",
                "Loading prevents duplicate submissions.",
                "Success confirms exactly what happened.",
              ].map((text) => (
                <li key={text} className="flex gap-3">
                  <CheckCircle2
                    size={18}
                    className="mt-1 shrink-0 text-sage-ink"
                    aria-hidden="true"
                  />
                  <span className="type-body">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <Card tone="warm">
            <form
              ref={formRef}
              noValidate
              onSubmit={submitPreview}
              className="space-y-6"
              aria-busy={formStatus === "loading"}
            >
              <fieldset
                disabled={formStatus === "loading"}
                className="space-y-6"
              >
                <legend className="sr-only">
                  Design preview settings
                </legend>

                <TextField
                  ref={firstFieldRef}
                  label="Preview button label"
                  name="previewLabel"
                  value={label}
                  onChange={(event) => {
                    setLabel(event.target.value);
                    setFormStatus("idle");
                  }}
                  placeholder="For example: Explore the design"
                  hint="Use 2–40 characters. This is not a patient form."
                  maxLength={40}
                  required
                  error={errors.label}
                />

                <SelectField
                  label="Layout density"
                  name="density"
                  value={density}
                  onChange={(event) => {
                    setDensity(event.target.value);
                    setFormStatus("idle");
                  }}
                  required
                  error={errors.density}
                >
                  <option value="">Choose a density</option>
                  <option value="comfortable">Comfortable</option>
                  <option value="compact">Compact</option>
                </SelectField>

                <TextAreaField
                  label="Design notes"
                  name="designNotes"
                  value={notes}
                  onChange={(event) => {
                    setNotes(event.target.value);
                    setFormStatus("idle");
                  }}
                  placeholder="Comments about spacing or visual design only."
                  hint="Optional. Maximum 240 characters."
                  maxLength={240}
                  rows={4}
                  error={errors.notes}
                />

                <CheckboxField
                  label="I understand this is a design-only preview."
                  name="designOnly"
                  checked={confirmed}
                  onChange={(event) => {
                    setConfirmed(event.target.checked);
                    setFormStatus("idle");
                  }}
                  required
                  error={errors.confirmed}
                />
              </fieldset>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  loading={formStatus === "loading"}
                  loadingText="Preparing preview…"
                >
                  Preview settings
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Button>

                <Button
                  variant="ghost"
                  onClick={resetPreview}
                  disabled={formStatus === "loading"}
                >
                  Reset
                </Button>
              </div>

              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                {Object.keys(errors).length > 0 && (
                  <p className="text-sm leading-6 text-danger">
                    Please correct the highlighted fields.
                  </p>
                )}

                {formStatus === "success" && (
                  <div className="rounded-2xl border border-sage-ink/20 bg-sage/60 p-5">
                    <p className="flex items-center gap-2 text-sm font-semibold text-sage-ink">
                      <CheckCircle2 size={18} aria-hidden="true" />
                      Preview prepared
                    </p>
                    <p className="mt-2 text-sm leading-6">
                      Label: “{label.trim()}” · Density: {density}.
                      Nothing was sent to a server or saved.
                    </p>
                  </div>
                )}
              </div>
            </form>
          </Card>
        </div>
      </Section>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="A moment of clarity."
        description="Dialogs keep focused tasks separate from the page. This preview contains no patient information and makes no changes."
      >
        <div className="rounded-2xl bg-warm p-5">
          <p className="type-caption">
            Try Tab, Shift+Tab, and Escape. Keyboard focus stays
            inside the dialog while it is open and returns to its
            trigger when it closes.
          </p>
        </div>

        <div className="mt-7 flex justify-end">
          <Button onClick={() => setDialogOpen(false)}>
            Close preview
          </Button>
        </div>
      </Dialog>
    </PublicLayout>
  );
}