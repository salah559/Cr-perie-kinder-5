# Crêperie Kinder 5 - Restaurant Website

## Overview

Crêperie Kinder 5 is a modern restaurant website for an authentic French crêperie with full e-commerce capabilities. The application allows customers to browse the menu, add items to a shopping cart, place orders with personal information, make reservations, and learn about the restaurant. Built as a full-stack web application, it features a React frontend with a Node.js/Express backend, utilizing PostgreSQL for data persistence.

## Recent Changes

**October 25, 2025 - Owner Email Authorization**
- Configured automatic owner role assignment via OWNER_EMAILS environment variable
- Designated emails (Crepriekinder5@gmail.com, oussamaanis2005@gmail.com) receive owner role on Google OAuth login
- Existing users are automatically upgraded to owner role if their email is in the authorized list
- New users from authorized emails are created with owner role directly

**October 22, 2025 - Social Authentication**
- Implemented Supabase OAuth social login integration with Google, GitHub, and Facebook
- Secure server-side token verification using Supabase Admin API
- OAuth callback handler with proper access token validation
- Social login buttons on login and signup pages
- Automatic user creation/matching for OAuth users
- Session management integration between Supabase and Express sessions

**October 20, 2025 - Shopping Cart & E-commerce**
- Full shopping cart system with persistent localStorage state management via CartContext
- Add-to-cart buttons on all menu items with visual feedback (toast notifications)
- Cart icon in navigation bar showing real-time item count
- Dedicated cart page with quantity controls, item removal, and total price calculation
- Checkout flow with customer information form (first name, last name, phone, email, message/timestamp)
- Order submission to backend API endpoint with cart clearing on success

**Visual & UX Enhancements**
- Luxurious golden/amber color scheme replacing previous red accents for premium aesthetic
- Animated crepe background on hero section with floating circular elements
- Golden glow effect on logo and primary UI elements
- Enhanced typography and spacing for sophisticated feel
- Improved shadows and elevation for depth

**Performance Optimizations**
- Route-based code splitting with React.lazy and Suspense
- Lazy loading for all page components to reduce initial bundle size
- Custom loading state for route transitions

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR (Hot Module Replacement)
- Wouter for lightweight client-side routing (single-page application)

**UI Design System**
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Design philosophy inspired by Linear, Stripe, and Vercel (clean typography, restrained colors, purposeful whitespace)
- Custom theme system supporting light/dark modes with HSL color variables
- Inter font for primary text, JetBrains Mono for code/monospace elements

**State Management**
- TanStack Query (React Query) for server state management, data fetching, and caching
- React Hook Form with Zod validation for form state and validation
- Context API for theme management and shopping cart state
- CartContext provides global cart state with localStorage persistence

**Component Organization**
- Page components in `client/src/pages/` (home, menu, cart, checkout, about, reservations, contact)
- Reusable UI components in `client/src/components/ui/`
- Feature-specific components in `client/src/components/`
- Shared type definitions in `shared/schema.ts` and `shared/cart-types.ts`
- Context providers in `client/src/contexts/` (CartContext, ThemeProvider)

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- TypeScript with ESM modules for type-safe backend development
- Custom middleware for request logging and error handling

**API Design**
- RESTful API endpoints under `/api/*` prefix
- JSON request/response format
- Endpoints for categories, menu items, reservations, and orders
- Configuration endpoint to securely pass environment variables to frontend

**Data Layer**
- In-memory storage implementation (`MemStorage`) for development
- Interface-based storage design (`IStorage`) allowing easy database integration
- Drizzle ORM configured for PostgreSQL with schema definitions
- Schema validation using Drizzle-Zod for runtime type checking

**Development Features**
- Vite middleware integration in development mode for seamless SPA serving
- Static file serving in production
- Request/response logging with timing information
- Error handling middleware with proper status codes

### Database Schema

**PostgreSQL with Drizzle ORM**
- `categories` - Menu categories (id, name, description, order)
- `menu_items` - Individual menu items with pricing and availability
- `reservations` - Customer reservation requests with contact info and party details
- `orders` - Customer orders (structure defined but implementation pending)

**Schema Design Decisions**
- UUID-based primary keys (varchar type) for distributed system compatibility
- Decimal type for monetary values to prevent floating-point precision issues
- Boolean flags for item availability and popularity
- Timestamp fields for audit trails
- Foreign key relationships maintaining referential integrity

### Styling Architecture

**Tailwind Configuration**
- Custom border radius scale (3px, 6px, 9px)
- HSL-based color system with alpha channel support
- CSS custom properties for dynamic theming
- Separate color definitions for light and dark modes
- Component-specific color variables (card, popover, sidebar borders)

**Design Tokens**
- Primary color: Golden/Amber (45° hue) for premium luxurious feel, CTAs and branding
- Accent color: Green (160° hue) for success states
- Neutral grays for backgrounds and text with subtle hue (240°)
- Elevation system using semi-transparent overlays for hover/active states
- Shadow system for depth and visual hierarchy
- Custom animations: floating crepe circles, golden glow effects

## External Dependencies

### Third-Party Services

**Supabase Integration**
- Authentication and additional backend services (optional)
- Client initialized via environment variables from server config endpoint
- Lazy initialization pattern to handle missing credentials gracefully

**Database**
- Neon Database (PostgreSQL) via `@neondatabase/serverless` driver
- Connection pooling for serverless environments
- Configured via `DATABASE_URL` environment variable

### Key NPM Packages

**UI Component Libraries**
- `@radix-ui/*` - Unstyled, accessible component primitives (dialogs, dropdowns, menus, etc.)
- `class-variance-authority` - Type-safe component variant management
- `cmdk` - Command palette/menu component
- `lucide-react` - Icon library

**Forms & Validation**
- `react-hook-form` - Performant form state management
- `@hookform/resolvers` - Integration with validation libraries
- `zod` - TypeScript-first schema validation
- `drizzle-zod` - Generate Zod schemas from Drizzle tables

**Data Fetching**
- `@tanstack/react-query` - Async state management and caching

**Date Handling**
- `date-fns` - Modern date utility library

**Build & Development Tools**
- `vite` - Frontend build tool
- `@vitejs/plugin-react` - React Fast Refresh support
- `tsx` - TypeScript execution for development server
- `esbuild` - Backend bundling for production
- `@replit/vite-plugin-*` - Replit-specific development enhancements

### Environment Variables Required

- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `SUPABASE_URL` - Supabase project URL (optional)
- `SUPABASE_ANON_KEY` - Supabase anonymous key (optional)
- `OWNER_EMAILS` - Comma-separated list of email addresses that should receive owner role (e.g., "email1@example.com,email2@example.com")
- `NODE_ENV` - Environment mode (development/production)