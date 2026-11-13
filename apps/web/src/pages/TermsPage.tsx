import {
  PageIntro,
  PracticeLayout,
} from "../components/layout/PracticeLayout";
import { Container } from "../components/layout/Container";
import { ContentNotice } from "../components/ui/ContentNotice";

const sections = [
  {
    title: "1. Operator and document status",
    text: "The website operator’s legal name, address, and contact details have not been supplied. These terms are a drafting framework, not an approved agreement. No effective date has been assigned.",
  },
  {
    title: "2. Development preview",
    text: "The current website is a development preview. Doctor details, specialties, contact information, practice statistics, and operational policies may be marked as placeholders. They must not be treated as verified practice information.",
  },
  {
    title: "3. No medical advice or emergency service",
    text: "This preview does not provide diagnosis, treatment, individual medical advice, or emergency monitoring. In a medical emergency in the United States, call 911 or seek emergency care.",
  },
  {
    title: "4. No appointment or care relationship",
    text: "Using this preview does not request, reserve, or confirm an appointment. The demonstration form does not contact the practice. A future final document should accurately explain when appointments are accepted and how any professional relationship is established.",
  },
  {
    title: "5. Acceptable use",
    text: "The final terms should address unauthorized access, interference, misuse, and unlawful activity in language appropriate to the deployed service. Do not submit patient information or attempt to use this preview as a patient communication channel.",
  },
  {
    title: "6. Content, photography, and intellectual property",
    text: "The practice must confirm rights to its final copy, branding, images, fonts, and other materials. Portraits and medical information currently marked as placeholders are not approved practice content.",
  },
  {
    title: "7. External services and links",
    text: "No real scheduling integration is active. Before one is introduced, the practice must review relevant provider terms and explain any transition to an external service without making unsupported promises about its security or availability.",
  },
  {
    title: "8. Reviews and submitted content",
    text: "Real review submission is disabled. Any future submission terms need a separate, reviewed process covering permissions, publication, moderation, privacy, and removal. This draft does not grant a license over patient content.",
  },
  {
    title: "9. Fees, cancellations, and operational policies",
    text: "Fees, insurance participation, cancellation rules, refunds, and related policies have not been supplied. No such policy is created by this preview. Any final terms must match the practice’s approved operations.",
  },
  {
    title: "10. Legal provisions requiring review",
    text: "Applicable law, dispute handling, limitations, disclaimers, and enforceability require jurisdiction-specific legal review. No governing state, liability cap, arbitration agreement, or waiver is invented in this draft.",
  },
  {
    title: "11. Contact and changes",
    text: "Terms contact: not supplied. Effective date: not assigned. The final document and update process must be approved before the site launches or asks anyone to accept terms.",
  },
];

export default function TermsPage() {
  return (
    <PracticeLayout title="Terms Draft">
      <PageIntro
        eyebrow="Legal document · Draft"
        title="Clear boundaries. No hidden assumptions."
        description="A terms-and-conditions drafting framework. Not an effective agreement or a substitute for legal review."
      />

      <section className="py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            <ContentNotice title="Draft only — not launch-ready">
              This page is not legal advice. The practice and its
              qualified adviser must review the final website,
              operations, and terms before publication as an effective
              agreement.
            </ContentNotice>

            <nav
              aria-label="Terms contents"
              className="my-10 rounded-card border border-line p-6"
            >
              <h2 className="text-sm font-semibold">On this page</h2>
              <ol className="mt-4 space-y-2">
                {sections.map((section, index) => (
                  <li key={section.title}>
                    <a
                      href={`#terms-${index + 1}`}
                      className="text-link inline-block py-1 text-sm leading-6"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="space-y-10">
              {sections.map((section, index) => (
                <section
                  key={section.title}
                  id={`terms-${index + 1}`}
                  aria-labelledby={`terms-heading-${index + 1}`}
                >
                  <h2
                    id={`terms-heading-${index + 1}`}
                    className="type-title"
                  >
                    {section.title}
                  </h2>
                  <p className="type-body mt-4">{section.text}</p>
                </section>
              ))}
            </div>

            <a
              href="/privacy"
              className="text-link mt-10 inline-flex min-h-11 items-center text-sm font-semibold"
            >
              Read the privacy-policy draft
            </a>
          </div>
        </Container>
      </section>
    </PracticeLayout>
  );
}