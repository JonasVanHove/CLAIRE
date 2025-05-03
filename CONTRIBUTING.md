# Contributing to CLAIRE Student Dashboard

Thank you for considering contributing to the CLAIRE Student Dashboard! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to foster an inclusive and respectful community.

## How Can I Contribute?

### Reporting Bugs

- Check if the bug has already been reported in the Issues section
- Use the bug report template to create a new issue
- Include detailed steps to reproduce the bug
- Include screenshots if applicable
- Specify the browser and operating system you're using

### Suggesting Enhancements

- Check if the enhancement has already been suggested in the Issues section
- Use the feature request template to create a new issue
- Clearly describe the enhancement and its benefits
- Include mockups or examples if applicable

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Run tests and ensure they pass
5. Update documentation if necessary
6. Commit your changes (`git commit -m 'Add some feature'`)
7. Push to the branch (`git push origin feature/your-feature-name`)
8. Open a Pull Request

## Development Guidelines

### Code Style

- Follow the existing code style
- Use TypeScript for type safety
- Use ESLint and Prettier for code formatting
- Write meaningful variable and function names
- Keep functions small and focused on a single task

### Documentation

- Document all public functions, classes, and interfaces using JSDoc comments
- Update the README.md if necessary
- Add comments for complex code sections
- Document any non-obvious behavior

### Testing

- Write tests for new features
- Ensure all tests pass before submitting a pull request
- Test your changes in different browsers if applicable

### Commit Messages

- Use clear and descriptive commit messages
- Start with a verb in the present tense (e.g., "Add", "Fix", "Update")
- Reference issue numbers if applicable

## Documentation Guidelines

### JSDoc Comments

Use JSDoc comments for all public functions, classes, and interfaces. Example:

\`\`\`typescript
/**
 * Calculates the average score for a student
 * 
 * @param {string} studentName - The name of the student
 * @param {string} subject - The subject to calculate the average for
 * @returns {number} The average score
 */
function calculateAverageScore(studentName: string, subject: string): number {
  // Implementation
}
\`\`\`

### Component Documentation

For React components, document:
- The purpose of the component
- Props with types and descriptions
- Examples of usage
- Any side effects or important behaviors

### File Headers

Add a header comment to each file explaining its purpose:

\`\`\`typescript
/**
 * Student Dashboard API Service
 * 
 * This file contains the API service for the Student Dashboard.
 * It handles all data fetching and provides a consistent interface
 * for retrieving student data, competencies, and activities.
 */
\`\`\`

## Getting Help

If you need help with contributing, please:
- Join our community chat
- Ask questions in the Issues section
- Contact the maintainers directly

Thank you for contributing to CLAIRE Student Dashboard!
