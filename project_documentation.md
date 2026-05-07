# Project Overview

## Description
Habi Demo is a real estate platform designed to streamline property discovery, valuation, and transaction processes. The system provides users with comprehensive property listings, transparent pricing data, and intuitive tools for exploring residential and commercial opportunities. Core objectives include delivering accurate property valuations, enabling seamless search experiences, and fostering trust through data-driven insights.

## Themes

### Brand Identity
- Brand name: GeoDotica
- Primary gradient: `linear-gradient(15.71deg, #0B3E64 -29.99%, #144C82 -2.76%, #1E8097 28.66%, #34B493 52.74%, #72D4AB 78.92%)`

### Font & Typography Approach
- Primary font family: System stack with Inter as preferred web font
- Typography scale: Modular scale with base 16px, using 1.25 ratio increments
- Hierarchy system: Clear distinction between display (32-48px), heading (24-32px), subheading (18-24px), body (16px), and caption (14px) styles
- Font weights: Regular (400), Medium (500), Bold (700) for visual emphasis
- Line heights: 1.2 for headings, 1.5-1.6 for body text ensuring readability
- Font smoothing and antialiasing optimizations for cross-platform consistency

### UI/UX Philosophy, Structure & Implementation Design
- Mobile-first responsive design with progressive enhancement
- Component-driven architecture using React with TypeScript
- Atomic design principles: atoms → molecules → organisms → templates → pages
- Consistent spacing system using 4px/8px grid intervals
- Flexible layout system with CSS Grid and Flexbox for adaptive containers
- Accessibility-first approach following WCAG 2.1 AA standards
- Intuitive navigation with clear information hierarchy and progressive disclosure
- Performance optimization through code splitting and lazy loading

### Color Palette
- Brand: GeoDotica with gradient - `linear-gradient(15.71deg, #0B3E64 -29.99%, #144C82 -2.76%, #1E8097 28.66%, #34B493 52.74%, #72D4AB 78.92%)`
- Deep Navy: #0F3A64 (primary brand color, main actions, headers)
- Ocean Blue: #135084 (secondary brand color, navigation, accents)
- Teal: #2A94A0 (interactive elements, links, tertiary buttons)
- Mint: #2FB290 (success states, positive indicators, highlights)
- Light Mint: #70D2AE (subtle backgrounds, disabled states, soft accents)
- White: #FFFFFF (primary background, text on dark surfaces)
- Semantic colors with consistent meaning across light/dark modes
- WCAG-compliant contrast ratios for text and interactive elements

### Card Design
- Subtle shadow system: 0px 1px 3px rgba(0,0,0,0.1), elevated states on hover
- Border radius: 8px standard, 12px for prominent cards
- Content padding: 16px mobile, 24px desktop for comfortable spacing
- Image aspect ratios: 16:9 for property photos with object-fit: cover
- Interactive states: elevation change, border highlight on hover/focus
- Loading states with skeleton screens for content placeholders
- Responsive behavior: stack vertically on mobile, grid on larger screens

### Buttons
- Primary: Solid background (#0F3A64), white text, prominent CTAs
- Secondary: Outlined style with #135084 border, transparent background
- Tertiary: Text-only buttons with #2A94A0, minimal padding
- States: default, hover (darken 10%), active (darken 20%), disabled (opacity 50%)
- Sizes: small (32px), medium (40px), large (48px) height variants
- Icon integration: leading/trailing positions with proper spacing
- Accessibility: minimum 44px touch targets, ARIA labels, keyboard navigation

### Temperature
- Cool-toned interface with blue-green gradient palette emphasizing trust and calm
- GeoDotica brand gradient provides dynamic visual identity (15.71deg flow)
- Light color temperature (6500K) for clean, modern aesthetic
- Soft, diffused shadows creating subtle depth without harshness
- Minimal border treatments favoring whitespace separation
- Clean, airy atmosphere with generous negative space
- Consistent use of blues, teals, and mint tones throughout the experience

### Pipelines
- Development: Next.js with TypeScript, ESLint, and Prettier for code quality
- Version control: Git with feature branch workflow
- Testing: Unit tests with Jest, component tests with React Testing Library
- CI/CD: GitHub Actions for automated testing and deployment
- Deployment: Vercel for hosting with automatic builds on push
- Monitoring: Error tracking with Sentry, performance analytics
- Code review process before merging to main branch

## Core Functionality and Requirements

### Features
- Advanced property search with filters (location, price, property type, features)
- Property valuation tool with comparative market analysis
- Interactive map integration for location-based discovery
- Property listing details with photo gallery, floor plans, and specifications
- Saved properties and personalized recommendations
- Contact forms and agent connection capabilities
- Responsive design for all device sizes

### Technical Requirements
- Next.js 14+ with App Router architecture
- TypeScript for type safety
- Responsive images and optimized asset loading
- API integration for property data and authentication
- SEO optimization and meta tag management
- Accessibility compliance (WCAG 2.1 AA)
- Performance targets: Core Web Vitals passing

### Constraints
- Mobile-first development approach
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Data privacy and security compliance
- Scalable architecture for future feature expansion

## Environment Details

Current time: 2026-05-07T04:35:20+08:00