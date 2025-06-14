# Drowse App

Drowse is a React Native application designed to help parents monitor and manage their children's screen time with features like eye detection and toddler mode.

## Features

- 👀 Eye Detection: Monitors user's eye movement and position
- 🔒 Toddler Mode: Automatically locks screen at set intervals
- 📱 Device Management: Control multiple connected devices
- 👤 User Authentication: Secure login and registration
- 📊 Activity Tracking: Monitor screen time and usage patterns

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Git

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Bismay07/drowse.git
   cd drowse
   ```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
- Create a `.env` file in the root directory
- Add necessary environment variables (request from project maintainers)

## Development

### Running the App

1. Start Metro bundler:
```bash
npx expo start
```

2. Run on Android:
```bash
npx expo run:android
```

3. Run on iOS (macOS only):
```bash
npx expo run:ios
```

### Building APK

#### Development Build

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Build development APK:
```bash
npx expo build:android -t apk
```

#### Production Build

1. Configure app signing:
```bash
eas build:configure
```

2. Create production build:
```bash
eas build -p android --profile production
```

## Contributing

### Branch Strategy

- `main`: Production-ready code
- `development`: Main development branch
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Urgent production fixes

### Development Workflow

1. Fork the repository

2. Create a new branch from `development`:
```bash
git checkout development
git pull origin development
git checkout -b feature/your-feature-name
```

3. Make your changes following our coding standards:
- Use TypeScript for type safety
- Follow existing code style
- Add comments for complex logic
- Update tests if necessary

4. Commit your changes:
```bash
git add .
git commit -m "feat: add your feature description"
```

5. Push to your fork:
```bash
git push origin feature/your-feature-name
```

6. Create a Pull Request:
- Target the `development` branch
- Provide detailed description of changes
- Add screenshots for UI changes
- Reference related issues

### Code Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your code will be merged

### Commit Message Guidelines

Follow the Conventional Commits specification:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

## App Usage Guide

### First Time Setup

1. Install the app from Play Store or build from source
2. Create an account or sign in
3. Grant necessary permissions:
   - Camera (for eye detection)
   - Device Admin (for screen locking)

### Features

#### Toddler Mode
1. Navigate to Settings
2. Enable "Toddler Mode"
3. Set screen lock interval
4. Activate the mode

#### Eye Detection
1. Enable camera permission
2. Start eye detection from home screen
3. Position device appropriately
4. Monitor eye position warnings

#### Activity Tracking
1. View daily/weekly reports
2. Check screen time statistics
3. Monitor usage patterns

## Troubleshooting

### Common Issues

1. Build Errors
- Clear Metro bundler cache:
```bash
npx expo start --clear
```
- Reset node_modules:
```bash
rm -rf node_modules
npm install
```

2. Device Admin Issues
- Ensure proper permissions
- Check Android security settings

3. Eye Detection Problems
- Ensure good lighting
- Position device correctly
- Check camera permissions

## Support

For support, please:
1. Check existing issues
2. Create a new issue with details
3. Join our Discord community

## License

This project is licensed under the MIT License - see the LICENSE file for details.