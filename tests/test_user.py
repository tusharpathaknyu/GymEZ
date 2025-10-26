"""Tests for user models."""

import unittest
from datetime import datetime
from models.user import User, GymOwner, GymMember


class TestUser(unittest.TestCase):
    """Test cases for the base User class."""
    
    def test_user_creation(self):
        """Test creating a basic user."""
        user = User("user123", "test@example.com", "Test User", "555-1234")
        
        self.assertEqual(user.user_id, "user123")
        self.assertEqual(user.email, "test@example.com")
        self.assertEqual(user.name, "Test User")
        self.assertEqual(user.phone, "555-1234")
        self.assertEqual(user.user_type, "base")
        self.assertIsInstance(user.created_at, datetime)
    
    def test_user_without_phone(self):
        """Test creating a user without phone number."""
        user = User("user456", "test2@example.com", "Test User 2")
        
        self.assertEqual(user.user_id, "user456")
        self.assertIsNone(user.phone)
    
    def test_user_repr(self):
        """Test user string representation."""
        user = User("user789", "test3@example.com", "Test User 3")
        
        repr_str = repr(user)
        self.assertIn("User", repr_str)
        self.assertIn("user789", repr_str)
        self.assertIn("test3@example.com", repr_str)
    
    def test_user_to_dict(self):
        """Test converting user to dictionary."""
        user = User("user101", "test4@example.com", "Test User 4", "555-5678")
        
        user_dict = user.to_dict()
        self.assertEqual(user_dict['user_id'], "user101")
        self.assertEqual(user_dict['email'], "test4@example.com")
        self.assertEqual(user_dict['name'], "Test User 4")
        self.assertEqual(user_dict['phone'], "555-5678")
        self.assertEqual(user_dict['user_type'], "base")
        self.assertIn('created_at', user_dict)


class TestGymOwner(unittest.TestCase):
    """Test cases for the GymOwner class."""
    
    def test_gym_owner_creation(self):
        """Test creating a gym owner."""
        owner = GymOwner("owner123", "owner@gym.com", "Gym Owner", 
                        "555-9999", "Fitness Pro")
        
        self.assertEqual(owner.user_id, "owner123")
        self.assertEqual(owner.email, "owner@gym.com")
        self.assertEqual(owner.name, "Gym Owner")
        self.assertEqual(owner.phone, "555-9999")
        self.assertEqual(owner.business_name, "Fitness Pro")
        self.assertEqual(owner.user_type, "owner")
        self.assertEqual(owner.gym_ids, [])
    
    def test_gym_owner_without_business_name(self):
        """Test creating a gym owner without business name."""
        owner = GymOwner("owner456", "owner2@gym.com", "Gym Owner 2")
        
        self.assertIsNone(owner.business_name)
        self.assertEqual(owner.user_type, "owner")
    
    def test_add_gym(self):
        """Test adding gyms to owner."""
        owner = GymOwner("owner789", "owner3@gym.com", "Gym Owner 3")
        
        owner.add_gym("gym001")
        self.assertIn("gym001", owner.gym_ids)
        self.assertEqual(len(owner.gym_ids), 1)
        
        owner.add_gym("gym002")
        self.assertIn("gym002", owner.gym_ids)
        self.assertEqual(len(owner.gym_ids), 2)
    
    def test_add_duplicate_gym(self):
        """Test that adding duplicate gym doesn't create duplicates."""
        owner = GymOwner("owner101", "owner4@gym.com", "Gym Owner 4")
        
        owner.add_gym("gym001")
        owner.add_gym("gym001")
        
        self.assertEqual(len(owner.gym_ids), 1)
    
    def test_remove_gym(self):
        """Test removing gyms from owner."""
        owner = GymOwner("owner102", "owner5@gym.com", "Gym Owner 5")
        
        owner.add_gym("gym001")
        owner.add_gym("gym002")
        
        result = owner.remove_gym("gym001")
        self.assertTrue(result)
        self.assertNotIn("gym001", owner.gym_ids)
        self.assertEqual(len(owner.gym_ids), 1)
    
    def test_remove_nonexistent_gym(self):
        """Test removing a gym that doesn't exist."""
        owner = GymOwner("owner103", "owner6@gym.com", "Gym Owner 6")
        
        result = owner.remove_gym("gym999")
        self.assertFalse(result)
    
    def test_gym_owner_to_dict(self):
        """Test converting gym owner to dictionary."""
        owner = GymOwner("owner104", "owner7@gym.com", "Gym Owner 7", 
                        "555-1111", "PowerGym")
        owner.add_gym("gym001")
        
        owner_dict = owner.to_dict()
        self.assertEqual(owner_dict['user_id'], "owner104")
        self.assertEqual(owner_dict['user_type'], "owner")
        self.assertEqual(owner_dict['business_name'], "PowerGym")
        self.assertEqual(owner_dict['gym_ids'], ["gym001"])


