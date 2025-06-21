#!/usr/bin/env python3
"""
Add Memories Script
"""

import requests
import json
import time

WEBHOOK_URL = "http://127.0.0.1:7860/api/v1/webhook/41d39d2c-a485-4cc6-851b-a70f75508ae6"

def send_memory(data, description):
    """Send memory data to Langflow webhook"""
    print(f"{description}")
    print(f"URL: {WEBHOOK_URL}")
    print(f"Data: {json.dumps(data, indent=2)}")
    
    try:
        response = requests.post(
            WEBHOOK_URL,
            headers={'Content-Type': 'application/json'},
            json=data,
            timeout=10
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code in [200, 202]:
            print("SUCCESS!")
        else:
            print(f"Unexpected status: {response.status_code}")
            
    except Exception as e:
        print(f"Error: {e}")
    
    print("-" * 60)

def main():
    print("ADDING MEMORIES TO LANGFLOW")
    print("=" * 60)
    print(f"Target webhook: {WEBHOOK_URL}")
    print("=" * 60)
    
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
    
    print(f"Adding {len(memories)} memories...")
    print()
    
    for i, memory in enumerate(memories, 1):
        send_memory(memory, f"Memory {i}/{len(memories)}: {memory['subject']}")
        time.sleep(1)  # Small delay between requests
    
    print(f"COMPLETED! Added {len(memories)} memories to Langflow")
    print("Check your Langflow interface to see the data")
    print("These memories can now be retrieved with similar queries")

if __name__ == "__main__":
    main()
