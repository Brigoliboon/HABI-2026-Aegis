# Project Overview

## Description
GeoDotica is a decision-support platform designed to help education planners, policymakers, and institutions identify where educational intervention is most urgently needed. The system combines education, poverty, nutrition, disaster, and location-based data into one intelligent mapping system to enable proactive, data-driven education planning. Core objectives include predicting high-risk learning poverty zones, reducing manual analysis time, and improving resource allocation for education interventions.

## Themes

### Brand Identity
- Brand name: GeoDotica
- Tagline: AI-Powered Geospatial Education Intelligence System
- Primary identity: Data-driven, geospatial, educational intelligence

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
- Intuitive data visualization with clear information hierarchy
- Performance optimization through code splitting and lazy loading
- Geospatial-first interface with map-centric navigation

### Color Palette
- Primary Brand: Deep Navy #0F3A64 (headers, main actions, branding)
- Secondary: Ocean Blue #135084 (navigation, accents, interactive elements)
- Accent: Teal #2A94A0 (links, tertiary buttons, data visualization)
- Success/Positive: Mint #2FB290 (highlights, positive indicators)
- Subtle Background: Light Mint #70D2AE (soft backgrounds, disabled states)
- Neutral Background: White #FFFFFF (primary background)
- Semantic colors with consistent meaning across all visualizations
- WCAG-compliant contrast ratios for text and interactive elements

### Card & Data Panel Design
- Clean card design with subtle borders for data distinction
- Border radius: 8px standard, 12px for prominent panels
- Content padding: 16px mobile, 24px desktop for comfortable spacing
- Data visualization containers with proper aspect ratios
- Interactive states: elevation change, border highlight on hover/focus
- Loading states with skeleton screens for data placeholders
- Responsive behavior: stack vertically on mobile, grid on larger screens

### Buttons
- Primary: Solid background (#0F3A64), white text, for main actions
- Secondary: Outlined style with #135084 border, transparent background
- Tertiary: Text-only buttons with #2A94A0, minimal padding
- States: default, hover (darken 10%), active (darken 20%), disabled (opacity 50%)
- Sizes: small (32px), medium (40px), large (48px) height variants
- Icon integration: leading/trailing positions with proper spacing
- Accessibility: minimum 44px touch targets, ARIA labels, keyboard navigation

### Temperature
- Professional, analytical interface with blue-based palette emphasizing trust and intelligence
- Clean data visualization environment with focus on readability
- Light color temperature for clarity and precision
- Minimal visual noise to keep attention on data insights
- Generous whitespace for comfortable data exploration
- Consistent use of blues and teals throughout the analytical experience

### Pipelines
- Development: Next.js with TypeScript, ESLint, and Prettier for code quality
- Version control: Git with feature branch workflow
- Testing: Unit tests with Jest, component tests with React Testing Library
- Data validation: Schema validation for property and market datasets
- CI/CD: GitHub Actions for automated testing and deployment
- Deployment: Vercel for hosting with automatic builds on push
- Monitoring: Error tracking with Sentry, usage analytics for platform insights
- Code review process before merging to main branch

## Core Functionality and Requirements

### Features
- Multi-source data integration (education, poverty, nutrition, disaster risk)
- Interactive geospatial mapping with layered data visualization
- AI-powered predictive analytics for learning poverty risk zones
- Automated report generation with policy recommendations
- Customizable dashboards for different stakeholder needs
- Historical data comparison and trend analysis
- Export capabilities for reports and visualizations
- User authentication and role-based access control
- Data upload and API integration capabilities
- Responsive design for all device sizes

### Technical Requirements
- Next.js 14+ with App Router architecture
- TypeScript for type safety
- Mapbox GL JS for interactive geospatial visualization
- TensorFlow.js for AI/ML predictive models
- Responsive charts and data visualization components
- API integration for government data sources (PSA, DepEd, etc.)
- SEO optimization and meta tag management
- Accessibility compliance (WCAG 2.1 AA)
- Performance targets: Core Web Vitals passing
- Geospatial data processing and rendering optimization
- Data validation: Schema validation for education and socio-economic datasets

### Constraints
- Mobile-first development approach
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Data privacy and security compliance (Philippines data protection laws)
- Scalable architecture for national and ASEAN regional expansion
- Integration with existing government data systems and APIs

## Environment Details

Current time: 2026-05-08T01:06:02+08:00