class TestGymMember(unittest.TestCase):
    """Test cases for the GymMember class."""
    
    def test_gym_member_creation(self):
        """Test creating a gym member."""
        member = GymMember("member123", "member@email.com", "Gym Member", 
                          "555-2222", "555-3333")
        
        self.assertEqual(member.user_id, "member123")
        self.assertEqual(member.email, "member@email.com")
        self.assertEqual(member.name, "Gym Member")
        self.assertEqual(member.phone, "555-2222")
        self.assertEqual(member.emergency_contact, "555-3333")
        self.assertEqual(member.user_type, "member")
        self.assertEqual(member.membership_ids, [])
    
    def test_gym_member_without_emergency_contact(self):
        """Test creating a gym member without emergency contact."""
        member = GymMember("member456", "member2@email.com", "Gym Member 2")
        
        self.assertIsNone(member.emergency_contact)
        self.assertEqual(member.user_type, "member")
    
    def test_add_membership(self):
        """Test adding memberships to member."""
        member = GymMember("member789", "member3@email.com", "Gym Member 3")
        
        member.add_membership("membership001")
        self.assertIn("membership001", member.membership_ids)
        self.assertEqual(len(member.membership_ids), 1)
        
        member.add_membership("membership002")
        self.assertIn("membership002", member.membership_ids)
        self.assertEqual(len(member.membership_ids), 2)
    
    def test_add_duplicate_membership(self):
        """Test that adding duplicate membership doesn't create duplicates."""
        member = GymMember("member101", "member4@email.com", "Gym Member 4")
        
        member.add_membership("membership001")
        member.add_membership("membership001")
        
        self.assertEqual(len(member.membership_ids), 1)
    
    def test_remove_membership(self):
        """Test removing memberships from member."""
        member = GymMember("member102", "member5@email.com", "Gym Member 5")
        
        member.add_membership("membership001")
        member.add_membership("membership002")
        
        result = member.remove_membership("membership001")
        self.assertTrue(result)
        self.assertNotIn("membership001", member.membership_ids)
        self.assertEqual(len(member.membership_ids), 1)
    
    def test_remove_nonexistent_membership(self):
        """Test removing a membership that doesn't exist."""
        member = GymMember("member103", "member6@email.com", "Gym Member 6")
        
        result = member.remove_membership("membership999")
        self.assertFalse(result)
    
    def test_gym_member_to_dict(self):
        """Test converting gym member to dictionary."""
        member = GymMember("member104", "member7@email.com", "Gym Member 7", 
                          "555-4444", "555-5555")
        member.add_membership("membership001")
        
        member_dict = member.to_dict()
        self.assertEqual(member_dict['user_id'], "member104")
        self.assertEqual(member_dict['user_type'], "member")
        self.assertEqual(member_dict['emergency_contact'], "555-5555")
        self.assertEqual(member_dict['membership_ids'], ["membership001"])


if __name__ == '__main__':
    unittest.main()
