# Contributing to Football Lineup Builder

First off, thank you for considering contributing to Football Lineup Builder! It's people like you that make this project great.

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [How to Contribute](#how-to-contribute)
5. [Style Guidelines](#style-guidelines)
6. [Pull Request Process](#pull-request-process)

---

## Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [project maintainers].

---

## Getting Started

### Project Overview
Football Lineup Builder is a React-based web application for creating, saving, and sharing football lineups. The project uses:
- React 18 with Hooks
- Context API for state management
- CSS for styling
- Jest for testing
- Docker for containerization

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Docker (optional, for containerized development)

---

## Development Setup

### Local Development
1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/apiplayer.git
   cd apiplayer/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:3000`

### Docker Development
```bash
docker-compose up client-dev
```

---

## How to Contribute

### Reporting Bugs
Bugs are tracked as GitHub issues. Create an issue and provide the following information:
- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed** and what you expected to see
- **Include screenshots** if possible

### Suggesting Enhancements
Enhancement suggestions are also tracked as GitHub issues. When creating an enhancement suggestion:
- **Use a clear and descriptive title**
- **Provide a step-by-step description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List some other applications where this enhancement exists** if applicable

### Pull Requests
- Fork the repository and create your branch from `main`
- If you've added code that should be tested, add tests
- If you've changed APIs, update the documentation
- Ensure the test suite passes
- Make sure your code follows the style guidelines
- Issue that pull request!

---

## Style Guidelines

### Git Commit Messages
- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### JavaScript/React Styleguide
- Use functional components with Hooks
- Follow React best practices and conventions
- Use Prettier for code formatting
- ESLint will catch most style issues
- Run `npm run lint` before submitting PRs

### CSS Styleguide
- Use CSS variables for consistent theming
- Follow BEM naming conventions where appropriate
- Ensure dark mode compatibility
- Test responsiveness on different screen sizes

### Testing
- All new features should include tests
- Use Jest and React Testing Library
- Run `npm test` to ensure all tests pass
- Aim for meaningful test coverage

---

## Pull Request Process

1. **Update the README.md** with details of changes to the interface
2. **Increase the version numbers** in example files and README to the new version
3. **The pull request will be merged** once you have the sign-off of two other developers
4. **Squash your commits** before merging to keep the history clean

---

## Additional Notes

### Issue and Pull Request Labels
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `documentation` - Improvements or additions to documentation

### Testing the Build
Before submitting a PR, always run:
```bash
npm run build
npm test
npm run lint
```

Thank you for contributing! 🎉