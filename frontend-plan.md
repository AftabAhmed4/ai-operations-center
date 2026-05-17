# Frontend Implementation Plan: Autonomous AI Operations Center (NexusForge)

This document outlines the detailed implementation plan for the mobile frontend of the NexusForge Autonomous AI Operations Center, tailored for a polished, high-end hackathon demonstration.

---

## 1. Frontend Architecture Stack
- **Framework**: React Native with Expo (managed workflow)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management (Global & UI)**: Zustand
- **Server State & Caching**: TanStack Query (React Query)
- **Routing & Navigation**: React Navigation (Bottom Tabs & Native Stack)
- **API Client**: Axios (configured with interceptors for mocking & error handling)
- **Live Streaming**: `react-native-sse` or standard EventSource polyfill for Server-Sent Events (SSE)
- **Icons**: Lucide React Native (or Expo vector icons)
- **Animations**: React Native Reanimated & Moti (for polished, fluid enterprise animations)

---

## 2. Folder Structure

```text
/mobile-app
├── src/
│   ├── api/                 # Axios configuration, mock handlers, and API services
│   │   ├── client.ts
│   │   ├── mocks.ts         # Mock JSON responses for parallel development
│   │   └── endpoints/       # Specific API calls (dashboard, workflows, etc.)
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Buttons, Inputs, Cards, Badges, Typography
│   │   ├── layout/          # Screen wrappers, Headers
│   │   └── operations/      # Complex AI visualization components (LiveLogs, WorkflowTimeline)
│   ├── navigation/          # React Navigation setup
│   │   ├── RootNavigator.tsx
│   │   └── TabNavigator.tsx
│   ├── screens/             # Main screen components
│   │   ├── DashboardScreen.tsx
│   │   ├── OperationsCenterScreen.tsx
│   │   ├── ProductsScreen.tsx
│   │   ├── CampaignsScreen.tsx
│   │   ├── SalesScreen.tsx
│   │   ├── ReportsScreen.tsx
│   │   └── CRMScreen.tsx
│   ├── store/               # Zustand state stores
│   │   ├── uiStore.ts       # Global UI state (modals, active tabs)
│   │   └── aiWorkflowStore.ts # Dedicated state for live AI workflow streaming
│   ├── theme/               # NativeWind config and constants (Colors, Spacing)
│   ├── types/               # TypeScript interfaces
│   └── utils/               # Formatters, helpers, SSE handlers
├── app.json                 # Expo config
├── tailwind.config.js       # NativeWind Tailwind config
└── package.json
```

---

## 3. UI Consistency & UX Rules
- **Theme**: Light theme only. Modern, clean enterprise SaaS style.
- **Colors**: Primary (`#2563EB`), Background (`#F8FAFC`), Text (`#0F172A`), Success (`#16A34A`), Warning (`#EA580C`), Danger (`#DC2626`), Border (`#E2E8F0`).
- **Typography**: `Inter` font family. Use distinct font weights for hierarchy.
- **Component Styling**: Heavy use of soft shadows, rounded corners (`rounded-xl` or `rounded-2xl`), and spacious padding.
- **Animations**: Moti will be used for micro-interactions (button presses, list item appearances) and complex state transitions (AI workflow steps unlocking).

---

## 4. API Integration & Mocking Strategy
- **Parallel Development**: The frontend will initially use mocked JSON data configured via an Axios interceptor. When `USE_MOCKS=true` in `.env`, Axios returns local dummy data matching the expected backend schema.
- **Server State**: TanStack Query will handle data fetching, caching, loading states (`isLoading`), and background refetching for Dashboard, Products, and Campaigns.

---

## 5. SSE Workflow Streaming Strategy
- **Library**: `react-native-sse` or custom `fetch` wrapper.
- **State Handling**: The `aiWorkflowStore` (Zustand) will maintain the active workflow ID, current step, live log array, and `isAwaitingApproval` boolean.
- **Flow**:
  1. User triggers workflow -> API returns `workflowId`.
  2. UI opens SSE connection to `/api/v1/streaming/workflow/{workflowId}`.
  3. SSE events update the Zustand store in real-time.
  4. UI components seamlessly re-render the terminal logs and animated timeline based on the store.

---

## 6. Implementation Modules (Execution Order)

### Module 1: Foundation, Navigation, and Theme
- **Objective**: Scaffold the app, set up Tailwind/NativeWind, and configure routing.
- **Scope**: Bottom Tab navigation, base layout wrappers, custom header component. Implement basic global reusable UI components (Buttons, Cards, Badges).
- **Screens/Components**: `TabNavigator`, `ScreenWrapper`, `Button`, `Card`, `Badge`.
- **Frontend State**: None yet.
- **Testing Checklist**:
  - [x] App loads without crashing.
  - [x] Tabs navigate smoothly between empty screens.
  - [x] NativeWind utility classes apply correctly.

