import {
  PageIntro,
  PracticeLayout,
} from "../components/layout/PracticeLayout";
import { Container } from "../components/layout/Container";
import { Card } from "../components/ui/Card";
import { ContentNotice } from "../components/ui/ContentNotice";
import { ContactPreviewForm } from "../features/contact/ContactPreviewForm";

const details = [
  ["Practice phone", "Not supplied or verified."],
  ["Office address", "Address pending verification."],
  ["Office hours", "Hours and time zone pending confirmation."],
  ["Patient messaging", "No messaging channel is available here."],
];

export default function ContactPage() {
  return (
    <PracticeLayout title="Contact">
      <PageIntro
        eyebrow="Contact & directions"
        title="The right details. A clear next step."
        description="Verified contact information will be added before launch. This development preview does not contact the practice."
      />

      <section className="py-16 sm:py-20">
        <Container>
          <ContentNotice title="Do not send patient information">
            This is not a patient portal or a secure messaging service.
            Do not provide symptoms, medical history, insurance details,
            or other patient information. For a medical emergency in
            the United States, call 911.
          </ContentNotice>

          <div className="mt-10 grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <h2 className="type-title">Practice information</h2>

              <dl className="mt-7 divide-y divide-line border-y border-line">
                {details.map(([label, value]) => (
                  <div key={label} className="py-5">
                    <dt className="text-sm font-semibold">{label}</dt>
                    <dd className="type-body mt-2">{value}</dd>
                  </div>
                ))}
              </dl>

              <p className="type-caption mt-6">
                Phone, email, and map links are intentionally absent
                until real destinations have been verified.
              </p>

              <a
                href="/#appointments"
                className="text-link mt-5 inline-flex min-h-11 items-center text-sm font-semibold"
              >
                Read appointment information
              </a>
            </div>

            <Card tone="warm">
              <p className="type-eyebrow">Development demonstration</p>
              <h2 className="type-title mt-4">
                Preview the form experience.
              </h2>
              <p className="type-caption mb-7 mt-4">
                This form demonstrates interface behavior only.
                It has no personal-information fields and makes no
                network request.
              </p>

              <ContactPreviewForm />
            </Card>
          </div>
        </Container>
      </section>
    </PracticeLayout>
  );
}