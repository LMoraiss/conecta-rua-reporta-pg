
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Enhanced accent colors
				'accent-blue': 'hsl(218, 81%, 55%)',
				'accent-orange': 'hsl(25, 95%, 65%)',
				'glass-bg': 'hsla(0, 0%, 100%, 0.25)',
				'glass-border': 'hsla(0, 0%, 100%, 0.18)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				// Page transitions
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(10px)' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				// Modal animations
				'modal-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'modal-out': {
					'0%': { opacity: '1', transform: 'scale(1)' },
					'100%': { opacity: '0', transform: 'scale(0.95)' }
				},
				// Button animations
				'pulse-soft': {
					'0%, 100%': { transform: 'scale(1)', opacity: '1' },
					'50%': { transform: 'scale(1.05)', opacity: '0.8' }
				},
				'ripple': {
					'0%': { transform: 'scale(0)', opacity: '1' },
					'100%': { transform: 'scale(4)', opacity: '0' }
				},
				// Map marker animations
				'bounce-in': {
					'0%': { transform: 'translateY(-50px) scale(0)', opacity: '0' },
					'50%': { transform: 'translateY(0) scale(1.1)', opacity: '1' },
					'100%': { transform: 'translateY(0) scale(1)', opacity: '1' }
				},
				'marker-pulse': {
					'0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.7)' },
					'50%': { transform: 'scale(1.1)', boxShadow: '0 0 0 10px rgba(59, 130, 246, 0)' }
				},
				// Skeleton loading
				'skeleton': {
					'0%': { backgroundColor: 'hsl(210, 40%, 96%)' },
					'50%': { backgroundColor: 'hsl(210, 40%, 90%)' },
					'100%': { backgroundColor: 'hsl(210, 40%, 96%)' }
				},
				// Form animations
				'input-focus': {
					'0%': { borderColor: 'hsl(214.3, 31.8%, 91.4%)', boxShadow: 'none' },
					'100%': { borderColor: 'hsl(218, 81%, 55%)', boxShadow: '0 0 0 3px hsla(218, 81%, 55%, 0.1)' }
				},
				// Success animations
				'check-in': {
					'0%': { transform: 'scale(0) rotate(45deg)', opacity: '0' },
					'50%': { transform: 'scale(1.2) rotate(45deg)', opacity: '1' },
					'100%': { transform: 'scale(1) rotate(45deg)', opacity: '1' }
				},
				// Typewriter effect
				'typewriter': {
					'0%': { width: '0%' },
					'100%': { width: '100%' }
				},
				// Glass morphism glow
				'glass-glow': {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
				'modal-in': 'modal-in 0.2s ease-out',
				'modal-out': 'modal-out 0.2s ease-out',
				'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
				'ripple': 'ripple 0.6s ease-out',
				'bounce-in': 'bounce-in 0.6s ease-out',
				'marker-pulse': 'marker-pulse 2s infinite',
				'skeleton': 'skeleton 1.5s ease-in-out infinite',
				'input-focus': 'input-focus 0.2s ease-out',
				'check-in': 'check-in 0.3s ease-out',
				'typewriter': 'typewriter 2s steps(20) 1s forwards',
				'glass-glow': 'glass-glow 3s ease infinite'
			},
			backdropBlur: {
				xs: '2px',
			},
			boxShadow: {
				'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
				'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
				'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
