# CLAIRE Architecture Documentation

## Overview

CLAIRE (Competency-based Learning Analytics Insights and Reporting Environment) is a student dashboard application built with Next.js, TypeScript, and Tailwind CSS. This document provides an overview of the architecture and design decisions.

## Architecture

The application follows a client-side rendering approach with Next.js, using React for the UI components and TypeScript for type safety. The architecture is organized into several key layers:

### 1. UI Layer

- **Components**: Reusable React components that make up the user interface
- **Contexts**: React contexts for state management across components
- **Hooks**: Custom React hooks for shared logic

### 2. Data Layer

- **API Service**: Centralized service for data fetching
- **Mock Data**: Simulated data for development and testing
- **Types**: TypeScript interfaces for type safety

### 3. Utility Layer

- **Helper Functions**: Utility functions for common tasks
- **Constants**: Application constants and configuration

## Component Structure

Components are organized by feature and responsibility:

- **Layout Components**: Handle the overall layout of the application
- **Dashboard Components**: Display student data and visualizations
- **Form Components**: Handle user input and interactions
- **UI Components**: Reusable UI elements like buttons, cards, etc.

## Data Flow

1. User interacts with a component
2. Component calls the API service
3. API service fetches data (currently from mock data)
4. Data is returned to the component
5. Component updates its state and re-renders

## State Management

The application uses React Context for state management:

- **StudentContext**: Manages the current student and related data
- **UIContext**: Manages UI state like theme, language, etc.

## API Service

The API service (`services/api.ts`) is designed to be easily replaced with real API calls in the future. It currently uses mock data but follows the same patterns and interfaces that would be used with a real API.

## Mock Data

Mock data is structured to simulate a real API and includes:

- Student information
- Subject data
- Competency data
- Activity data

## Future Considerations

1. **Real API Integration**: Replace mock data with real API calls
2. **Authentication**: Add user authentication and authorization
3. **Caching**: Implement data caching for better performance
4. **Offline Support**: Add offline support for mobile devices
5. **Internationalization**: Expand language support

## Diagrams

### Component Hierarchy

\`\`\`
App
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── Navigation
│   │   └── UserMenu
│   └── Footer
├── Dashboard
│   ├── StudentSelector
│   ├── ProgressHeader
│   ├── SubjectCards
│   │   └── SubjectCard
│   └── CompetencyDetail
│       └── ActivityDetail
└── Settings
    ├── LanguageSelector
    ├── ThemeSelector
    └── NotificationSettings
\`\`\`

### Data Flow

\`\`\`
User → Component → API Service → Mock Data → Component → User
\`\`\`

### State Management

\`\`\`
StudentContext → Components → API Service → StudentContext
UIContext → Components → UIContext
\`\`\`

## Risk Rules

The dashboard implements consistent risk rules to identify students who need attention:

### At Risk
A student is considered "at risk" when their competency achievement percentage (achieved competencies divided by total competencies) is below their individual goal threshold.

\`\`\`typescript
// Student is at risk if:
percentage < individualGoal
\`\`\`

This is visually indicated with an amber warning triangle icon (🔺).

### Attendance Risk
A student is considered to have "attendance risk" when their attendance percentage is below the attendance threshold.

\`\`\`typescript
// Student has attendance risk if:
attendancePercentage < attendanceThreshold
\`\`\`

This is visually indicated with a blue clock icon (🕒).

These rules are consistently applied throughout the dashboard to ensure clear communication of student status.
