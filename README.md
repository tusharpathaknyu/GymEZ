# GymEZ

A gym management system with two types of users: **Gym Owners** and **Gym Members**.

## Overview

GymEZ is designed to support gym management with distinct user roles:

### User Types

1. **Gym Owner**
   - Manages one or more gym facilities
   - Can create and manage gym businesses
   - Tracks gyms under their ownership
   - Additional features to be added in future iterations

2. **Gym Member**
   - Joins gyms and purchases memberships
   - Can have multiple memberships across different gyms
   - Maintains emergency contact information
   - Additional features to be added in future iterations

## Project Structure

```
GymEZ/
├── models/              # Data models
│   ├── __init__.py     # Package initialization
│   └── user.py         # User models (User, GymOwner, GymMember)
├── tests/              # Test suite
│   └── test_user.py    # Tests for user models
├── example.py          # Example usage script
└── README.md           # This file
```

## Usage

### Running the Example

```bash
python example.py
```

This will demonstrate creating gym owners and members, and show how to work with their attributes.

### Running Tests

```bash
python -m unittest tests/test_user.py
```

Or run all tests:

```bash
python -m unittest discover tests
```

## User Models

### Base User Class

All users inherit from the `User` base class with common attributes:
- `user_id`: Unique identifier
- `email`: Email address
- `name`: Full name
- `phone`: Phone number (optional)
- `created_at`: Timestamp of creation
- `user_type`: Type of user (owner/member)

### GymOwner

Specific attributes:
- `gym_ids`: List of gym IDs owned
- `business_name`: Name of the gym business

Methods:
- `add_gym(gym_id)`: Add a gym to ownership
- `remove_gym(gym_id)`: Remove a gym from ownership

### GymMember

Specific attributes:
- `membership_ids`: List of membership IDs
- `emergency_contact`: Emergency contact information

Methods:
- `add_membership(membership_id)`: Add a membership
- `remove_membership(membership_id)`: Remove a membership

## Future Enhancements

This is the initial implementation. Future features will include:
- Authentication and authorization
- Gym facility management
- Membership plans and billing
- Check-in system
- Analytics and reporting
- And more...