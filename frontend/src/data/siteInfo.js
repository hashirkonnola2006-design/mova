/**
 * siteInfo.js — Single source of truth for personal, project, and team details.
 * Imported across About, Contact, Footer, Privacy, and Terms pages.
 */

export const SITE_INFO = {
  // ── Identity ──────────────────────────────────────────────────────────────
  name: "Hashir Muhiyudheen Konnola",
  role: "Tech Lead @ µLearn TLY · CS student, College of Engineering Thalassery", // from LinkedIn; wording to confirm
  contactEmail: "hashircoet@gmail.com",
  linkedin: "https://www.linkedin.com/in/hashir-muhiyudheen-konnola-8342aa1b9",
  college: "College of Engineering Thalassery",
  
  // Team members (Hashir first)
  // TODO: Confirm names, spellings and that each person is happy to be named
  team: [
    "Hashir Muhiyudheen Konnola",
    "Mohamed Resin Kizhapat",
    "Ashiqa Asharaf P K",
    "Aaditya Pramod V"
  ],

  // ── Backward-compatible aliases ───────────────────────────────────────────
  builderName: "Hashir Muhiyudheen Konnola",
  builderRole: "Tech Lead @ µLearn TLY · CS student, College of Engineering Thalassery",
  collegeName: "College of Engineering Thalassery",
  departmentName: "Department of Computer Science & Engineering",
  projectYear: "2025–26",
  legalEntity: "Student Project",
  contactAddress: "College of Engineering Thalassery, Kundoormala, Eranholi, Kannur, Kerala, India",
  siteUrl: "https://mova.app",

  // ── Social links ──────────────────────────────────────────────────────────
  githubUrl: "https://github.com/hashirkonnola2006-design/mova",
  githubProfile: "https://github.com/hashirkonnola2006-design",
  linkedinUrl: "https://www.linkedin.com/in/hashir-muhiyudheen-konnola-8342aa1b9",
  twitterUrl: "",

  // ── Dates ─────────────────────────────────────────────────────────────────
  copyrightYear: new Date().getFullYear(),
  privacyLastUpdated: "October 2026",
  termsLastUpdated: "October 2026",
};
