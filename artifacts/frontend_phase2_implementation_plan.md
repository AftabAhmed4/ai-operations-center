# Frontend Phase 2: Dashboard UI

This phase focuses on wiring up the TanStack Query state management, configuring Axios with a mock interceptor so we can build the UI before hitting the real backend, and designing the rich dashboard view with metric cards and sparklines.

## User Review Required

> [!IMPORTANT]
> Please review this plan for the Dashboard UI. Once approved, I will begin implementing the code!

## Open Questions

> [!WARNING]
> - For the sparkline charts, I plan to install **`react-native-gifted-charts`** as it produces beautiful, modern charts easily without complex D3 configurations. Is this charting library acceptable for you?

## Proposed Changes

### 1. API Client & Mocking Setup
#### [NEW] `src/api/mocks.ts`
- Create static JSON responses representing the backend payload for `/api/v1/dashboard/metrics`.
#### [NEW] `src/api/client.ts`
- Configure the Axios instance.
- Set up an interceptor: if a request matches our dashboard endpoint, the interceptor will wait 800ms (to simulate network latency) and return the mock data instead of making a real network call.

### 2. State Management Configuration
#### [MODIFY] `App.tsx`
- Wrap the `RootNavigator` with TanStack Query's `QueryClientProvider` so the entire app can leverage `useQuery`.

### 3. Reusable Dashboard Components
#### [NEW] `src/components/common/MetricSparkline.tsx`
- A small, styled line chart using `react-native-gifted-charts` to drop into the metric cards.
- Will dynamically color itself green or red depending on whether the trend is positive or negative.

### 4. Dashboard Screen Implementation
#### [MODIFY] `src/screens/DashboardScreen.tsx`
- **Data Fetching**: Hook up `useQuery` to fetch the mocked metrics.
- **Skeletons**: Build a skeleton loading view to display while the mock query resolves.
- **UI Layout**: 
  - Add a pull-to-refresh `RefreshControl`.
  - Build a horizontal `ScrollView` containing `Card` components for Total Revenue, Active Campaigns, and Low Stock Alerts.
  - Implement a "Recent AI Actions" section below the cards showing a timeline-style list of simulated recent agent activities.

## Verification Plan

### Manual Verification
- In your running Expo app, navigating to the Dashboard tab should trigger an 800ms loading skeleton.
- The UI should then populate with beautifully styled horizontal metric cards containing sparkline charts.
- Pulling down from the top of the screen should show the refresh spinner and trigger the loading state again.
