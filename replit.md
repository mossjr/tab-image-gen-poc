# Overview

This is a full-stack web application for generating advertisement templates, built as a proof-of-concept (POC). The application appears to be designed for creating customizable ad graphics, potentially for harness racing or similar events, with a focus on canvas-based rendering and dynamic content generation.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript in a single-page application (SPA) architecture
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, accessible UI components
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Canvas Rendering**: Custom CanvasRenderer class for dynamic graphic generation with HTML5 Canvas API
- **Font Management**: Custom FontLoader utility for loading and managing Google Fonts (Montserrat)

## Backend Architecture
- **Framework**: Express.js server with TypeScript
- **Development Setup**: Hot module replacement and middleware-based request logging
- **API Structure**: RESTful API with `/api` prefix routing
- **Error Handling**: Centralized error middleware for consistent error responses
- **Storage Interface**: Abstracted storage layer with in-memory implementation (MemStorage) and interface for future database integration

## Data Storage Solutions
- **Database**: PostgreSQL configured through Drizzle ORM
- **ORM**: Drizzle with schema definitions in shared directory
- **Database Provider**: Neon Database serverless PostgreSQL
- **Schema Management**: Centralized schema definitions with Zod validation
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple

## Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL storage backend
- **User Schema**: Basic user model with username/password authentication structure
- **Validation**: Zod schemas for type-safe input validation and data transformation

## External Dependencies

### Core Technologies
- **Database**: Neon Database (serverless PostgreSQL)
- **Font Service**: Google Fonts (Montserrat family with multiple weights)
- **Development**: Replit-specific tooling for development environment

### Key Libraries
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Form Handling**: React Hook Form with Hookform resolvers
- **Date Utilities**: date-fns for date manipulation
- **Styling Utilities**: clsx and tailwind-merge for conditional CSS classes
- **Canvas Graphics**: Native HTML5 Canvas API for image generation

### Development Tools
- **Type System**: TypeScript with strict configuration
- **Code Quality**: ESBuild for production bundling
- **Development Server**: Vite with React Fast Refresh
- **Database Migrations**: Drizzle Kit for schema migrations

The application follows a modern full-stack architecture with clear separation of concerns, focusing on type safety, developer experience, and scalable data management. The canvas-based rendering system suggests the application is designed for generating dynamic graphics or advertisements with customizable content.