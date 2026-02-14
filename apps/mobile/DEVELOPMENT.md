# React Native Development Guide

This guide covers how to develop the Evergreen mobile app using React Native with Expo.

## Tech Stack

- **Framework**: Expo SDK 54 with Expo Router (file-based routing)
- **React**: React 19 with React Native 0.81
- **Navigation**: React Navigation (tabs + stack)
- **Animations**: React Native Reanimated
- **Gestures**: React Native Gesture Handler
- **Icons**: Expo Vector Icons (SF Symbols on iOS, Material Icons on Android)

## Project Structure

```
app/
  (tabs)/              # Tab navigation group
    _layout.tsx        # Tab bar configuration
    index.tsx          # Home screen
    squad.tsx          # Squad/friends screen
    rides.tsx          # Rides screen
    profile.tsx        # Profile screen
  _layout.tsx          # Root layout with navigation theme
components/
  ui/                  # Reusable UI components
    icon-symbol.tsx    # Cross-platform icon component
  haptic-tab.tsx       # Tab button with haptic feedback
  themed-text.tsx      # Text with theme support
  themed-view.tsx      # View with theme support
hooks/
  use-color-scheme.ts  # Light/dark mode detection
  use-theme-color.ts   # Theme color helper
constants/
  theme.ts             # Colors and fonts
```

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Or use the project script
npm run start
```

## File-Based Routing

Expo Router uses the file system for routing:

- `app/index.tsx` → `/`
- `app/(tabs)/rides.tsx` → `/rides`


### Creating New Screens

**Tab Screen** (add to bottom navigation):
1. Create file in `app/(tabs)/new-screen.tsx`
2. Add to `app/(tabs)/_layout.tsx`:

```tsx
<Tabs.Screen
  name="new-screen"
  options={{
    title: 'New Screen',
    tabBarIcon: ({ color }) => <IconSymbol size={28} name="star.fill" color={color} />,
  }}
/>
```



## Theming

The app supports automatic light/dark mode detection.

### Using Theme Colors

```tsx
import { useThemeColor } from '@/hooks/use-theme-color';

function MyComponent() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  
  return (
    <View style={{ backgroundColor }}>
      <Text style={{ color: textColor }}>Hello</Text>
    </View>
  );
}
```

### Using Themed Components

```tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

function MyScreen() {
  return (
    <ThemedView>
      <ThemedText type="title">Title Text</ThemedText>
      <ThemedText type="default">Body text</ThemedText>
    </ThemedView>
  );
}
```

### Text Types

- `default` - 16px regular text
- `defaultSemiBold` - 16px semi-bold
- `title` - 32px bold
- `subtitle` - 20px bold
- `link` - 16px colored link

## Icons

Use `IconSymbol` for cross-platform icons (SF Symbols on iOS, Material Icons on Android):

```tsx
import { IconSymbol } from '@/components/ui/icon-symbol';

<IconSymbol name="house.fill" size={28} color="#0a7ea4" />
```

### Available Icons

Current mappings in `components/ui/icon-symbol.tsx`:

| SF Symbol Name | Material Icon |
|---------------|---------------|
| `house.fill` | `home` |
| `paperplane.fill` | `send` |
| `person.3.fill` | `group` |
| `car.fill` | `directions-car` |
| `person.fill` | `person` |
| `chevron.right` | `chevron-right` |

Add new mappings when needed.

## Components

### Haptic Feedback on Tabs

The app uses haptic feedback on iOS tab presses (via `HapticTab` component). This is automatically applied to all tabs.

### Creating New Components

Place reusable components in `components/`:

```tsx
// components/my-button.tsx
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export function MyButton({ onPress, title }: { onPress: () => void; title: string }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 16,
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
});
```

## Path Aliases

Use `@/` prefix for imports from project root:

```tsx
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
```

## Development Tips

1. **Use Expo Go** for quick testing on physical devices
2. **Hot reload** works automatically - save files to see changes
3. **Test on both iOS and Android** - the app uses platform-specific features
4. **Run linter**: `npm run lint`
5. **New architecture is enabled** - uses React Native's new rendering system

## Common Tasks

### Adding a New Tab Icon

1. Add SF Symbol name → Material Icon mapping in `components/ui/icon-symbol.tsx`
2. Use the SF Symbol name in your tab configuration

### Customizing Theme Colors

Edit `constants/theme.ts`:

```ts
export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#0a7ea4',      // Primary accent color
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#0a7ea4',
  },
  dark: {
    // ... dark mode colors
  },
};
```



## API Integration

When connecting to the backend:

1. Create service files in a new `services/` directory
2. Use environment variables for API URL (add to `.env`):
   ```
   EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
   ```
3. Access in code: `process.env.EXPO_PUBLIC_API_URL`

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native](https://reactnative.dev/)
- [SF Symbols](https://developer.apple.com/sf-symbols/) (iOS icons)
