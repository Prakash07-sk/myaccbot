# Overview

MyACCOBot is a desktop-based AI chatbot application designed specifically for financial and accounting teams. The application provides a conversational interface for analyzing financial data, particularly XML files, and serves as an internal assistant for finance professionals. Built as a full-stack application with React frontend and Express backend, it's designed to be bundled as an Electron desktop application.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom dark theme optimized for finance industry
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Desktop Integration**: Designed for Electron bundling (desktop app)

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Data Storage**: In-memory storage with interfaces designed for future database integration
- **API Design**: RESTful endpoints with structured error handling and logging middleware
- **File Processing**: Built-in XML file scanning and folder path management
- **Development Tools**: Vite integration for hot module replacement in development

## Core Features
- **Chat Interface**: Stateless conversational UI with message history management
- **File System Integration**: Folder browsing and XML file detection capabilities
- **Theme System**: Professional dark theme with Material Design principles
- **Notification System**: Dual notification approach using both react-toastify and custom toast components

## Design System
- **Color Palette**: Finance-focused with primary blues and accounting greens
- **Typography**: Inter font family for professional appearance
- **Component Library**: Comprehensive set of reusable UI components
- **Responsive Design**: Desktop-first approach with mobile considerations

## Data Flow
- **Client-Server Communication**: Axios-based API calls with centralized instance configuration
- **Message Management**: Chat messages stored with metadata including timestamps and user identification
- **File Handling**: Folder path validation and XML file enumeration on the server side

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React, React DOM, TanStack Query for state management
- **Build Tools**: Vite for development and building, ESBuild for server bundling
- **UI Components**: Radix UI primitives, shadcn/ui component system
- **Styling**: Tailwind CSS, class-variance-authority for component variants

## Database and ORM
- **Database**: PostgreSQL (configured but not yet implemented)
- **ORM**: Drizzle ORM with Neon Database serverless connector
- **Schema Management**: Drizzle Kit for migrations and schema management

## Development and Utilities
- **Type Checking**: TypeScript with strict configuration
- **HTTP Client**: Axios for API communications
- **Date Handling**: date-fns for date manipulation
- **Validation**: Zod for schema validation with Drizzle integration

## Notification and UI Enhancement
- **Toast Notifications**: react-toastify for user feedback
- **Icons**: Lucide React for consistent iconography
- **Form Handling**: React Hook Form with Hookform resolvers

## Server Infrastructure
- **Session Management**: Connect-pg-simple for PostgreSQL session store (prepared for future use)
- **Development**: tsx for TypeScript execution, runtime error overlay for debugging
- **File System**: Node.js fs/promises for file operations