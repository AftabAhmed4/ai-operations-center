# Frontend Phase 1: Foundation, Navigation, and Theme

This phase initiates the mobile application frontend using Expo, configures the styling framework, sets up the core navigation stack, and builds the foundational UI components based on your enterprise SaaS design guidelines.

## User Review Required

> [!IMPORTANT]
> Please review this implementation plan. Once approved, I will generate the permanent Phase 1 artifacts in your `artifacts/` folder and begin building the Expo application.

## Open Questions

> [!WARNING]
> - Do you prefer using **NativeWind v2** (easier setup) or **NativeWind v4** (newer, closer to web Tailwind but requires custom Metro config)? I recommend v2 for a hackathon for speed and stability, unless you specifically need v4 features. Let me know which to install!
> - The plan specifies `blank-typescript` template to keep things clean. Is that acceptable, or would you prefer the Expo `tabs` template out of the box?

## Proposed Changes

### 1. App Initialization
- Run `npx create-expo-app mobile-app -y --template blank-typescript` to create the project in the `/mobile-app` directory.

### 2. Dependencies
- Install **Navigation**: `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack`, and Expo navigation dependencies.
- Install **Styling**: `nativewind` and `tailwindcss`.
- Install **UI/State**: `lucide-react-native`, `zustand`, `@tanstack/react-query`, `axios`.
- Install **Animation**: `react-native-reanimated`, `moti`.

### 3. Folder Structure & Config
- Set up the `/mobile-app/src` directory with `api`, `components`, `navigation`, `screens`, `store`, `theme`, and `types`.
- Configure `tailwind.config.js` with your specific brand colors (`primary: #2563EB`, `background: #F8FAFC`, etc.).
- Update `babel.config.js` for NativeWind and Reanimated plugins.

### 4. Navigation Setup
- **`src/navigation/TabNavigator.tsx`**: Implement the bottom tab bar pointing to the 5 main areas (Dashboard, Operations, Products, Sales, Reports).
- **`src/navigation/RootNavigator.tsx`**: Main entry point wrapping the TabNavigator.

### 5. Screens & Reusable Components
- Create basic placeholder screens matching the plan: `DashboardScreen`, `OperationsCenterScreen`, `ProductsScreen`, `CampaignsScreen`, `SalesScreen`, `ReportsScreen`.
- Create foundational UI components:
  - **`ScreenWrapper`**: Standard background and padding.
  - **`Card`**: Standard styled container with soft shadow.
  - **`Button`**: Reusable touchable with the primary blue color.
  - **`Badge`**: Small pill-shaped indicator.

## Verification Plan

### Automated Tests / Manual Verification
- After setup, I will instruct you to run `cd mobile-app` and `npx expo start`.
- You will be able to load the app in the Expo Go app or an emulator.
- You should see the bottom navigation tabs and be able to click between the newly created empty screens, validating that the Tailwind theme and navigation are fully functional.
