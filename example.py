"""Example usage of the GymEZ user models.

This script demonstrates how to create and use gym owners and gym members.
"""

from models.user import GymOwner, GymMember


def main():
    """Demonstrate the GymEZ user types."""
    
    print("=" * 60)
    print("GymEZ - Gym Management System")
    print("=" * 60)
    print()
    
    # Create a gym owner
    print("Creating a Gym Owner...")
    owner = GymOwner(
        user_id="owner001",
        email="john@fitnesspro.com",
        name="John Smith",
        phone="555-0101",
        business_name="Fitness Pro Gyms"
    )
    print(f"Created: {owner}")
    print(f"User Type: {owner.user_type}")
    print(f"Business Name: {owner.business_name}")
    print()
    
    # Add gyms to the owner
    print("Adding gyms to the owner...")
    owner.add_gym("gym_downtown_001")
    owner.add_gym("gym_uptown_002")
    print(f"Gyms owned: {owner.gym_ids}")
    print()
    
    # Create a gym member
    print("Creating a Gym Member...")
    member = GymMember(
        user_id="member001",
        email="jane@email.com",
        name="Jane Doe",
        phone="555-0202",
        emergency_contact="555-0303"
    )
    print(f"Created: {member}")
    print(f"User Type: {member.user_type}")
    print(f"Emergency Contact: {member.emergency_contact}")
    print()
    
    # Add memberships to the member
    print("Adding memberships to the member...")
    member.add_membership("membership_premium_001")
    member.add_membership("membership_basic_002")
    print(f"Memberships: {member.membership_ids}")
    print()
    
    # Convert to dictionary
    print("Converting users to dictionary format...")
    print()
    print("Owner Data:")
    owner_data = owner.to_dict()
    for key, value in owner_data.items():
        print(f"  {key}: {value}")
    print()
    
    print("Member Data:")
    member_data = member.to_dict()
    for key, value in member_data.items():
        print(f"  {key}: {value}")
    print()
    
    print("=" * 60)
    print("Example completed successfully!")
    print("=" * 60)


if __name__ == "__main__":
    main()
