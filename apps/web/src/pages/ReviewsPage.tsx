import { useEffect, useState } from "react";
import {
  LoaderCircle,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import { reviewsResponseSchema } from "@private-practice/shared";
import type { PublicReview } from "@private-practice/shared";
import {
  PageIntro,
  PracticeLayout,
} from "../components/layout/PracticeLayout";
import { Container } from "../components/layout/Container";
import { Button, buttonClasses } from "../components/ui/Button";
import { Card, EmptyState } from "../components/ui/Card";
import { ContentNotice } from "../components/ui/ContentNotice";

type ReviewState =
  | { status: "loading" }
  | { status: "success"; reviews: PublicReview[] }
  | { status: "error"; message: string };

export default function ReviewsPage() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<ReviewState>({
    status: "loading",
  });

  useEffect(() => {
    const controller = new AbortController();
    let timedOut = false;

    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 8000);

    async function loadReviews() {
      try {
        const response = await fetch("/api/v1/reviews", {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`The reviews API returned HTTP ${response.status}.`);
        }

        const result = reviewsResponseSchema.safeParse(
          await response.json(),
        );

        if (!result.success) {
          throw new Error("The reviews API returned an unexpected response.");
        }

        if (!controller.signal.aborted) {
          setState({
            status: "success",
            reviews: result.data.reviews,
          });
        }
      } catch (error) {
        if (controller.signal.aborted && !timedOut) {
          return;
        }

        setState({
          status: "error",
          message: timedOut
            ? "The request timed out. Check that the local API is running."
            : error instanceof Error
              ? error.message
              : "Reviews could not be loaded.",
        });
      } finally {
        window.clearTimeout(timeout);
      }
    }

    void loadReviews();

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);

  function retry() {
    setState({ status: "loading" });
    setAttempt((current) => current + 1);
  }

  return (
    <PracticeLayout title="Reviews">
      <PageIntro
        eyebrow="Patient perspectives"
        title="An honest place for real experiences."
        description="No approved patient reviews have been supplied. This preview does not invent testimonials, ratings, or review counts."
      />

      <section className="py-16 sm:py-20">
        <Container>
          <ContentNotice title="Development review source">
            The API currently returns an empty development list.
            Real review submission and publication remain disabled
            until privacy, consent, moderation, and retention
            procedures are approved.
          </ContentNotice>

          <div
            className="mt-9"
            aria-busy={state.status === "loading"}
          >
            <div role="status" aria-live="polite" aria-atomic="true">
              {state.status === "loading" && (
                <Card>
                  <p className="flex items-center gap-3 text-sm font-semibold">
                    <LoaderCircle
                      size={20}
                      className="motion-safe:animate-spin"
                      aria-hidden="true"
                    />
                    Loading reviews…
                  </p>
                </Card>
              )}

              {state.status === "error" && (
                <Card>
                  <h2 className="flex items-center gap-3 text-lg font-semibold">
                    <TriangleAlert
                      size={21}
                      className="text-danger"
                      aria-hidden="true"
                    />
                    Reviews are temporarily unavailable
                  </h2>
                  <p className="type-body mt-4">{state.message}</p>
                  <p className="type-caption mt-3">
                    For local testing, start the API server and try again.
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-6"
                    onClick={retry}
                  >
                    <RefreshCw size={16} aria-hidden="true" />
                    Try again
                  </Button>
                </Card>
              )}

              {state.status === "success" &&
                state.reviews.length === 0 && (
                  <EmptyState
                    title="No approved reviews to display."
                    description="Patient reviews will appear only after an approved publication process is in place. An empty page is more honest than fabricated feedback."
                    action={
                      <a
                        href="/about"
                        className={buttonClasses("secondary")}
                      >
                        Read about the doctor
                      </a>
                    }
                  />
                )}

              {state.status === "success" &&
                state.reviews.length > 0 && (
                  <p className="sr-only">Reviews loaded successfully.</p>
                )}
            </div>

            {state.status === "success" &&
              state.reviews.length > 0 && (
                <div className="grid gap-5 md:grid-cols-2">
                  {state.reviews.map((review) => (
                    <Card key={review.id}>
                      <p className="font-serif text-2xl leading-relaxed">
                        {review.text}
                      </p>
                      <p className="mt-6 border-t border-line pt-5 text-sm font-semibold">
                        {review.displayName}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
          </div>
        </Container>
      </section>
    </PracticeLayout>
  );
}