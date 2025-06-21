#!/usr/bin/env python3
"""
Test webhook
"""

import requests
import json

WEBHOOK_URL = "http://127.0.0.1:7860/api/v1/webhook/41d39d2c-a485-4cc6-851b-a70f75508ae6"

def send_exact_curl_data():
    data = {
        "name": "Rohan",
        "email": "rohan1198@gail.com", 
        "subject": "Hello World!",
        "body": "Yaay!!"
    }
    
    print("Sending EXACT curl data...")
    print(f"URL: {WEBHOOK_URL}")
    print(f"Data: {json.dumps(data, indent=2)}")
    print()
    
    response = requests.post(
        WEBHOOK_URL,
        headers={'Content-Type': 'application/json'},
        json=data
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 202:
        print("SUCCESS! (202 = Accepted for background processing)")
    elif response.status_code == 200:
        print("SUCCESS! (200 = OK)")
    else:
        print(f"Unexpected status: {response.status_code}")


def main():
    print("EXACT CURL COMMAND REPLICATION")
    print("=" * 50)
    print()
    print("curl -X POST \\")
    print(f'  "{WEBHOOK_URL}" \\')
    print("  -H 'Content-Type: application/json' \\")
    print("  -d '{\"name\": \"Rohan\", \"email\": \"rohan1198@gail.com\", \"subject\": \"Hello World!\", \"body\": \"Yaay!!\"}'")
    print()
    print("=" * 50)
    
    send_exact_curl_data()
    
    print("\nDONE!")

if __name__ == "__main__":
    main()
