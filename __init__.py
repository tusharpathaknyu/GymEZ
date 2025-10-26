"""GymEZ - Gym Management System.

A system supporting two types of users:
- Gym Owners: Manage gym facilities and businesses
- Gym Members: Join gyms and manage memberships
"""

__version__ = "0.1.0"
__author__ = "GymEZ Team"

from models import User, GymOwner, GymMember

__all__ = ['User', 'GymOwner', 'GymMember']
