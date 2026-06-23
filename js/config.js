/**
 * Site configuration — edit this file to update your profile and links.
 */
export const config = {
  name: "Axel Karlsson",
  role: "AI Engineer",
  tagline:
    "Building software at the intersection of AI, web, and developer tooling — with a strong interest in accessibility.",
  location: "Gothenburg, Sweden",
  company: "Hogia",
  companyUrl: "https://www.linkedin.com/company/hogia",

  about:
    "AI Engineer at Hogia Infrastructure Products in Gothenburg. I started as a junior developer at Hogia in 2022 and have grown into working with AI and software engineering across the stack. Background as a gymnasieingenjör in software development from Teknikcollege Stenungsund, with earlier experience in IoT, networking, and entrepreneurship through UF (young enterprise).",

  experience: [
    {
      role: "AI Engineer",
      company: "Hogia",
      period: "Mar 2026 – Present",
      location: "Stenungsund",
    },
    {
      role: "Utvecklare",
      company: "Hogia",
      period: "May 2024 – Mar 2026",
      location: "Stenungsund",
    },
    {
      role: "Junior Utvecklare",
      company: "Hogia",
      period: "Aug 2022 – May 2024",
      location: "Stenungsund",
    },
    {
      role: "CISCO Network Academy Instructor",
      company: "Teknikcollege Stenungsund",
      period: "Aug 2021 – Aug 2022",
      location: "Stenungsund",
    },
  ],

  skills: [
    "AI & ML",
    ".NET",
    "TypeScript",
    "Web accessibility",
    "Software engineering",
    "IoT",
    "Network security",
  ],

  education: [
    {
      degree: "Gymnasieingenjör, Mjukvaruutveckling",
      school: "Teknikcollege Stenungsund",
      period: "2020 – 2021",
    },
    {
      degree: "Gymnasieexamen, Informations- och mediateknik",
      school: "Nösnäsgymnasiet",
      period: "2017 – 2020",
    },
  ],

  github: {
    username: "klovaaxel",
    url: "https://github.com/klovaaxel",
  },

  linkedin: {
    url: "https://www.linkedin.com/in/axel-a-karlsson/",
    label: "LinkedIn",
    headline: "AI Engineer | Hogia Infrastructure Products",
  },

  email: "klovakarlsson@gmail.com",

  social: [
    {
      id: "github",
      label: "GitHub",
      url: "https://github.com/klovaaxel",
      icon: "github",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/axel-a-karlsson/",
      icon: "linkedin",
    },
    {
      id: "email",
      label: "Email",
      url: "mailto:klovakarlsson@gmail.com",
      icon: "email",
    },
  ],

  githubRepos: {
    mode: "featured",
    featured: [
      "web-a11y-agent-skills",
      "meeting-room-display",
      "combobox-framework",
      "light-sqlite-orm",
      "git-auto",
      "agent-software-design-skills",
      "agent-testing-skills",
      "cypress-html",
      "editorjs-parser",
    ],
    exclude: [
      "klovaaxel.github.io",
      "test",
      "fruit_test",
      "post-test",
      "SDD",
      "obsidian-notes",
      "Programering",
      "ZitrusWebAppDist",
      "ZitrusDevResources",
      "swap-live-and-status-icons-discord-theme",
    ],
    excludeForks: true,
    sort: "updated",
    maxCount: 9,
  },

  themes: [
    { id: "dark", label: "Dark", icon: "moon" },
    { id: "light", label: "Light", icon: "sun" },
    { id: "forest", label: "Forest", icon: "tree" },
    { id: "ocean", label: "Ocean", icon: "wave" },
  ],

  defaultTheme: "dark",
};
