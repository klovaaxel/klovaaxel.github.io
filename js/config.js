/**
 * Site configuration — edit this file to update your profile and links.
 */
export const config = {
    name: "Axel Karlsson",
    tagline: "Developer in Sweden. Building tools, libraries, and things on the web.",
    location: "Sweden",
    company: "Hogia",

    github: {
        username: "klovaaxel",
        url: "https://github.com/klovaaxel",
    },

    linkedin: {
        // Update with your LinkedIn profile URL
        url: "https://www.linkedin.com/in/axel-karlsson",
        label: "LinkedIn",
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
            url: "https://www.linkedin.com/in/axel-karlsson",
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
        maxCount: 9,
        excludeForks: true,
        sort: "updated",
    },

    themes: [
        { id: "dark", label: "Dark", icon: "moon" },
        { id: "light", label: "Light", icon: "sun" },
        { id: "forest", label: "Forest", icon: "tree" },
        { id: "ocean", label: "Ocean", icon: "wave" },
    ],

    defaultTheme: "dark",
};
