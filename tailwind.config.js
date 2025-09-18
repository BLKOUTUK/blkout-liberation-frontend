/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Liberation color system - Pan-African + Pride celebration
        liberation: {
          // Pan-African colors
          'red-liberation': '#E31E24',      // Pan-African red
          'black-power': '#000000',         // Black power and solidarity  
          'green-africa': '#00A86B',        // Pan-African green
          
          // Pride celebration palette
          'pride-pink': '#FF69B4',          // Hot pink for joy
          'pride-purple': '#8B008B',        // Deep magenta for dignity
          'pride-blue': '#0099CC',          // Sky blue for hope
          'pride-yellow': '#FFD700',        // Gold for celebration
          
          // Community healing colors
          'healing-sage': '#9CAF88',        // Soft sage for trauma-informed spaces
          'healing-lavender': '#E6E6FA',    // Gentle lavender for safe spaces
          'community-warm': '#F4A460',      // Sandy brown for community warmth
          
          // Economic justice colors
          'sovereignty-gold': '#FFD700',    // 75% creator sovereignty
          'transparency-blue': '#87CEEB',   // Revenue transparency
          'empowerment-orange': '#FF8C00',  // Economic empowerment
        },
      },
      fontFamily: {
        // Accessible fonts celebrating cultural authenticity
        'liberation': ['Inter', 'system-ui', 'sans-serif'],
        'celebration': ['Poppins', 'Inter', 'sans-serif'],
        'accessible': ['system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        // Touch-friendly spacing for accessibility
        '18': '4.5rem',   // 72px - accessible touch targets
        '22': '5.5rem',   // 88px - generous touch areas
      },
      animation: {
        // Professional animations for inspiring UX
        'gentle-fade': 'fadeIn 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
        'soft-slide': 'slideIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'celebration': 'celebration 2s ease-in-out',
        'float': 'gentleFloat 3s ease-in-out infinite',
        'liberation-glow': 'liberationGlow 4s ease-in-out infinite',
        'scroll-fast': 'scroll 15s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        celebration: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '25%': { transform: 'scale(1.02) rotate(0.5deg)' },
          '75%': { transform: 'scale(1.02) rotate(-0.5deg)' },
        },
        gentleFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        liberationGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 105, 180, 0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 105, 180, 0.3), 0 0 60px rgba(139, 0, 139, 0.2)' },
        },
        scroll: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [
    // Accessibility-focused plugins would go here if installed
  ],
}