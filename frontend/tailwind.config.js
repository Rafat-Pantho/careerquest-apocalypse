/** @type {import('tailwindcss').Config} */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CareerQuest: The Apocalypse
 * Tailwind Configuration - The Dungeon & Dragons Design System
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This configuration defines the visual language of our RPG career platform.
 * Every color, font, and animation has been chosen to evoke the feeling of
 * an epic fantasy adventure while maintaining professional usability.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ═══════════════════════════════════════════════════════════════════════
      // COLOR PALETTE - The Essence of the Realm
      // ═══════════════════════════════════════════════════════════════════════
      colors: {
        // Parchment - Ancient paper backgrounds
        parchment: {
          50: '#fdfcf9',
          100: '#f9f5eb',
          200: '#f3ead4',
          300: '#e8d9b4',
          400: '#dcc58e',
          500: '#d4b76b',  // Primary parchment
          600: '#c9a44d',
          700: '#a8863d',
          800: '#8a6d35',
          900: '#71592e',
          950: '#3d2f17',
        },
        
        // Dungeon - Dark mysterious depths
        dungeon: {
          50: '#f6f6f7',
          100: '#e2e3e5',
          200: '#c5c6ca',
          300: '#a0a2a9',
          400: '#7c7f87',
          500: '#62656c',
          600: '#4d4f56',
          700: '#3f4146',  // Primary dark
          800: '#2d2f33',
          900: '#1a1b1e',  // Deepest dungeon
          950: '#0d0e10',
        },
        
        // Gold - Rewards, achievements, premium
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',  // Primary gold
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        
        // Mana - Magic, primary actions, links
        mana: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // Primary mana blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        
        // HP Red - Errors, danger, health
        'hp-red': {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',  // Primary danger red
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        
        // XP Green - Success, experience, growth
        'xp-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // Primary success green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        
        // Mystic Purple - Rare, special, mystical elements
        mystic: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',  // Primary mystic purple
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
      },

      // ═══════════════════════════════════════════════════════════════════════
      // TYPOGRAPHY - The Sacred Fonts
      // ═══════════════════════════════════════════════════════════════════════
      fontFamily: {
        // Fantasy headers - medieval/fantasy feel
        cinzel: ['Cinzel', 'serif'],
        // Alternative fantasy font for special elements
        medievalSharp: ['MedievalSharp', 'cursive'],
        // Clean body text for readability
        inter: ['Inter', 'sans-serif'],
        // Monospace for code/stats
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      
      fontSize: {
        // Custom sizes for RPG UI
        'stat': ['0.65rem', { lineHeight: '1' }],
        'badge': ['0.7rem', { lineHeight: '1.2' }],
        'quest-title': ['1.75rem', { lineHeight: '1.2', fontWeight: '700' }],
        'hero-name': ['2.5rem', { lineHeight: '1.1', fontWeight: '800' }],
        'epic': ['4rem', { lineHeight: '1', fontWeight: '900' }],
      },

      // ═══════════════════════════════════════════════════════════════════════
      // SHADOWS - Mystical Glows & Depths
      // ═══════════════════════════════════════════════════════════════════════
      boxShadow: {
        'parchment': '0 4px 6px -1px rgba(139, 109, 53, 0.3), 0 2px 4px -1px rgba(139, 109, 53, 0.2)',
        'gold-glow': '0 0 15px rgba(245, 158, 11, 0.5), 0 0 30px rgba(245, 158, 11, 0.3)',
        'mana-glow': '0 0 15px rgba(59, 130, 246, 0.5), 0 0 30px rgba(59, 130, 246, 0.3)',
        'danger-glow': '0 0 15px rgba(239, 68, 68, 0.5), 0 0 30px rgba(239, 68, 68, 0.3)',
        'mystic-glow': '0 0 15px rgba(168, 85, 247, 0.5), 0 0 30px rgba(168, 85, 247, 0.3)',
        'success-glow': '0 0 15px rgba(34, 197, 94, 0.5), 0 0 30px rgba(34, 197, 94, 0.3)',
        'stone': 'inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.4)',
        'stone-pressed': 'inset 0 4px 8px rgba(0, 0, 0, 0.5)',
        'dungeon': '0 10px 40px rgba(0, 0, 0, 0.5)',
      },

      // ═══════════════════════════════════════════════════════════════════════
      // BACKGROUNDS - Textures & Gradients
      // ═══════════════════════════════════════════════════════════════════════
      backgroundImage: {
        // Stone texture gradients
        'stone-gradient': 'linear-gradient(180deg, #4a4a52 0%, #3f4146 50%, #2d2f33 100%)',
        'stone-gradient-hover': 'linear-gradient(180deg, #5a5a62 0%, #4f5156 50%, #3d3f43 100%)',
        // Gold gradient for premium buttons
        'gold-gradient': 'linear-gradient(180deg, #fcd34d 0%, #f59e0b 50%, #d97706 100%)',
        'gold-gradient-hover': 'linear-gradient(180deg, #fde68a 0%, #fbbf24 50%, #f59e0b 100%)',
        // Mana/magic gradient
        'mana-gradient': 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)',
        'mana-gradient-hover': 'linear-gradient(180deg, #93c5fd 0%, #60a5fa 50%, #3b82f6 100%)',
        // Danger gradient
        'danger-gradient': 'linear-gradient(180deg, #f87171 0%, #ef4444 50%, #dc2626 100%)',
        // Parchment gradient
        'parchment-gradient': 'linear-gradient(180deg, #f9f5eb 0%, #f3ead4 50%, #e8d9b4 100%)',
        // Dark dungeon gradient
        'dungeon-gradient': 'linear-gradient(180deg, #1a1b1e 0%, #0d0e10 100%)',
      },

      // ═══════════════════════════════════════════════════════════════════════
      // BORDERS - Ornamental Frames
      // ═══════════════════════════════════════════════════════════════════════
      borderWidth: {
        '3': '3px',
      },
      borderRadius: {
        'stone': '4px',
        'scroll': '8px',
      },

      // ═══════════════════════════════════════════════════════════════════════
      // ANIMATIONS - Epic Motion
      // ═══════════════════════════════════════════════════════════════════════
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'level-up': 'level-up 0.6s ease-out',
        'gold-sparkle': 'gold-sparkle 1.5s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px currentColor, 0 0 10px currentColor' },
          '50%': { boxShadow: '0 0 20px currentColor, 0 0 40px currentColor' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
        'level-up': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'gold-sparkle': {
          '0%, 100%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.3)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },

      // ═══════════════════════════════════════════════════════════════════════
      // SPACING - Quest Measurements
      // ═══════════════════════════════════════════════════════════════════════
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
