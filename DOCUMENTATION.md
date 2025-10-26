# GymEZ Application Documentation

## Overview
GymEZ is a React Native mobile application designed for two types of users: **Gym Owners** and **Gym Members**. The app provides role-based interfaces with distinct features for each user type.

## Application Architecture

### Entry Point
- **index.js**: Registers the main App component with React Native's AppRegistry
- **src/App.tsx**: Main application component that manages role selection and navigation

### User Roles and Flow
1. **Role Selection**: Users first choose their role (Gym Owner or Gym Member)
2. **Role-Based Navigation**: Based on selection, users are directed to their respective interfaces

## Code Structure

### Type Definitions (`src/types/index.ts`)
The application uses TypeScript for type safety. Key types include:

- **UserRole**: `'gym_owner' | 'gym_member'`
- **User**: Base user interface with id, name, email, role, and optional profile image
- **GymOwner**: Extended user type with gym-specific information
- **GymMember**: Extended user type with membership information
- **Gym**: Complete gym information including facilities, pricing, and ratings
- **Membership**: Membership details with type, status, and dates
- **Member**: Individual member information

### Navigation Structure

#### Gym Owner Navigation (`src/navigation/GymOwnerNavigator.tsx`)
Bottom tab navigator with three tabs:
- **Dashboard** (📊): Overview of gym statistics and recent activity
- **Members** (👥): List and manage gym members
- **Facilities** (🏋️): Manage gym facilities and equipment

#### Gym Member Navigation (`src/navigation/GymMemberNavigator.tsx`)
Bottom tab navigator with three tabs:
- **Dashboard** (🏠): Personal membership overview and activity
- **Browse** (🔍): Discover and explore gyms
- **Memberships** (💳): View and manage active/past memberships

### Screens

#### Common Screen
**RoleSelectionScreen** (`src/screens/RoleSelectionScreen.tsx`)
- First screen users see
- Two large buttons for role selection
- Color-coded: Blue for Gym Owner, Green for Gym Member
- Includes role descriptions

#### Gym Owner Screens

1. **DashboardScreen** (`src/screens/GymOwner/DashboardScreen.tsx`)
   - Statistics cards showing:
     - Total Members: 156
     - Active Members: 142
     - Monthly Revenue: $8,450
     - Facilities: 8
   - Quick Actions:
     - Add New Member
     - View Reports
     - Manage Facilities
   - Recent Activity feed

2. **MembersScreen** (`src/screens/GymOwner/MembersScreen.tsx`)
   - List of all gym members
   - Each member card shows:
     - Name and email
     - Status badge (Active/Inactive)
     - Member ID
     - Phone number (if available)
     - Join date
   - "Add Member" button in header

3. **FacilitiesScreen** (`src/screens/GymOwner/FacilitiesScreen.tsx`)
   - List of gym facilities
   - Each facility shows:
     - Facility name
     - Equipment count
     - Operational status (Operational/Maintenance)
   - Status indicators with color coding

#### Gym Member Screens

1. **DashboardScreen** (`src/screens/GymMember/DashboardScreen.tsx`)
   - Active membership card showing:
     - Gym name
     - Plan type
     - Validity dates
     - Member ID
   - Quick Actions:
     - Check-In
     - Book Classes
     - View Payments
   - Recent activity with icons

2. **BrowseGymsScreen** (`src/screens/GymMember/BrowseGymsScreen.tsx`)
   - Grid/list of available gyms
   - Each gym card displays:
     - Gym name and rating
     - Address
     - Description
     - Facility tags
     - Pricing (monthly and annual)
     - "View Details" button

3. **MyMembershipsScreen** (`src/screens/GymMember/MyMembershipsScreen.tsx`)
   - Sections for Active and Past memberships
   - Each membership shows:
     - Gym name
     - Status badge
     - Plan type
     - Start and end dates
   - "Manage" button for active memberships

## Features Implemented

### For Gym Owners
✅ Dashboard with key metrics
✅ Member management interface
✅ Facilities management
✅ Activity tracking
✅ Statistics visualization

### For Gym Members
✅ Membership overview
✅ Gym browsing and discovery
✅ Membership history
✅ Activity tracking
✅ Quick action buttons

## Styling
- **Color Scheme**:
  - Gym Owner theme: Blue (#4A90E2)
  - Gym Member theme: Green (#50C878)
  - Background: Light gray (#f5f5f5)
  - Cards: White with subtle shadows
  - Status indicators: Green (active), Red (inactive/expired)

- **Design Patterns**:
  - Cards with rounded corners (borderRadius: 10-15px)
  - Consistent padding and margins
  - Shadow effects for depth (elevation on Android)
  - Icon-based navigation
  - Color-coded status badges

## Technology Stack
- **React Native**: 0.72.0
- **React**: 18.2.0
- **React Navigation**: 6.x
  - Stack Navigator
  - Bottom Tab Navigator
- **TypeScript**: 4.8.4
- **Development Tools**:
  - ESLint for code linting
  - Prettier for code formatting
  - Metro bundler for development
  - Jest for testing

## Sample Data
The app currently uses mock data for demonstration:
- 4 sample gym members
- 8 sample facilities
- 3 sample gyms for browsing
- 3 sample memberships

## Next Steps
This foundation provides a solid starting point for:
1. Implementing backend API integration
2. Adding authentication (Firebase, Auth0, etc.)
3. Real-time data synchronization
4. Payment processing
5. Advanced features (QR check-in, class booking, etc.)
6. Push notifications
7. Analytics integration
8. Testing suite expansion

## Running the Application

### Development
```bash
# Install dependencies
npm install

# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Code Quality
```bash
# Run linter
npm run lint

# Run tests
npm test

# TypeScript type checking
npx tsc --noEmit
```

## File Structure Summary
```
GymEZ/
├── src/
│   ├── App.tsx                           # Main app with role switching
│   ├── types/index.ts                    # TypeScript definitions
│   ├── screens/
│   │   ├── RoleSelectionScreen.tsx       # Initial screen
│   │   ├── GymOwner/                     # Gym owner screens
│   │   │   ├── DashboardScreen.tsx
│   │   │   ├── MembersScreen.tsx
│   │   │   └── FacilitiesScreen.tsx
│   │   └── GymMember/                    # Gym member screens
│   │       ├── DashboardScreen.tsx
│   │       ├── BrowseGymsScreen.tsx
│   │       └── MyMembershipsScreen.tsx
│   └── navigation/
│       ├── GymOwnerNavigator.tsx         # Gym owner tabs
│       └── GymMemberNavigator.tsx        # Gym member tabs
├── Configuration files
│   ├── package.json                      # Dependencies
│   ├── tsconfig.json                     # TypeScript config
│   ├── .eslintrc.js                      # ESLint config
│   ├── .prettierrc.js                    # Prettier config
│   ├── babel.config.js                   # Babel config
│   ├── metro.config.js                   # Metro bundler config
│   └── app.json                          # React Native config
└── Entry point
    └── index.js                          # App registration
```

## Key Design Decisions

1. **Role-Based Architecture**: Clean separation between user types
2. **TypeScript**: Type safety for better development experience
3. **Bottom Tab Navigation**: Easy access to main features
4. **Mock Data**: Realistic sample data for demonstration
5. **Component Isolation**: Each screen is self-contained
6. **Consistent Styling**: Unified design language across the app
7. **Scalable Structure**: Easy to add new features and screens
