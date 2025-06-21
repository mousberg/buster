#!/usr/bin/env python3
"""
Memory Retrieval
"""

import subprocess
import json

WEBHOOK_URL = "http://127.0.0.1:7860/api/v1/webhook/41d39d2c-a485-4cc6-851b-a70f75508ae6"

def search_memory(data, description):
    """Send a simple curl command to search memories"""
    
    curl_command = [
        'curl', '-X', 'POST',
        WEBHOOK_URL,
        '-H', 'Content-Type: application/json',
        '-d', json.dumps(data)
    ]
    
    print(f"{description}")
    print(f"Command: curl -X POST \"{WEBHOOK_URL}\" -H 'Content-Type: application/json' -d '{json.dumps(data)}'")
    
    try:
        result = subprocess.run(curl_command, capture_output=True, text=True, timeout=10)
        print(f"Response: {result.stdout}")
        if result.stderr:
            print(f"Error: {result.stderr}")
    except Exception as e:
        print(f"Failed: {e}")
    
    print("-" * 50)

queries = [
    {
        "name": "Rohan",
        "email": "rohan1198@gmail.com",
        "subject": "Need Doctor",
        "body": "I need to book a heart doctor appointment urgently"
    },
    {
        "name": "Sarah", 
        "email": "sarah.j@email.com",
        "subject": "Food Order",
        "body": "Want to order pizza for dinner tonight"
    },
    {
        "name": "TestUser",
        "email": "test@example.com",
        "subject": "Medical Appointment", 
        "body": "Need to find a dentist for cleaning"
    },
    {
        "name": "BusinessUser",
        "email": "business@company.com",
        "subject": "Travel",
        "body": "Book flight to New York for business meeting"
    },
    {
        "name": "HealthyEater",
        "email": "healthy@startup.com",
        "subject": "Lunch Order",
        "body": "Order vegan gluten-free healthy lunch"
    }
]

def main():
    print("Memory Retrieval Test")
    print("=" * 50)
    
    for i, query in enumerate(queries, 1):
        search_memory(query, f"Query {i}/5: {query['subject']}")
    
    print("Done! Check your Langflow interface to see the retrieval results.")

if __name__ == "__main__":
    main()
