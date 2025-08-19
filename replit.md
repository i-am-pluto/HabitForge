# Habit Tracker Application

## Overview

This is a modern habit tracking web application built with React and TypeScript that helps users build and maintain positive habits through visual feedback and mathematical progress tracking. The application uses a unique mathematical formula to calculate habit strength based on successful completions (x1) versus missed days (x2), displaying progress through interactive graphs and calendars. Users can track multiple habits across different categories, view their formation progress, and get insights into their habit-building journey.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern React features
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Components**: Shadcn/ui component library built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS custom properties for theming and responsive design
- **State Management**: React hooks (useState, useEffect) combined with custom hooks for habit management
- **Data Visualization**: Chart.js for rendering mathematical habit strength graphs
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Client-side Storage**: localStorage for persisting habit data without backend dependency

### Backend Architecture
- **Server Framework**: Express.js with TypeScript for API endpoints
- **Development Stack**: Node.js with tsx for TypeScript execution in development
- **Middleware**: Custom logging middleware for API request monitoring
- **Architecture Pattern**: Modular route registration with separation of concerns
- **Storage Interface**: Abstracted storage layer with in-memory implementation (MemStorage class)
- **Error Handling**: Centralized error handling middleware for consistent API responses

### Data Storage Solutions
- **Database**: PostgreSQL configured through Drizzle ORM for production scalability
- **ORM**: Drizzle ORM with TypeScript-first schema definitions
- **Migration System**: Drizzle Kit for database schema migrations
- **Local Storage**: Browser localStorage for client-side habit data persistence
- **Session Management**: PostgreSQL session store (connect-pg-simple) for user sessions

### Mathematical Model
- **Habit Formula**: y = 0.5 × e^(0.1×(x1-x2)) where x1 = successes, x2 = misses
- **Progress Calculation**: Habit formation occurs when y-value equals or exceeds days since start
- **Status Classification**: Three-tier system (struggling < 50%, building 50-99%, formed ≥100%)
- **Prediction Algorithm**: Exponential estimation for days remaining to habit formation

### Component Architecture
- **HabitTracker**: Main container component managing overall state and layout
- **HabitGraph**: Chart.js integration for visualizing mathematical habit progression
- **HabitCalendar**: Monthly calendar view showing completion/missed day patterns
- **AddHabitModal**: Form modal for creating new habits with category selection
- **Custom Hooks**: useHabits hook encapsulating all habit-related business logic and state management

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form for modern React development
- **TypeScript**: Full TypeScript support across client and server
- **Vite**: Development server and build tool with hot module replacement

### UI and Styling
- **Radix UI**: Complete primitive component library for accessible UI elements
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Shadcn/ui**: Pre-built component library with consistent design patterns
- **Lucide React**: Modern icon library for UI icons

### Data and State Management
- **Zod**: Runtime type validation for forms and API data
- **TanStack React Query**: Server state management and data fetching
- **Chart.js**: Interactive charts for mathematical visualization

### Backend and Database
- **Express.js**: Web application framework for Node.js
- **Drizzle ORM**: Type-safe SQL toolkit and query builder
- **Neon Database**: Serverless PostgreSQL for cloud deployment
- **Connect PG Simple**: PostgreSQL session store for Express sessions

### Development and Build Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution for development server
- **PostCSS**: CSS processing with Tailwind CSS integration
- **Replit Integration**: Development environment optimization plugins