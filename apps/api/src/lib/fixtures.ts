export const contentFixtures = {
  "hero-placeholder": {
    key: "hero",
    title: "A thoughtful place to begin.",
    body:
      "Development placeholder. Approved practice positioning has not been supplied.",
  },
  "doctor-placeholder": {
    key: "doctor",
    title: "Doctor name pending verification",
    body:
      "Biography, qualifications, licensure, and professional affiliations require verification.",
  },
  "contact-placeholder": {
    key: "contact",
    title: "Practice contact information",
    body:
      "Phone, address, opening hours, and patient communication arrangements have not been supplied.",
  },
} as const;

export const reviewFixtures = {
  "review-layout-a": {
    displayName: "Synthetic display label A",
    text:
      "[Demo layout A — not an actual patient review or medical experience.]",
  },
  "review-layout-b": {
    displayName: "Synthetic display label B",
    text:
      "[Demo layout B — not an actual patient review or endorsement.]",
  },
} as const;