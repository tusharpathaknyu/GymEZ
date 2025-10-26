"""User models for GymEZ application.

This module defines the base User class and two specialized user types:
- GymOwner: Represents gym owners who manage gyms
- GymMember: Represents gym members who attend gyms
"""

from datetime import datetime
from typing import Optional


class User:
    """Base user class for the GymEZ application.
    
    Attributes:
        user_id (str): Unique identifier for the user
        email (str): User's email address
        name (str): User's full name
        phone (Optional[str]): User's phone number
        created_at (datetime): Timestamp when user was created
        user_type (str): Type of user ('owner' or 'member')
    """
    
    def __init__(self, user_id: str, email: str, name: str, 
                 phone: Optional[str] = None):
        """Initialize a User instance.
        
        Args:
            user_id: Unique identifier for the user
            email: User's email address
            name: User's full name
            phone: User's phone number (optional)
        """
        self.user_id = user_id
        self.email = email
        self.name = name
        self.phone = phone
        self.created_at = datetime.now()
        self.user_type = "base"
    
    def __repr__(self) -> str:
        """Return string representation of the user."""
        return f"{self.__class__.__name__}(id={self.user_id}, email={self.email}, name={self.name})"
    
    def to_dict(self) -> dict:
        """Convert user to dictionary representation.
        
        Returns:
            Dictionary containing user data
        """
        return {
            'user_id': self.user_id,
            'email': self.email,
            'name': self.name,
            'phone': self.phone,
            'created_at': self.created_at.isoformat(),
            'user_type': self.user_type
        }


class GymOwner(User):
    """Gym owner user type.
    
    Represents users who own and manage gyms. Gym owners can:
    - Create and manage gym facilities
    - Manage gym memberships
    - View analytics and reports
    
    Attributes:
        gym_ids (list): List of gym IDs owned by this owner
        business_name (Optional[str]): Name of the gym business
    """
    
    def __init__(self, user_id: str, email: str, name: str, 
                 phone: Optional[str] = None, business_name: Optional[str] = None):
        """Initialize a GymOwner instance.
        
        Args:
            user_id: Unique identifier for the user
            email: User's email address
            name: User's full name
            phone: User's phone number (optional)
            business_name: Name of the gym business (optional)
        """
        super().__init__(user_id, email, name, phone)
        self.user_type = "owner"
        self.gym_ids = []
        self.business_name = business_name
    
    def add_gym(self, gym_id: str) -> None:
        """Add a gym to the owner's list of gyms.
        
        Args:
            gym_id: Unique identifier of the gym to add
        """
        if gym_id not in self.gym_ids:
            self.gym_ids.append(gym_id)
    
    def remove_gym(self, gym_id: str) -> bool:
        """Remove a gym from the owner's list of gyms.
        
        Args:
            gym_id: Unique identifier of the gym to remove
            
        Returns:
            True if gym was removed, False if gym was not found
        """
        if gym_id in self.gym_ids:
            self.gym_ids.remove(gym_id)
            return True
        return False
    
    def to_dict(self) -> dict:
        """Convert gym owner to dictionary representation.
        
        Returns:
            Dictionary containing gym owner data
        """
        data = super().to_dict()
        data.update({
            'gym_ids': self.gym_ids,
            'business_name': self.business_name
        })
        return data


class GymMember(User):
    """Gym member user type.
    
    Represents users who are members of gyms. Gym members can:
    - Join gyms and purchase memberships
    - Check in to gym sessions
    - View their membership status and history
    
    Attributes:
        membership_ids (list): List of membership IDs for this member
        emergency_contact (Optional[str]): Emergency contact information
    """
    
    def __init__(self, user_id: str, email: str, name: str, 
                 phone: Optional[str] = None, emergency_contact: Optional[str] = None):
        """Initialize a GymMember instance.
        
        Args:
            user_id: Unique identifier for the user
            email: User's email address
            name: User's full name
            phone: User's phone number (optional)
            emergency_contact: Emergency contact information (optional)
        """
        super().__init__(user_id, email, name, phone)
        self.user_type = "member"
        self.membership_ids = []
        self.emergency_contact = emergency_contact
    
    def add_membership(self, membership_id: str) -> None:
        """Add a membership to the member's list.
        
        Args:
            membership_id: Unique identifier of the membership to add
        """
        if membership_id not in self.membership_ids:
            self.membership_ids.append(membership_id)
    
    def remove_membership(self, membership_id: str) -> bool:
        """Remove a membership from the member's list.
        
        Args:
            membership_id: Unique identifier of the membership to remove
            
        Returns:
            True if membership was removed, False if membership was not found
        """
        if membership_id in self.membership_ids:
            self.membership_ids.remove(membership_id)
            return True
        return False
    
    def to_dict(self) -> dict:
        """Convert gym member to dictionary representation.
        
        Returns:
            Dictionary containing gym member data
        """
        data = super().to_dict()
        data.update({
            'membership_ids': self.membership_ids,
            'emergency_contact': self.emergency_contact
        })
        return data
