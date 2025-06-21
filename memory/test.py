#!/usr/bin/env python3
"""
Test retrieval and display actual retrieved data in a nice format
"""

import requests
import json
from typing import Dict, List, Any

# Update this with your actual retrieval webhook URL
RETRIEVAL_WEBHOOK_URL = "http://127.0.0.1:7860/api/v1/webhook/fbe7f7de-63f9-4e8d-9962-42d6cf6c1387"

def parse_retrieval_response(response_text: str) -> Dict[str, Any]:
    """Parse the response and extract meaningful data"""
    try:
        # Try to parse as JSON first
        data = json.loads(response_text)
        return {"success": True, "data": data, "type": "json"}
    except json.JSONDecodeError:
        # If not JSON, return as text
        return {"success": True, "data": response_text, "type": "text"}

def display_retrieved_memories(memories: List[Dict], query: Dict):
    """Display retrieved memories in a nice format"""
    print(f"\n🎯 QUERY: {query['subject']} - {query['body']}")
    print(f"👤 FROM: {query['name']} ({query['email']})")
    print("=" * 80)
    
    if not memories:
        print("❌ No similar memories found")
        return
    
    print(f"✅ Found {len(memories)} similar memories:")
    print()
    
    for i, memory in enumerate(memories, 1):
        print(f"📋 MEMORY {i}")
        print("-" * 40)
        
        # Handle different possible data structures
        if isinstance(memory, dict):
            # Extract key fields
            name = memory.get('name', 'Unknown')
            email = memory.get('email', 'Unknown')
            subject = memory.get('subject', 'No subject')
            body = memory.get('body', 'No content')
            similarity = memory.get('similarity_score', memory.get('score', 'Unknown'))
            
            print(f"👤 Name: {name}")
            print(f"📧 Email: {email}")
            print(f"📌 Subject: {subject}")
            print(f"📄 Content: {body}")
            if similarity != 'Unknown':
                print(f"🎯 Similarity: {similarity}")
            
            # Show any additional fields
            extra_fields = {k: v for k, v in memory.items() 
                          if k not in ['name', 'email', 'subject', 'body', 'similarity_score', 'score', '_id']}
            if extra_fields:
                print(f"🔍 Extra data: {extra_fields}")
        else:
            print(f"📄 Content: {memory}")
        
        print()

def test_memory_retrieval(query_data: Dict) -> Dict[str, Any]:
    """Test memory retrieval and return parsed results"""
    print(f"🔍 Testing query: {query_data['subject']}")
    
    try:
        response = requests.post(
            RETRIEVAL_WEBHOOK_URL,
            headers={'Content-Type': 'application/json'},
            json=query_data,
            timeout=30
        )
        
        print(f"📡 HTTP Status: {response.status_code}")
        
        if response.status_code not in [200, 202]:
            print(f"❌ Request failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return {"success": False, "error": f"HTTP {response.status_code}"}
        
        # Parse the response
        parsed = parse_retrieval_response(response.text)
        
        if parsed["type"] == "json":
            print("✅ Got structured JSON response")
            
            # Try to extract memories from different possible structures
            data = parsed["data"]
            memories = []
            
            if isinstance(data, list):
                memories = data
            elif isinstance(data, dict):
                # Try common keys where memories might be stored
                for key in ['data', 'results', 'memories', 'documents', 'matches']:
                    if key in data and isinstance(data[key], list):
                        memories = data[key]
                        break
                else:
                    # If no list found, treat the whole thing as one memory
                    memories = [data]
            
            return {"success": True, "memories": memories, "raw_data": data}
            
        else:
            print("✅ Got text response")
            return {"success": True, "text": parsed["data"], "raw_data": parsed["data"]}
            
    except requests.exceptions.Timeout:
        print("⏰ Request timed out")
        return {"success": False, "error": "Timeout"}
    except requests.exceptions.ConnectionError:
        print("🔌 Connection error - is Langflow running?")
        return {"success": False, "error": "Connection error"}
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return {"success": False, "error": str(e)}

def main():
    print("🚀 MEMORY RETRIEVAL WITH REAL DATA DISPLAY")
    print("=" * 70)
    
    # Check URL configuration
    if "YOUR_RETRIEVAL_WEBHOOK_ID" in RETRIEVAL_WEBHOOK_URL:
        print("⚠️  Please update RETRIEVAL_WEBHOOK_URL with your actual webhook ID")
        print("   1. Go to your Langflow retrieval pipeline")
        print("   2. Copy the webhook URL")
        print("   3. Update the RETRIEVAL_WEBHOOK_URL variable above")
        return
    
    # Test queries that should match your stored memories
    test_queries = [
        {
            "name": "Heart Patient",
            "email": "heart@test.com",
            "subject": "Cardiologist Needed",
            "body": "I need to book a cardiologist appointment for chest pain urgently"
        },
        {
            "name": "Pizza Lover",
            "email": "pizza@test.com", 
            "subject": "Pizza Order",
            "body": "Want to order vegetarian pizza for family dinner tonight"
        },
        {
            "name": "Dental Patient",
            "email": "dental@test.com",
            "subject": "Dental Cleaning",
            "body": "Need to schedule routine dental cleaning appointment"
        }
    ]
    
    successful_retrievals = 0
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n🧪 TEST {i}/{len(test_queries)}")
        print("=" * 60)
        
        result = test_memory_retrieval(query)
        
        if result["success"]:
            successful_retrievals += 1
            
            if "memories" in result:
                display_retrieved_memories(result["memories"], query)
                
                # Show raw data for debugging
                print("🔧 RAW DATA (for debugging):")
                print(json.dumps(result["raw_data"], indent=2))
                
            elif "text" in result:
                print(f"📄 Text response: {result['text']}")
        else:
            print(f"❌ Failed: {result.get('error', 'Unknown error')}")
        
        # Wait between requests
        if i < len(test_queries):
            import time
            time.sleep(2)
    
    print(f"\n🎉 SUMMARY: {successful_retrievals}/{len(test_queries)} successful retrievals")
    
    if successful_retrievals == 0:
        print("\n🛠️  TROUBLESHOOTING:")
        print("1. Fix the keyspace error first (see find_keyspace.py)")
        print("2. Make sure your retrieval pipeline outputs raw data")
        print("3. Check that you have data in your vector database")
        print("4. Verify the webhook URL is correct")

if __name__ == "__main__":
    main()
