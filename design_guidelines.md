# Design Guidelines: Modern Web Application

## Design Approach

**Selected Approach:** Design System with Modern Web Inspiration (Hybrid)

Drawing from Linear's clean typography, Stripe's sophisticated color restraint, and Vercel's spatial hierarchy. This creates a professional, scalable foundation suitable for various web applications while maintaining visual sophistication.

**Key Principles:**
- Clarity over decoration
- Purposeful whitespace
- Confident typography
- Restrained color palette with strategic accents

## Core Design Elements

### Color Palette

**Light Mode:**
- Background: 0 0% 100%
- Surface: 0 0% 98%
- Border: 240 6% 90%
- Text Primary: 240 10% 4%
- Text Secondary: 240 4% 46%
- Primary: 250 95% 58%
- Primary Hover: 250 95% 52%
- Accent: 160 84% 39%

**Dark Mode:**
- Background: 240 10% 4%
- Surface: 240 8% 8%
- Border: 240 4% 16%
- Text Primary: 0 0% 98%
- Text Secondary: 240 5% 65%
- Primary: 250 95% 62%
- Primary Hover: 250 95% 68%
- Accent: 160 84% 45%

### Typography

**Fonts:** Inter (primary), JetBrains Mono (code)

**Scale:**
- Hero: text-6xl md:text-7xl lg:text-8xl, font-bold, tracking-tight
- H1: text-4xl md:text-5xl, font-bold, tracking-tight
- H2: text-3xl md:text-4xl, font-semibold
- H3: text-2xl md:text-3xl, font-semibold
- Body: text-base md:text-lg, font-normal, leading-relaxed
- Small: text-sm, font-medium
- Code: font-mono, text-sm

### Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24, 32

**Containers:**
- Page wrapper: max-w-7xl mx-auto px-4 md:px-6 lg:px-8
- Content sections: py-20 md:py-24 lg:py-32
- Card padding: p-6 md:p-8
- Component spacing: space-y-8 or gap-8

**Grid System:**
- Feature cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Two-column: grid-cols-1 lg:grid-cols-2 gap-12
- Always stack to single column on mobile

### Component Library

**Navigation:**
- Fixed header with backdrop-blur-md bg-background/80
- Clean horizontal menu with subtle hover states
- Mobile: Slide-out drawer with overlay
- Height: h-16 md:h-20
- CTA button in header (primary color)

**Buttons:**
- Primary: Full primary color, medium rounded (rounded-lg), px-6 py-3
- Secondary: Border with transparent bg, same padding
- On images: Backdrop blur (backdrop-blur-md bg-white/10 dark:bg-black/20)
- Sizes: Small (px-4 py-2), Medium (px-6 py-3), Large (px-8 py-4)

**Cards:**
- Background: Surface color
- Border: 1px border color
- Rounded: rounded-xl
- Shadow: Subtle (shadow-sm hover:shadow-md transition)
- Padding: p-6 md:p-8

**Forms:**
- Input fields: Border style, rounded-lg, px-4 py-3
- Labels: text-sm font-medium mb-2
- Consistent dark mode styling across all inputs
- Focus: Ring-2 ring-primary
- Spacing: space-y-6 for form groups

**Data Display:**
- Tables: Minimal borders, alternating row colors subtle
- Stats: Large numbers (text-4xl font-bold) with small labels below
- Progress bars: Rounded-full, height h-2

### Hero Section

**Layout:**
- Full-width background: Large, high-quality hero image with gradient overlay (from-background/90 to-background/60)
- Height: min-h-[600px] md:min-h-[700px]
- Content: Centered, max-w-4xl
- Elements: Headline + subheadline + CTA buttons (primary + secondary outline with blur)
- Badge above headline showing key value prop or stats
- Padding: py-32 md:py-40

**Image:**
- Large hero image showing product/service in action or abstract modern visuals
- Professional photography or high-quality illustrations
- Optimized for web (WebP format)
- Alt text describing scene

### Additional Sections

**Features (3-column grid):**
- Icon (48x48) + title + description
- Cards with hover lift effect
- Icons from Heroicons

**Benefits/Value Props (2-column alternating):**
- Image + text alternating left/right
- Generous spacing between sections (py-20)
- Images showing real product usage

**Social Proof:**
- Logo cloud of partners/clients (grayscale, hover color)
- Testimonial cards (3-column on desktop)
- Customer photos (rounded-full, w-12 h-12)

**CTA Section:**
- Bold background (primary or accent color)
- Contrasting text and button
- Supporting copy + primary action
- py-24 padding

**Footer:**
- Multi-column: Company info, product links, resources, social
- Newsletter signup form
- Legal links
- Background: Surface color, border-top

### Animations

Use sparingly:
- Fade-in on scroll for sections (opacity + translateY)
- Hover states: scale-105 or shadow transitions
- Page transitions: Smooth fade
- No autoplay animations

### Images Strategy

**Required Images:**
1. Hero: Large hero image (1920x1080) - product showcase or lifestyle
2. Feature visuals: 3-4 supporting images (800x600) showing key features
3. Testimonial photos: Customer headshots (400x400)
4. Logo assets: Partner/client logos (SVG preferred)

All images should use lazy loading and responsive srcset for performance.