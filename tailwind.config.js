/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Palette principale Jadoo Travels (original)
        primary: {
          DEFAULT: "#FA9C0F", // Orange vif
          light: "#FFC145",
          dark: "#E88B00",
          50: "#FFF8E8",
          100: "#FFEFC7",
          200: "#FFE5A5",
          300: "#FFD483",
          400: "#FFC145",
          500: "#FA9C0F",
          600: "#E88B00",
          700: "#B56D00",
          800: "#825000",
          900: "#4F3200",
        },
        secondary: {
          DEFAULT: "#D7573B", // Corail
          light: "#E57A66",
          dark: "#B54230",
          50: "#FEF2F0",
          100: "#FCE0DA",
          200: "#F4BDB2",
          300: "#ED9A8A",
          400: "#E57A66",
          500: "#D7573B",
          600: "#B54230",
          700: "#8D3325",
          800: "#65241A",
          900: "#3D150F",
        },
        dark: {
          DEFAULT: "#152F37", // Bleu foncé
          light: "#1E4450",
          lighter: "#2A5A69",
        },
        blue: {
          DEFAULT: "#35528B", // Bleu moyen
          light: "#4A6BA5",
          dark: "#263D68",
        },
        accent: {
          DEFAULT: "#35528B",
          light: "#4A6BA5",
          dark: "#263D68",
        },
        // États système
        success: {
          DEFAULT: "#10B981",
          light: "#34D399",
          dark: "#059669",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FBBF24",
          dark: "#D97706",
        },
        danger: {
          DEFAULT: "#EF4444",
          light: "#F87171",
          dark: "#DC2626",
        },
        info: {
          DEFAULT: "#3B82F6",
          light: "#60A5FA",
          dark: "#2563EB",
        },
        // Couleurs neutres
        neutral: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
        // Alias pour rétrocompatibilité (palette originale)
        color1: "#D7573B", // Corail
        color2: "#FA9C0F", // Orange
        color3: "#152F37", // Bleu foncé
        color4: "#35528B", // Bleu moyen
        textColor: "#152F37", // Texte principal
      },
      fontFamily: {
        poppins: ["Poppins"],
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'strong': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'primary': '0 4px 20px rgba(250, 156, 15, 0.25)',
        'secondary': '0 4px 20px rgba(215, 87, 59, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-up': 'scaleUp 0.3s ease-out',
        'bounce-soft': 'bounceSoft 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
