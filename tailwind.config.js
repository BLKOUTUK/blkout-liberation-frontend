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
        // Gentle animations for trauma-informed UX
        'gentle-fade': 'fadeIn 0.8s ease-in-out',
        'soft-slide': 'slideIn 0.6s ease-out',
        'celebration': 'bounce 1s ease-in-out',
      },
    },
  },
  plugins: [
    // Accessibility-focused plugins would go here if installed
  ],
}