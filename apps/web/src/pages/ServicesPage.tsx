import { ArrowUpRight } from "lucide-react";
import {
  PageIntro,
  PracticeLayout,
} from "../components/layout/PracticeLayout";
import { Container } from "../components/layout/Container";
import { Section } from "../components/layout/Section";
import { Card } from "../components/ui/Card";
import { ContentNotice } from "../components/ui/ContentNotice";
import { Reveal } from "../components/ui/Reveal";
import { buttonClasses } from "../components/ui/Button";
import { homeContent } from "../content/home";

export default function ServicesPage() {
  return (
    <PracticeLayout title="Services">
      <PageIntro
        eyebrow="Specialties & services"
        title="Understand the options before the next step."
        description="The verified service list has not been supplied. The sections below show how approved medical information will be presented."
      />

      <section className="py-16 sm:py-20">
        <Container>
          <ContentNotice>
            These are content placeholders, not an offer of treatment.
            Appointment eligibility, referrals, fees, and available
            services remain unconfirmed.
          </ContentNotice>

          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {homeContent.specialties.map((service) => (
              <Reveal key={service.number} className="h-full">
                <Card className="flex h-full flex-col">
                  <p className="type-eyebrow">
                    {service.number} · Pending verification
                  </p>
                  <h2 className="type-title mt-8">{service.title}</h2>
                  <p className="type-body mt-5">
                    {service.description}
                  </p>
                  <a
                    href="#before-booking"
                    className="text-link mt-auto inline-flex min-h-11 items-center gap-2 pt-7 text-sm font-semibold"
                  >
                    Before booking
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <Section
        id="before-booking"
        eyebrow="Practical information"
        title="The details matter."
        description="These questions need practice-approved answers before real appointment scheduling begins."
        tone="warm"
      >
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Is the visit suitable?",
              text: "Patient eligibility, age ranges, referral requirements, and exclusions must be confirmed.",
            },
            {
              title: "What does it cost?",
              text: "Fees, insurance participation, payment methods, and cancellation policies must be supplied.",
            },
            {
              title: "How should I prepare?",
              text: "The practice must approve any preparation instructions and explain its secure document workflow.",
            },
          ].map((item) => (
            <Card key={item.title}>
              <h3 className="type-title">{item.title}</h3>
              <p className="type-body mt-4">{item.text}</p>
            </Card>
          ))}
        </div>

        <div className="mt-9 flex flex-wrap gap-3">
          <a href="/#appointments" className={buttonClasses()}>
            Appointment information
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          <a
            href="/contact"
            className={buttonClasses("secondary")}
          >
            Contact information
          </a>
        </div>
      </Section>
    </PracticeLayout>
  );
}