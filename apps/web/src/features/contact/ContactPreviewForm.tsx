import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import { Button } from "../../components/ui/Button";
import {
  CheckboxField,
  SelectField,
} from "../../components/ui/FormField";

type Status = "idle" | "loading" | "success" | "error";

type Errors = {
  topic?: string;
  outcome?: string;
  acknowledged?: string;
};

export function ContactPreviewForm() {
  const [topic, setTopic] = useState("");
  const [outcome, setOutcome] = useState("success");
  const [acknowledged, setAcknowledged] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");

  const formRef = useRef<HTMLFormElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status === "loading") {
      return;
    }

    const nextErrors: Errors = {};

    if (!["appointments", "services", "location"].includes(topic)) {
      nextErrors.topic = "Choose an information topic.";
    }

    if (!["success", "error"].includes(outcome)) {
      nextErrors.outcome = "Choose a valid preview outcome.";
    }

    if (!acknowledged) {
      nextErrors.acknowledged =
        "Confirm that this preview does not contact the practice.";
    }

    setErrors(nextErrors);
    setStatus("idle");

    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => {
        formRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus();
      });
      return;
    }

    setStatus("loading");

    timerRef.current = setTimeout(() => {
      setStatus(outcome === "error" ? "error" : "success");
      timerRef.current = null;
    }, 700);
  }

  function reset() {
    setTopic("");
    setOutcome("success");
    setAcknowledged(false);
    setErrors({});
    setStatus("idle");

    formRef.current
      ?.querySelector<HTMLSelectElement>('select[name="topic"]')
      ?.focus();
  }

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      noValidate
      aria-busy={status === "loading"}
      className="space-y-6"
    >
      <fieldset disabled={status === "loading"} className="space-y-6">
        <legend className="sr-only">
          Non-submitting contact preview
        </legend>

        <SelectField
          label="Information topic"
          name="topic"
          hint="Preview only. This selection is not sent anywhere."
          value={topic}
          onChange={(event) => {
            setTopic(event.target.value);
            setStatus("idle");
            setErrors({});
          }}
          required
          error={errors.topic}
        >
          <option value="">Choose a topic</option>
          <option value="appointments">Appointment information</option>
          <option value="services">Service information</option>
          <option value="location">Location information</option>
        </SelectField>

        <SelectField
          label="Demonstration outcome"
          name="outcome"
          hint="Use this development control to test success or error feedback."
          value={outcome}
          onChange={(event) => {
            setOutcome(event.target.value);
            setStatus("idle");
            setErrors({});
          }}
          required
          error={errors.outcome}
        >
          <option value="success">Show a successful preview</option>
          <option value="error">Show a demonstration error</option>
        </SelectField>

        <CheckboxField
          label="I understand this preview does not send a message or contact the practice."
          name="acknowledged"
          checked={acknowledged}
          onChange={(event) => {
            setAcknowledged(event.target.checked);
            setStatus("idle");
            setErrors({});
          }}
          required
          error={errors.acknowledged}
        />
      </fieldset>

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          loading={status === "loading"}
          loadingText="Preparing preview…"
        >
          Run form preview
        </Button>

        <Button
          variant="ghost"
          onClick={reset}
          disabled={status === "loading"}
        >
          Reset
        </Button>
      </div>

      <div role="status" aria-live="polite" aria-atomic="true">
        {Object.keys(errors).length > 0 && (
          <p className="text-sm leading-6 text-danger">
            Please correct the highlighted fields.
          </p>
        )}

        {status === "success" && (
          <div className="rounded-2xl border border-sage-ink/20 bg-sage/60 p-5">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2 size={18} aria-hidden="true" />
              Preview completed
            </p>
            <p className="mt-2 text-sm leading-6">
              Validation passed. No message was sent and no information
              was saved.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-2xl border border-danger/20 bg-danger-soft p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-danger">
              <TriangleAlert size={18} aria-hidden="true" />
              Demonstration error
            </p>
            <p className="mt-2 text-sm leading-6">
              This is the selected error simulation, not a delivery
              failure. No message was attempted. Choose the successful
              outcome and run the preview again.
            </p>
          </div>
        )}
      </div>
    </form>
  );
}