# React Native Marketplace App

A mobile marketplace application built with React Native, Expo, and Firebase.

## Features

- User authentication (login/signup)
- Product marketplace
- Real-time chat
- Admin dashboard
- Analytics tracking
- Service categories
- User profiles

## Tech Stack

- React Native
- Expo Router
- Firebase (Authentication, Firestore, Cloud Functions)
- TypeScript
- ESLint for code quality

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/realzavage/New-here.git
cd New-here
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## Development

### Code Structure

- `/app` - Application routes and screens
- `/components` - Reusable React components
- `/contexts` - React Context providers
- `/lib` - Firebase and other utility functions
- `/types` - TypeScript type definitions
- `/hooks` - Custom React hooks

### Git Workflow

We follow the Conventional Commits specification for commit messages:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `style:` for formatting
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance

### Branch Protection Rules

- `main` branch is protected
- Pull requests require review
- Status checks must pass before merging
- Linear history is enforced (no merge commits)

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run tests and type checking
4. Create a pull request
5. Wait for review and approval

## Scripts

- `npm start` - Start the Expo development server
- `npm run ios` - Start iOS simulator
- `npm run android` - Start Android emulator
- `npm run web` - Start web version
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks

## License

This project is licensed under the MIT License - see the LICENSE file for details
