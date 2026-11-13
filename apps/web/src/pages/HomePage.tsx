import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
} from "lucide-react";
import { homeContent } from "../content/home";
import { Container } from "../components/layout/Container";
import { Header } from "../components/layout/Header";
import { HomeFooter } from "../components/layout/HomeFooter";
import { Section } from "../components/layout/Section";
import { Button, buttonClasses } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Dialog } from "../components/ui/Dialog";
import { Reveal } from "../components/ui/Reveal";

const navigation = [
  { label: "The doctor", href: "#doctor" },
  { label: "Specialties", href: "#specialties" },
  { label: "The practice", href: "#practice" },
  { label: "FAQs", href: "#faqs" },
];

type PortraitPlaceholderProps = {
  compact?: boolean;
};

function PortraitPlaceholder({
  compact = false,
}: PortraitPlaceholderProps) {
  return (
    <figure>
      <div
        className={`relative flex overflow-hidden border border-line bg-[#e7ece5] ${
          compact
            ? "min-h-96 rounded-panel"
            : "min-h-[29rem] rounded-t-[10rem] rounded-b-panel sm:min-h-[35rem]"
        }`}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-white/90 via-[#e3e9df] to-[#ccd8ca]"
        />

        <div
          aria-hidden="true"
          className="absolute -right-14 top-20 h-80 w-56 rotate-[20deg] rounded-full border border-white/70"
        />

        <div
          aria-hidden="true"
          className="absolute -bottom-20 -left-10 size-72 rounded-full bg-white/35"
        />

        <div className="relative flex w-full flex-col justify-between p-7 sm:p-9">
          <span className="self-start rounded-full border border-navy/10 bg-white/80 px-3 py-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.16em]">
            Portrait placeholder
          </span>

          <div>
            <div
              aria-hidden="true"
              className="mb-6 h-14 w-px bg-sage-ink/40"
            />

            <p className="max-w-60 font-serif text-4xl leading-tight tracking-tight">
              A genuine introduction belongs here.
            </p>

            <p className="mt-5 max-w-60 text-sm leading-7 text-ink-muted">
              Replace with a licensed, practice-approved portrait
              of the doctor.
            </p>
          </div>
        </div>
      </div>

      <figcaption className="type-caption mt-4">
        No stock individual is presented as the doctor.
      </figcaption>
    </figure>
  );
}

export default function HomePage() {
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Private Practice | Homepage Preview";

    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div id="top" className="min-h-screen bg-white">
      <a
        href="#main"
        className="sr-only fixed left-4 top-4 z-50 rounded-xl bg-white px-5 py-3 font-semibold text-navy shadow-soft focus:not-sr-only"
      >
        Skip to main content
      </a>

      <div className="border-b border-line bg-warm px-5 py-2.5 text-center text-xs leading-5 text-ink-muted">
        Development preview · Practice information is unverified ·
        No patient bookings
      </div>

      <Header
        homeHref="/"
        homeLabel="Private practice homepage"
        brandName={homeContent.practiceName}
        brandSubtitle="Private practice · Website preview"
        items={navigation}
        action={{
          label: "Appointment information",
          href: "#appointments",
        }}
      />

      <main id="main" tabIndex={-1}>
        <section
          aria-labelledby="hero-title"
          className="overflow-hidden bg-warm pb-14 pt-12 sm:pb-20 sm:pt-16 lg:py-20"
        >
          <Container>
            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
              <Reveal>
                <p className="type-eyebrow">
                  Private medical practice · Brand preview
                </p>

                <h1
                  id="hero-title"
                  className="type-display mt-6 max-w-3xl"
                >
                  A thoughtful
                  <br />
                  place to begin.
                </h1>

                <p className="type-body mt-7 max-w-lg text-lg">
                  Meet the doctor, explore verified practice
                  information, and understand your next step.
                </p>

                <p className="type-caption mt-4 max-w-lg">
                  This homepage is a design preview. Medical
                  services, credentials, and availability have not
                  yet been confirmed.
                </p>

                <div className="mt-9 flex flex-wrap gap-3">
                  <a
                    href="#appointments"
                    className={buttonClasses()}
                  >
                    Explore appointment options
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </a>

                  <a
                    href="#doctor"
                    className={buttonClasses("secondary")}
                  >
                    Meet the doctor
                  </a>
                </div>

                <div className="mt-10 border-t border-line pt-6">
                  <p className="type-caption flex items-start gap-2">
                    <MapPin
                      size={17}
                      className="mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    {homeContent.location}
                  </p>
                </div>
              </Reveal>

              <Reveal>
                <PortraitPlaceholder />
              </Reveal>
            </div>
          </Container>
        </section>

        <div className="border-y border-line bg-white">
          <Container>
            <div className="grid gap-5 py-7 sm:grid-cols-3 sm:gap-8">
              {[
                "Doctor profile",
                "Practice information",
                "Appointment guidance",
              ].map((label, index) => (
                <a
                  key={label}
                  href={
                    index === 0
                      ? "#doctor"
                      : index === 1
                        ? "#practice"
                        : "#appointments"
                  }
                  className="group flex min-h-11 items-center justify-between gap-4 text-sm font-medium"
                >
                  <span className="flex items-center gap-4">
                    <span className="text-xs text-sage-ink">
                      0{index + 1}
                    </span>
                    {label}
                  </span>

                  <ArrowDown
                    size={16}
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-y-0.5 motion-reduce:transform-none"
                  />
                </a>
              ))}
            </div>
          </Container>
        </div>

        <Section
          id="doctor"
          eyebrow="An introduction"
          title={homeContent.introduction.heading}
        >
          <div className="grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <Reveal>
              <div className="rounded-card border border-line bg-warm p-7 sm:p-9">
                <p className="type-caption">
                  Profile content placeholder
                </p>

                <h3 className="type-title mt-5">
                  {homeContent.doctorName}
                </h3>

                <p className="mt-3 text-sm leading-7 text-sage-ink">
                  {homeContent.doctorTitle}
                </p>

                <div className="mt-7 border-t border-line pt-6">
                  <p className="type-caption">
                    Education, training, affiliations, and
                    certifications will appear only after
                    verification.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <p className="type-eyebrow">
                Biography awaiting approval
              </p>

              <div className="mt-5 space-y-5">
                {homeContent.introduction.paragraphs.map((text) => (
                  <p key={text} className="type-body">
                    {text}
                  </p>
                ))}
              </div>

              <a
                href="#faqs"
                className="text-link mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold"
              >
                Read common questions
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </Reveal>
          </div>
        </Section>

        <Section
          id="specialties"
          eyebrow="Specialties & services"
          title="A clear picture of the practice."
          description="The following cards are content placeholders. They do not represent confirmed specialties, treatments, or appointment types."
          tone="warm"
        >
          <div className="grid gap-5 md:grid-cols-3">
            {homeContent.specialties.map((specialty) => (
              <Reveal key={specialty.number} className="h-full">
                <Card className="flex h-full flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-sage-ink">
                      {specialty.number}
                    </span>

                    <Plus
                      size={20}
                      strokeWidth={1.5}
                      aria-hidden="true"
                      className="text-sage-ink"
                    />
                  </div>

                  <h3 className="type-title mt-10">
                    {specialty.title}
                  </h3>

                  <p className="type-body mt-4">
                    {specialty.description}
                  </p>

                  <p className="type-caption mt-auto pt-7">
                    Pending practice approval
                  </p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Section>

        <Section
          id="practice"
          eyebrow="Why this practice"
          title="The details should feel considered."
          description="These are proposed website-experience principles—not verified claims about clinical care, appointment length, access, or outcomes."
        >
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <Reveal>
              <div className="flex min-h-80 flex-col justify-between rounded-panel bg-sage/60 p-8 sm:p-10">
                <span className="type-eyebrow">
                  A considered first impression
                </span>

                <p className="mt-10 max-w-sm font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
                  Less uncertainty.
                  <br />
                  More clarity.
                </p>

                <p className="type-caption mt-8 max-w-sm">
                  Verified information and practical guidance
                  belong at the center of the experience.
                </p>
              </div>
            </Reveal>

            <div className="divide-y divide-line">
              {homeContent.principles.map((principle, index) => (
                <Reveal key={principle.title}>
                  <div
                    className={`flex items-start gap-5 py-7 ${
                      index === 0 ? "pt-0" : ""
                    }`}
                  >
                    <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-warm">
                      <Check
                        size={16}
                        aria-hidden="true"
                        className="text-sage-ink"
                      />
                    </span>

                    <div>
                      <h3 className="text-lg font-semibold tracking-tight">
                        {principle.title}
                      </h3>
                      <p className="type-body mt-3">
                        {principle.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="mt-14 border-t border-line pt-10">
            <p className="type-eyebrow">Practice at a glance</p>

            <div className="mt-7 grid gap-8 sm:grid-cols-3">
              {homeContent.statistics.map((statistic) => (
                <div key={statistic.label}>
                  <p
                    aria-label="Not yet provided"
                    className="font-serif text-6xl tracking-tight"
                  >
                    {statistic.value}
                  </p>
                  <h3 className="mt-3 text-sm font-semibold">
                    {statistic.label}
                  </h3>
                  <p className="type-caption mt-1">
                    {statistic.note}
                  </p>
                </div>
              ))}
            </div>

            <p className="type-caption mt-7">
              No statistics have been supplied. Dashes are
              deliberate placeholders, not zero values.
            </p>
          </div>
        </Section>

        <Section
          id="patient-perspectives"
          eyebrow="Patient perspectives"
          title="Real experiences deserve an honest presentation."
          description="Demo layout only. These are text placeholders, not patient testimonials. No ratings, endorsements, or review counts are being claimed."
          tone="warm"
        >
          <div className="grid gap-5 md:grid-cols-2">
            {homeContent.testimonials.map((testimonial) => (
              <Reveal key={testimonial.id} className="h-full">
                <Card className="h-full">
                  <p className="type-eyebrow">
                    Demo layout · Not a patient review
                  </p>

                  <p className="mt-7 font-serif text-2xl leading-relaxed tracking-tight">
                    {testimonial.text}
                  </p>

                  <div className="mt-8 border-t border-line pt-5">
                    <p className="text-sm font-medium">
                      {testimonial.attribution}
                    </p>
                    <p className="type-caption mt-1">
                      Publication requires appropriate review and
                      permission.
                    </p>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </Section>

        <Section
          id="appointments"
          eyebrow="Appointments"
          title="Your next step, clearly explained."
          description="Online appointment booking is not active in this development preview. No appointment request will be created by using this page."
        >
          <Reveal>
            <div className="grid gap-10 rounded-panel border border-line bg-warm p-7 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium">
                  <Clock3 size={14} aria-hidden="true" />
                  Scheduling integration pending
                </span>

                <h3 className="type-title mt-6">
                  Booking will open only when the details are ready.
                </h3>

                <p className="type-body mt-5">
                  Before launch, this section will connect to a
                  practice-approved scheduling provider. Provider
                  suitability, agreements, and data safeguards
                  must be verified first.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Button
                    onClick={() => setBookingDialogOpen(true)}
                  >
                    View booking status
                    <CalendarDays size={17} aria-hidden="true" />
                  </Button>

                  <a
                    href="#contact"
                    className={buttonClasses("secondary")}
                  >
                    Contact information
                  </a>
                </div>
              </div>

              <div className="rounded-card border border-line bg-white p-6 sm:p-8">
                <p className="type-eyebrow">Before scheduling</p>

                <ul className="mt-5 space-y-5">
                  {[
                    "Confirmed services and appointment eligibility.",
                    "Verified location, fees, and payment information.",
                    "An approved route for real patient scheduling.",
                  ].map((text) => (
                    <li key={text} className="flex gap-3">
                      <Check
                        size={17}
                        className="mt-1 shrink-0 text-sage-ink"
                        aria-hidden="true"
                      />
                      <span className="text-sm leading-7 text-ink-muted">
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </Section>

        <Section
          id="faqs"
          eyebrow="Common questions"
          title="A little clarity before you begin."
          description="These answers describe the current preview. Practice-specific policies will replace them after verification."
          tone="warm"
        >
          <div className="max-w-4xl border-t border-line">
            {homeContent.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group border-b border-line"
              >
                <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-6 py-6 text-base font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
                  <span>{faq.question}</span>
                  <ChevronDown
                    size={19}
                    aria-hidden="true"
                    className="shrink-0 text-sage-ink transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>

                <div className="max-w-3xl pb-7 pr-8">
                  <p className="type-body">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </Section>

        <section
          id="contact"
          aria-labelledby="contact-title"
          className="bg-white py-16 sm:py-20 lg:py-24"
        >
          <Container>
            <Reveal>
              <div className="overflow-hidden rounded-panel border border-line">
                <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="bg-sage/50 p-7 sm:p-10 lg:p-12">
                    <p className="type-eyebrow">
                      Contact & practical details
                    </p>

                    <h2
                      id="contact-title"
                      className="type-heading mt-5"
                    >
                      A conversation starts with the right details.
                    </h2>

                    <p className="type-body mt-6">
                      Verified contact information will appear here
                      before launch. Until then, this preview does
                      not provide a patient communication channel.
                    </p>

                    <a
                      href="#faqs"
                      className={`mt-8 ${buttonClasses("secondary")}`}
                    >
                      Read common questions
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </a>
                  </div>

                  <div className="bg-white p-7 sm:p-10 lg:p-12">
                    <dl className="space-y-7">
                      <div>
                        <dt className="flex items-center gap-3 text-sm font-semibold">
                          <Phone
                            size={17}
                            className="text-sage-ink"
                            aria-hidden="true"
                          />
                          Practice phone
                        </dt>
                        <dd className="type-body ml-7 mt-2">
                          Not supplied or verified.
                        </dd>
                      </div>

                      <div>
                        <dt className="flex items-center gap-3 text-sm font-semibold">
                          <MapPin
                            size={17}
                            className="text-sage-ink"
                            aria-hidden="true"
                          />
                          Office location
                        </dt>
                        <dd className="type-body ml-7 mt-2">
                          Address pending verification.
                        </dd>
                      </div>

                      <div>
                        <dt className="flex items-center gap-3 text-sm font-semibold">
                          <Clock3
                            size={17}
                            className="text-sage-ink"
                            aria-hidden="true"
                          />
                          Office hours
                        </dt>
                        <dd className="type-body ml-7 mt-2">
                          Hours and time zone pending confirmation.
                        </dd>
                      </div>

                      <div>
                        <dt className="flex items-center gap-3 text-sm font-semibold">
                          <MessageSquare
                            size={17}
                            className="text-sage-ink"
                            aria-hidden="true"
                          />
                          Patient communication
                        </dt>
                        <dd className="type-body ml-7 mt-2">
                          No patient messaging is available in this
                          preview.
                        </dd>
                      </div>
                    </dl>

                    <p className="type-caption mt-8 border-t border-line pt-6">
                      Medical emergency in the United States?
                      Call 911. Do not wait for a website response.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </Container>
        </section>
      </main>

      <HomeFooter />

      <Dialog
        open={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
        title="Booking is not available yet."
        description="This is a development preview. No appointment has been requested, reserved, or confirmed."
      >
        <div className="rounded-2xl bg-warm p-5">
          <p className="type-caption">
            A verified scheduling integration will be introduced
            only after the practice approves its workflow and
            data-handling arrangements. Do not provide patient
            information through this preview.
          </p>
        </div>

        <div className="mt-7 flex justify-end">
          <Button onClick={() => setBookingDialogOpen(false)}>
            Understood
          </Button>
        </div>
      </Dialog>
    </div>
  );
}