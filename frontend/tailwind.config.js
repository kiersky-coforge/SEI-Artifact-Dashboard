import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Anek Latin"', 'system-ui', 'sans-serif'],
        headline: ['"Anek Latin"', 'system-ui', 'sans-serif'],
        body: ['Tahoma', 'Verdana', '"Segoe UI"', 'sans-serif'],
        sans: ['Tahoma', 'Verdana', '"Segoe UI"', ...defaultTheme.fontFamily.sans],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        // Stratos & DataVision Institutional Brand Palette
        brand: {
          navy: '#082340',
          'navy-dark': '#041324',
          'navy-light': '#14385f',
          coral: '#f15840',
          'coral-alert': '#e06d53',
          green: '#089f6a',
          blue: '#5f8ac7',
          black: '#141414',
          grey: '#5a5a5a',
          'grey-light': '#94a3b8',
        },
        // Official SEI Palette
        seic: {
          red: { DEFAULT: '#d82b2a', lighter: '#ffa6bf', light: '#ff6680', dark: '#d90000', foundational: '#990000' },
          blue: { DEFAULT: '#00c0f3', lighter: '#c7eafb', light: '#8ed8f8', dark: '#0094c1', foundational: '#005776' },
          green: { DEFAULT: '#a6ce39', lighter: '#e5edb2', light: '#d3e27e', dark: '#65ab3d', foundational: '#007733' },
          yellow: { DEFAULT: '#ffdd00', lighter: '#fff3b5', light: '#ffea82', dark: '#ecbc09', foundational: '#ce9810' },
          orange: { DEFAULT: '#faa519', lighter: '#ffe0ad', light: '#fdc578', dark: '#e87b1e', foundational: '#c74a1b' },
          pink: { DEFAULT: '#f287b7', lighter: '#fad5e5', light: '#f7b7d3', dark: '#d95293', foundational: '#a0386c' },
          gray: { lighter: '#f1f2f2', light: '#e6e7e8', DEFAULT: '#c7c8ca', dark: '#939598', darker: '#58595b' },
          black: '#131517',
          navy: { light: '#c3ccd2', medium: '#57728b', DEFAULT: '#254a5d' },
        },
        // Layer 2 — Semantic tokens bound to CSS variables
        page: 'var(--bg-page)',
        surface: {
          DEFAULT: 'var(--surface)',
          hover: 'var(--surface-hover)',
          border: 'var(--surface-border)',
          card: 'var(--surface-card)',
        },
        ink: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          brand: 'var(--text-brand)',
        },
        action: {
          primary: 'var(--action-primary)',
          'primary-hover': 'var(--action-primary-hover)',
          'primary-active': 'var(--action-primary-active)',
          secondary: 'var(--action-secondary)',
          accent: 'var(--action-accent)',
          'accent-foreground': 'var(--action-accent-foreground)',
        },
        focus: 'var(--focus-ring)',
        input: 'var(--border-input)',
        emphasis: 'var(--border-emphasis)',
        status: {
          error: 'rgb(var(--status-error) / <alpha-value>)',
          'error-text': 'rgb(var(--status-error-text) / <alpha-value>)',
          success: 'rgb(var(--status-success) / <alpha-value>)',
          'success-text': 'rgb(var(--status-success-text) / <alpha-value>)',
          warning: 'rgb(var(--status-warning) / <alpha-value>)',
          'warning-text': 'rgb(var(--status-warning-text) / <alpha-value>)',
          info: 'rgb(var(--status-info) / <alpha-value>)',
          'info-text': 'rgb(var(--status-info-text) / <alpha-value>)',
          pending: 'rgb(var(--status-pending) / <alpha-value>)',
          'pending-text': 'rgb(var(--status-pending-text) / <alpha-value>)',
          neutral: 'rgb(var(--status-neutral) / <alpha-value>)',
          'neutral-text': 'rgb(var(--status-neutral-text) / <alpha-value>)',
        },
      },
      borderRadius: {
        level1: '6px',
        level2: '12px',
        level3: '18px',
        level4: '24px',
        level5: '48px',
      },
      boxShadow: {
        level1: 'var(--shadow-level1)',
        level2: 'var(--shadow-level2)',
        level3: 'var(--shadow-level3)',
        level4: 'var(--shadow-level4)',
        level5: 'var(--shadow-level5)',
        card: 'var(--shadow-level1)',
        hover: 'var(--shadow-level3)',
      },
    },
  },
  plugins: [],
}
