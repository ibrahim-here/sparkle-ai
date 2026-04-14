/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#FFFFFF",
                surface: "#F9FAFB",
                primary: "#A78BFA", // Lavender
                lavender: {
                    light: "#E8E4FF",
                    DEFAULT: "#A78BFA",
                    dark: "#7C3AED",
                },
                chart_text: "#1F2937",
                success: "#10B981",
                error: "#EF4444",
            },
            backgroundImage: {
                'gradient-input': 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
                'gradient-button': 'linear-gradient(90deg, #3B82F6 0%, #A855F7 50%, #EC4899 100%)',
            }
        },
    },
    plugins: [],
}