### Module 2: Dashboard UI
- **Objective**: Build the operational overview with mocked analytics data.
- **Scope**: Horizontal scroll view for metric cards, static charts/sparklines (using `react-native-svg-charts` or `react-native-gifted-charts`), and recent AI actions timeline.
- **Screens**: `DashboardScreen`.
- **APIs Required**: `GET /api/v1/dashboard/metrics` (Mocked).
- **State**: TanStack Query `useQuery` for metrics.
- **Testing Checklist**:
  - [x] Metric cards scroll horizontally smoothly.
  - [x] Refreshing the screen refetches TanStack Query.
  - [x] Loading skeletons appear while fetching data.

### Module 3: Products & Campaigns
- **Objective**: Implement the core inventory and promotional views.
- **Scope**: Search bars, filter chips, list views with expandable items. Highlight items with "AI Updated" or "AI Generated" badges.
- **Screens**: `ProductsScreen`, `CampaignsScreen`.
- **APIs Required**: `GET /api/v1/products`, `GET /api/v1/campaigns` (Mocked).
- **State**: Local component state for search/filters. TanStack Query for lists.
- **Testing Checklist**:
  - [x] Lists render correctly with badges.
  - [x] Filter chips toggle data correctly.

### Module 4: Operations Center (HIGHEST PRIORITY)
- **Objective**: Build the "Mission Control" for the AI, demonstrating unstructured input, thinking, and simulated execution.
- **Scope**:
  - **Trigger Cards**: 6 premium action cards (Analyze News, Inventory Analysis, etc.).
  - **Input Area**: Text area / simulated file upload.
  - **Live Visualization**: Animated central timeline (Intake -> Insight -> Decision -> Execution).
  - **Terminal Logs**: Auto-scrolling black terminal component for live SSE logs.
  - **Approval Modal**: Bottom sheet or center modal displaying AI's proposed action, projected impact, and Approve/Reject buttons.
  - **Before vs After**: Transition UI showing the state change after approval.
- **Screens/Components**: `OperationsCenterScreen`, `LiveLogs`, `WorkflowTimeline`, `ApprovalModal`, `StateComparisonCard`.
- **APIs Required**: 
  - `POST /api/v1/workflows/trigger`
  - `SSE /api/v1/streaming/workflow/{id}`
  - `POST /api/v1/workflows/{id}/approve`
- **Frontend State**: `aiWorkflowStore` (Zustand) tracking live workflow status.
- **Testing Checklist**:
  - [x] Triggering an action initiates the animated timeline.
  - [x] Mocked SSE events dynamically append to the Terminal Logs component.
  - [x] Timeline steps highlight actively as logs stream in.
  - [x] System pauses, and the Approval Modal cleanly pops up.
  - [x] Approving animates the final execution and displays the "Before vs After" cards.

### Module 5: Sales Generator (Demo Utility)
- **Objective**: Allow users to quickly generate sales to trigger inventory changes.
- **Scope**: Simple form to select a product, region, and quantity. Simulates a point-of-sale transaction to show state mutations.
- **Screens**: `SalesScreen`.
- **APIs Required**: `POST /api/v1/sales`.
- **Testing Checklist**:
  - [x] Submitting a sale shows a success toast.
  - [x] Navigating back to Dashboard/Products reflects the reduced inventory (cache invalidated).

### Module 6: Reports & CRM (Secondary Priority)
- **Objective**: Implement basic data tabular views for operational reporting.
- **Scope**: Simple list views for reports and customer risk status.
- **Screens**: `ReportsScreen`, `CRMScreen`.
- **Testing Checklist**:
  - [ ] Screens load mocked data correctly.

---

## 7. Reusable Components List
- `PremiumCard`: Card with `#F8FAFC` bg, soft shadow, `#E2E8F0` border.
- `AIBadge`: Small chip with sparkling icon, `#2563EB` text, and light blue background.
- `MetricSparkline`: Tiny line chart for dashboard cards.
- `AnimatedTimelineStep`: A dot and line connector that pulses when active and turns green (`#16A34A`) when completed.
- `TerminalLogView`: FlatList with inverted scrolling, black background, monospace green text.
- `ComparisonMetric`: A UI block showing `<Old Value> ➔ <New Value> (<+X%>)` with color coding.
- `ActionBottomSheet`: Standardized bottom sheet for approvals and detail views.

---

## 8. State Flow: The "AI Execution" Sequence
1. **User Input**: User taps "Analyze Inventory" in Operations Center.
2. **TanStack Query Mutation**: Fires `POST /workflows/trigger`. Returns `workflow_id`.
3. **Zustand Update**: `aiWorkflowStore.setWorkflow(workflow_id)`. `isProcessing` set to `true`.
4. **SSE Connection**: Component mounts `useEffect` that listens to SSE.
5. **Animation**: `WorkflowTimeline` component observes Zustand state; step 1 ("Intake") pulses.
6. **Log Streaming**: SSE events push string logs into Zustand. `TerminalLogView` auto-scrolls.
7. **Approval Gate**: SSE emits `STATE:PENDING_APPROVAL`. Zustand sets `isAwaitingApproval=true`.
8. **UI Response**: `OperationsCenter` renders the `ApprovalModal` overlaid on the screen.
9. **User Action**: User taps "Approve". `POST /workflows/approve` is called.
10. **Resolution**: SSE emits final logs. Zustand sets `isProcessing=false`. "Before vs After" component renders. Dashboard queries are invalidated in TanStack Query to show new data.
