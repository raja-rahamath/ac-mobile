# AgentCare Mobile

React Native mobile applications for AgentCare platform.

## Structure

```
├── apps/
│   ├── customer/    # Customer mobile app
│   └── employee/    # Employee/Technician mobile app
└── packages/
    ├── ui/          # Shared mobile UI components
    └── shared/      # Shared utilities and hooks
```

## Tech Stack

- **Framework:** React Native with Expo
- **Router:** Expo Router
- **Language:** TypeScript
- **State:** Zustand
- **API:** React Query + Axios

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Install dependencies
yarn install

# Start Customer app
yarn dev:customer

# Start Employee app
yarn dev:employee
```

## Features

### Customer App
- **Home Dashboard** - Quick access to services, active requests, and AI chat
- **Service Requests** - Submit new requests with category selection, priority, photos
- **Request Tracking** - Real-time status updates and technician location tracking
- **AI Chat Support** - 24/7 AI assistant (Fatima) for instant help
- **Profile Management** - Personal info, properties, payment methods, notifications

### Employee/Technician App
- **Dashboard** - Today's stats, earnings, online/offline status toggle
- **Job Management** - View, accept, decline jobs with priority indicators
- **Schedule View** - Calendar-based job scheduling with timeline view
- **Navigation** - Turn-by-turn navigation to job sites, ETA sharing
- **Job Workflow** - Status progression (Accepted → En Route → Arrived → In Progress → Completed)
- **Customer Info** - Call, message, view address and service history
- **Profile** - Specialties, ratings, working hours, location sharing settings

## Screens

### Customer App (`apps/customer`)
```
├── (tabs)/
│   ├── index.tsx      # Home Dashboard
│   ├── requests.tsx   # Service Requests List
│   ├── chat.tsx       # AI Support Chat
│   └── profile.tsx    # User Profile
├── request/
│   ├── new.tsx        # New Request Form
│   └── [id].tsx       # Request Details
└── track/
    └── [id].tsx       # Technician Tracking
```

### Employee App (`apps/employee`)
```
├── (tabs)/
│   ├── index.tsx      # Dashboard
│   ├── jobs.tsx       # Job List
│   ├── schedule.tsx   # Schedule Calendar
│   └── profile.tsx    # Technician Profile
├── job/
│   └── [id].tsx       # Job Details
└── navigate/
    └── [id].tsx       # Navigation View
```

## Related Repositories

- [agentcare-api](../agentcare-api) - Backend API
- [agentcare-web](../agentcare-web) - Web applications
- [agentcare-ai](../agentcare-ai) - AI Service
- [agentcare-docs](../agentcare-docs) - Documentation

## License

Proprietary - All rights reserved.
