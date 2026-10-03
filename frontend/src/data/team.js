/**
 * team.js — Team data for the About page
 * Shape cutouts and brand tones matching the reference design.
 */
import { SITE_INFO } from './siteInfo.js';

export const TEAM_MEMBERS = [
  {
    name: "Hashir Muhiyudheen Konnola",
    role: "Website and AI",
    photo: "/images/about/hashir.webp", // Real photo path (fallback to initials placeholder)
    cutout: null, // Transparent cutout path if available
    linkedin: SITE_INFO.linkedin,
    shape: "shape-figure-eight",
    tone: "blue", // #1558E8
    initials: "HMK"
  },
  {
    name: "Mohamed Resin Kizhapat",
    role: "", // Left empty for user to fill in
    photo: null,
    cutout: null,
    linkedin: "", // Left empty for user to fill in
    shape: "shape-arch",
    tone: "sky", // #BFD8FF
    initials: "MRK"
  },
  {
    name: "Ashiqa Asharaf P K",
    role: "",
    photo: null,
    cutout: null,
    linkedin: "",
    shape: "shape-oval-arch",
    tone: "pale", // #EAF1FF
    initials: "AAP"
  },
  {
    name: "Aaditya Pramod V",
    role: "",
    photo: null,
    cutout: null,
    linkedin: "",
    shape: "shape-triple-lobe",
    tone: "navy", // #0B1020
    initials: "APV"
  }
];
