# Habit Tracker Application

## Overview

This is a modern habit tracking web application built with React and TypeScript that helps users build and maintain positive habits through visual feedback and mathematical progress tracking. The application uses a unique mathematical formula to calculate habit strength based on successful completions (x1) versus missed days (x2), displaying progress through interactive graphs and calendars. Users can track multiple habits across different categories, view their formation progress, and get insights into their habit-building journey. The app now uses MongoDB Atlas for persistent storage that survives auto-scale environments and is easily deployable on Vercel.

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
- **Database**: MongoDB Atlas (free tier) for cloud-native scalability and auto-scaling compatibility
- **ODM**: Mongoose with TypeScript schema definitions for type-safe database operations
- **Connection Management**: Cached connection pattern optimized for serverless deployments
- **Data Persistence**: Automatic missed day tracking with database persistence across server restarts

### Mathematical Model (Updated August 2025)
- **Sigmoid Formula**: H(d) = 1 / (1 + e^{-k(d - d₀)}) where d = successful days in last 60 days
- **Parameters**: k = 0.2 (steepness factor), d₀ = 0.19 (inflection point)
- **Tipping Point**: 0.5 output represents habit formation beginning (50% strength)
- **Data Window**: Only considers last 60 days for all calculations
- **Status Classification**: struggling < 50%, building 50-80%, formed ≥80%
- **Progress Visualization**: Real-time sigmoid curve with current position marker

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
- **Mongoose**: MongoDB object modeling with TypeScript support
- **MongoDB Atlas**: Free cloud database with automatic scaling and backup
- **Vercel Deployment**: Serverless deployment platform optimized for Node.js applications

### Development and Build Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution for development server
- **PostCSS**: CSS processing with Tailwind CSS integration
- **Replit Integration**: Development environment optimization plugins