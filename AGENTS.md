# AI Agent Guidelines

This document outlines the rules and standards that AI agents must follow when working on this project.

## 1. Components
- **Tech**: We use Material UI to build the components: https://mui.com/material-ui/getting-started/
- **Location**: All reusable components (e.g., alerts, buttons, inputs, error displays) must be used from `app/components`.
- **Creation**: If a required component does not exist in `app/components` (or `app/components/ui`), you must create it there. Do not define new UI components inline or in page/feature directories if they have potential for reuse.

## 2. Data Handling & Forms
- **Forms**: Use HTML `<form>` elements for all data entry and mutation.
- **Server Actions**: Use standard Next.js Server Actions.
- **State Management**:
  - Do **not** use `useState` for managing form data or submission status (loading, success, error) manually.
  - **Must** use `useActionState` react hook to handle data management.

## 3. Icons
- Use the `react-icons` package for all icons.
- Import specific icons as needed (e.g., `import { FaUser } from "react-icons/fa";`).

## 4. Date Display
- **Component**: Always use the `DateDisplay` component from `app/components/ui` when rendering dates in the UI.
- **Import**: `import { DateDisplay } from "@/app/components/ui";`
- **Usage**: `<DateDisplay date={dateString} />` or `<DateDisplay date={dateObject} />`
- **Why**: The `DateDisplay` component uses UTC methods to avoid timezone conversion issues, ensuring dates display correctly regardless of the user's local timezone. Never use `toLocaleDateString()` or similar methods directly, as they can cause date shifts due to timezone conversions.
- **Props**: 
  - `date` (required): string or Date object
  - `locale` (optional): locale string, defaults to "pt-BR"
  - `className` (optional): additional CSS classes

## 5. Mobile-First Design
- **Priority**: This application is primarily for mobile usage.
- **Approach**: Implement UI with a mobile-first strategy. Base styles should target mobile viewports, with responsive overrides (e.g., `md:`, `lg:`) added for larger screens only as secondary enhancements.
