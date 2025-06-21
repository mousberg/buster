#!/usr/bin/env python3
"""
Test script to add dummy memories to the vector database via webhook
"""

import requests
import json
import time

# Your webhook URL for the ingestion pipeline
WEBHOOK_URL = "http://127.0.0.1:7860/api/v1/webhook/a952c6cc-e887-4e2a-a389-386d54e65858"

memories = [
    {
        "name": "Rohan",
        "email": "rohan1198@gmail.com",
        "subject": "Urgent Cardiologist Appointment",
        "body": "I need to book an urgent cardiologist appointment due to severe chest pain. I have Blue Cross insurance and prefer morning appointments. Please help me find someone available this week."
    },
    {
        "name": "Sarah Johnson", 
        "email": "sarah.j@email.com",
        "subject": "Family Pizza Order",
        "body": "Want to order dinner for the family tonight. Need a large vegetarian pizza from Mario's Pizza, plus garlic bread and caesar salad. Delivery to 123 Main St."
    },
    {
        "name": "Michael Wilson",
        "email": "mike.w@email.com", 
        "subject": "Dental Cleaning Appointment",
        "body": "Need to schedule my routine dental cleaning. It's been about 6 months since my last visit. I have Delta Dental insurance and prefer afternoon appointments."
    },
    {
        "name": "Emma Davis",
        "email": "emma.d@company.com",
        "subject": "Business Trip to NYC", 
        "body": "Need to book a business trip to New York from August 1-5. Require flight and hotel near downtown Manhattan. Corporate budget, prefer flexible cancellation."
    },
    {
        "name": "Alex Chen",
        "email": "alex.c@startup.com",
        "subject": "Healthy Lunch Delivery",
        "body": "Want healthy lunch delivered to office. I'm vegan and gluten-free. Looking for something like quinoa bowl with vegetables. Delivery to 456 Tech Street."
    },
    {
        "name": "Jennifer Martinez",
        "email": "jen.m@email.com",
        "subject": "Pediatrician Appointment",
        "body": "Need to book pediatrician appointment for my 5-year-old. She has a cough and fever. Urgent appointment needed, have Kaiser insurance."
    },
    {
        "name": "David Thompson", 
        "email": "david.t@email.com",
        "subject": "Grocery Delivery Order",
        "body": "Need groceries delivered for the week. Family of 4, include organic vegetables, milk, bread, chicken, and pasta. Delivery to 789 Oak Avenue."
    },
    {
        "name": "Lisa Wang",
        "email": "lisa.w@email.com",
        "subject": "Car Rental for Weekend",
        "body": "Need to rent a mid-size car for weekend trip. Pickup Friday evening, return Sunday night. Prefer Hertz or Enterprise, need good gas mileage."
    }
]

def add_memory(memory_data):
    """Add a single memory to the database"""
    print(f"Adding memory: {memory_data['subject']}")
    print(f"Data: {json.dumps(memory_data, indent=2)}")
    
    try:
        response = requests.post(
            WEBHOOK_URL,
            headers={'Content-Type': 'application/json'},
            json=memory_data,
            timeout=30
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code in [200, 202]:
            print("✅ SUCCESS!\n")
            return True
        else:
            print(f"❌ FAILED with status {response.status_code}\n")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ ERROR: {e}\n")
        return False

def main():
    print("🚀 ADDING MEMORIES TO VECTOR DATABASE")
    print("=" * 50)
    
    success_count = 0
    total_count = len(memories)
    
    for i, memory in enumerate(memories, 1):
        print(f"\n📝 Memory {i}/{total_count}")
        print("-" * 30)
        
        if add_memory(memory):
            success_count += 1
        
        # Add a small delay between requests to avoid overwhelming the server
        if i < total_count:
            print("⏳ Waiting 2 seconds...")
            time.sleep(2)
    
    print("\n" + "=" * 50)
    print(f"🎉 COMPLETED! {success_count}/{total_count} memories added successfully")
    
    if success_count < total_count:
        print(f"⚠️  {total_count - success_count} memories failed to add")

if __name__ == "__main__":
    main()
