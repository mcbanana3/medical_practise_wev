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

const profileDetails = [
  ["Medical degree", "Institution and qualification not supplied."],
  ["Postgraduate training", "Training history not supplied."],
  ["Board certification", "Certification information not verified."],
  ["Licensure", "State and license information not verified."],
  ["Affiliations", "Professional affiliations not supplied."],
  ["Languages", "Languages offered by the practice not confirmed."],
];

export default function AboutPage() {
  return (
    <PracticeLayout title="About">
      <PageIntro
        eyebrow="About the doctor"
        title="A genuine introduction comes first."
        description="A place for the doctor’s verified story, professional background, and approved description of their approach."
      />

      <section className="py-16 sm:py-20">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <Reveal>
              <figure>
                <div className="flex min-h-96 flex-col justify-between rounded-t-[8rem] rounded-b-panel border border-line bg-gradient-to-br from-warm via-sage/60 to-sage p-8 sm:min-h-[30rem]">
                  <span className="self-start rounded-full border border-line bg-white/80 px-3 py-1 text-xs">
                    Portrait placeholder
                  </span>

                  <p className="max-w-xs font-serif text-4xl leading-tight tracking-tight">
                    Reserved for an authentic portrait.
                  </p>
                </div>

                <figcaption className="type-caption mt-4">
                  Replace with a licensed, doctor-approved photograph.
                </figcaption>
              </figure>
            </Reveal>

            <Reveal>
              <p className="type-eyebrow">Profile awaiting approval</p>
              <h2 className="type-heading mt-5">
                {homeContent.doctorName}
              </h2>
              <p className="mt-4 text-sm text-sage-ink">
                {homeContent.doctorTitle}
              </p>

              <div className="mt-7 space-y-5">
                {homeContent.introduction.paragraphs.map((text) => (
                  <p key={text} className="type-body">
                    {text}
                  </p>
                ))}
              </div>

              <a
                href="/services"
                className={`mt-8 ${buttonClasses("secondary")}`}
              >
                Explore service information
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </Reveal>
          </div>
        </Container>
      </section>

      <Section
        id="background"
        eyebrow="Professional background"
        title="Details that should be verifiable."
        description="No qualification, certification, or affiliation is implied by these placeholders."
        tone="warm"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profileDetails.map(([title, description]) => (
            <Card key={title}>
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="type-caption mt-3">{description}</p>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <ContentNotice>
            The practice must approve all biography and credential
            information before publication. Placeholder text is not
            evidence of a qualification.
          </ContentNotice>
        </div>
      </Section>
    </PracticeLayout>
  );
}