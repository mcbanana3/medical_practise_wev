import {
  PageIntro,
  PracticeLayout,
} from "../components/layout/PracticeLayout";
import { Container } from "../components/layout/Container";
import { ContentNotice } from "../components/ui/ContentNotice";

const sections = [
  {
    title: "1. Practice identity and scope",
    text: "The legal practice name, business address, privacy contact, applicable jurisdictions, and scope of this policy have not been supplied. These details must be completed and reviewed before publication as an effective policy.",
  },
  {
    title: "2. Current development behavior",
    text: "The supplied contact preview runs in browser memory and does not submit its selections. The reviews screen makes a read-only request to the local API. No patient database or patient messaging feature has been implemented.",
  },
  {
    title: "3. Information not to provide",
    text: "Do not submit symptoms, medical history, insurance details, documents, or other patient information through this development preview. It is not a patient portal or a channel for medical advice.",
  },
  {
    title: "4. Technical information and logs",
    text: "Before launch, the practice must document the technical information processed by its actual hosting, security, logging, and monitoring configuration, including purposes, access controls, and retention. This draft does not claim that infrastructure collects no information.",
  },
  {
    title: "5. Cookies, storage, and analytics",
    text: "The public application code supplied so far does not add analytics or advertising trackers. The final policy must reflect all deployed cookies, storage, authentication, embedded content, and third-party scripts. Consent requirements must be assessed before adding them.",
  },
  {
    title: "6. Scheduling and external providers",
    text: "No real scheduling provider is connected. Any future provider must be reviewed for its role, data flows, safeguards, agreements, and applicable BAA requirements. The policy must explain the relationship and link to relevant provider information where appropriate.",
  },
  {
    title: "7. Reviews and publication",
    text: "Real review collection is disabled. Before enabling it, the practice must establish appropriate consent, moderation, publication, removal, and retention procedures. Reviews can reveal sensitive information or a patient relationship.",
  },
  {
    title: "8. Retention, rights, and requests",
    text: "Retention periods, deletion processes, privacy rights, request verification, and response procedures depend on actual operations and applicable law. These must be supplied by the practice and reviewed rather than invented here.",
  },
  {
    title: "9. Security and medical privacy notices",
    text: "This website is not represented as HIPAA compliant. A general website privacy policy does not replace any separately required Notice of Privacy Practices. Applicable notices, agreements, safeguards, and workflows require professional review.",
  },
  {
    title: "10. Contact, effective date, and updates",
    text: "Privacy contact: not supplied. Effective date: not assigned. This draft is not an effective policy. The practice must approve its final text and establish how material updates will be communicated.",
  },
];

export default function PrivacyPage() {
  return (
    <PracticeLayout title="Privacy Policy Draft">
      <PageIntro
        eyebrow="Legal document · Draft"
        title="Privacy, explained accurately."
        description="A structured privacy-policy draft for review. It is not approved, effective, or ready for production use."
      />

      <section className="py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            <ContentNotice title="Draft only — professional review required">
              This page identifies the information and decisions needed
              for a final policy. It is not legal advice. Do not remove
              this notice until the actual website operations and final
              document have been reviewed and approved.
            </ContentNotice>

            <nav
              aria-label="Privacy policy contents"
              className="my-10 rounded-card border border-line p-6"
            >
              <h2 className="text-sm font-semibold">On this page</h2>
              <ol className="mt-4 space-y-2">
                {sections.map((section, index) => (
                  <li key={section.title}>
                    <a
                      href={`#privacy-${index + 1}`}
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
                  id={`privacy-${index + 1}`}
                  aria-labelledby={`privacy-heading-${index + 1}`}
                >
                  <h2
                    id={`privacy-heading-${index + 1}`}
                    className="type-title"
                  >
                    {section.title}
                  </h2>
                  <p className="type-body mt-4">{section.text}</p>
                </section>
              ))}
            </div>

            <a
              href="/contact"
              className="text-link mt-10 inline-flex min-h-11 items-center text-sm font-semibold"
            >
              View current contact information
            </a>
          </div>
        </Container>
      </section>
    </PracticeLayout>
  );
}