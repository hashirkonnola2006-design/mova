/**
 * team.js — Team data for the About page
 * Clean, extensible array of team members.
 * Order: Hashir Muhiyudheen Konnola, Ashiqa Asharaf P K, Mohamed Resin Kizhapat, Aaditya Pramod V.
 */
import { SITE_INFO } from './siteInfo.js';

export const TEAM_MEMBERS = [
  {
    id: 'hashir',
    name: 'Hashir Muhiyudheen Konnola',
    role: 'Website and AI',
    photo: '/images/about/hashir_photo.webp',
    cutout: '/images/about/hashir_photo.png',
    github: SITE_INFO.githubProfile,
    website: SITE_INFO.githubProfile,
    linkedin: SITE_INFO.linkedin,
    email: SITE_INFO.contactEmail,
    shape: 'pill',
    tone: 'periwinkle',
    initials: 'HMK',
  },
  {
    id: 'ashiqa',
    name: 'Ashiqa Asharaf P K',
    role: 'Research & Design',
    photo: '/images/about/member_2_ashiqa.webp',
    cutout: '/images/about/member_2_ashiqa.png',
    email: 'ashiqaasharafpk100@gmail.com',
    linkedin: 'https://www.linkedin.com/in/ashiqa-asharaf-p-k-a73522385/?isSelfProfile=false',
    website: '',
    shape: 'circle',
    tone: 'peach',
    initials: 'AAP',
  },
  {
    id: 'resin',
    name: 'Mohamed Resin Kizhapat',
    role: 'Sign Language Data',
    photo: '/images/about/member_3_resin.webp',
    cutout: '/images/about/member_3_resin.png',
    email: 'resinrias@gmail.com',
    linkedin: 'https://www.linkedin.com/in/mohamed-resin-kizhapat-971624380/',
    website: '',
    shape: 'squircle',
    tone: 'light-blue',
    initials: 'MRK',
  },
  {
    id: 'aaditya',
    name: 'Aaditya Pramod V',
    role: 'Validation & Testing',
    photo: '/images/about/member_4_aaditya.webp',
    cutout: '/images/about/member_4_aaditya.png',
    email: 'aadityapramod2017@gmail.com',
    linkedin: 'https://www.linkedin.com/in/aadityapramod-v-796704380?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    website: '',
    shape: 'arch',
    tone: 'sky',
    initials: 'APV',
  },
];

export default TEAM_MEMBERS;
