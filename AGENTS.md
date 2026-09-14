# Workspace Agent Guidelines

## Expo & React Native Development
This repository contains an Expo React Native mobile application located in `frontend/`.

- **Router & Skills**: For all Expo/EAS work, consult the `expo-overview` skill first, then delegate to targeted skills such as `expo-router`, `expo-native-ui`, `expo-ui`, `expo-animation`, or `eas-*`.
- **Navigation**: Use `expo-router` file-based routing conventions.
- **Styling & UI**: Use NativeWind/Tailwind where configured, and consult `expo-ui` for platform-native components (`@expo/ui`).
- **Dependencies**: Keep Expo SDK packages aligned with the SDK version specified in `frontend/package.json` (SDK 57).
