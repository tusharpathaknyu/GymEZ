# GymEZ

A React Native application for gym owners and gym members to manage gym operations and memberships.

## Features

### For Gym Owners
- **Dashboard**: View statistics including total members, active members, monthly revenue, and facilities
- **Member Management**: View and manage gym members with their details and membership status
- **Facilities Management**: Manage gym facilities and equipment with operational status

### For Gym Members
- **Dashboard**: View active membership details and recent activity
- **Browse Gyms**: Discover and explore gyms with facilities, pricing, and ratings
- **My Memberships**: Manage active and past memberships

## Project Structure

```
GymEZ/
├── src/
│   ├── App.tsx                    # Main app component with role-based navigation
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   ├── screens/
│   │   ├── RoleSelectionScreen.tsx    # Initial role selection screen
│   │   ├── GymOwner/
│   │   │   ├── DashboardScreen.tsx    # Gym owner dashboard
│   │   │   ├── MembersScreen.tsx      # Member management
│   │   │   └── FacilitiesScreen.tsx   # Facilities management
│   │   └── GymMember/
│   │       ├── DashboardScreen.tsx    # Gym member dashboard
│   │       ├── BrowseGymsScreen.tsx   # Browse gyms
│   │       └── MyMembershipsScreen.tsx # Membership management
│   └── navigation/
│       ├── GymOwnerNavigator.tsx  # Bottom tab navigation for gym owners
│       └── GymMemberNavigator.tsx # Bottom tab navigation for gym members
├── index.js                       # App entry point
├── app.json                       # React Native configuration
├── package.json                   # Dependencies
└── tsconfig.json                  # TypeScript configuration
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/tusharpathaknyu/GymEZ.git
cd GymEZ
```

2. Install dependencies:
```bash
npm install
```

3. Install iOS dependencies (macOS only):
```bash
cd ios && pod install && cd ..
```

## Running the App

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

### Start Metro Bundler
```bash
npm start
```

## User Types

### Gym Owner
- Manage gym operations
- Track member statistics
- Manage facilities and equipment
- View revenue and analytics

### Gym Member
- Browse and discover gyms
- Manage memberships
- View membership details
- Track gym visits

## Technologies Used

- **React Native**: Mobile app framework
- **React Navigation**: Navigation library with stack and bottom tab navigators
- **TypeScript**: Type-safe development
- **React Native Gesture Handler**: Gesture handling
- **React Native Safe Area Context**: Safe area management

## Development

The app is structured with role-based access:
1. Users select their role (Gym Owner or Gym Member) on app launch
2. Based on the role, they are directed to role-specific interfaces
3. Each user type has dedicated screens and navigation

## Future Enhancements

- Authentication and user management
- Real-time data synchronization
- Payment processing
- Class booking system
- Push notifications
- Analytics and reporting
- Social features
- Workout tracking
- QR code check-in system

## License

ISC
