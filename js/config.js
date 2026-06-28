/**
 * Site configuration — runtime data for GitHub dashboard and theme system.
 */
export const config = {
    name: "Axel Karlsson",
    role: "AI Engineer",

    github: {
        username: "klovaaxel",
        url: "https://github.com/klovaaxel",
    },

    themes: [
        { id: "dark", label: "Dark", icon: "moon", themeColor: "#0c0c0e", statusBarStyle: "black-translucent" },
        { id: "light", label: "Light", icon: "sun", themeColor: "#f7f5f0", statusBarStyle: "default" },
        { id: "forest", label: "Forest", icon: "tree", themeColor: "#0d1410", statusBarStyle: "black-translucent" },
        { id: "ocean", label: "Ocean", icon: "wave", themeColor: "#080d14", statusBarStyle: "black-translucent" },
        {
            id: "sketch",
            label: "Sketch",
            icon: "pencil",
            themeColor: "#f0e9dc",
            statusBarStyle: "default",
            requiresBorderShape: true,
        },
    ],

    defaultTheme: "dark",
};
