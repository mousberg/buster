#!/usr/bin/env python3
"""
Fixed Langflow Memory Retrieval using /run API
Addresses response parsing and embedding issues
"""

import requests
import json
import time
from typing import Dict, List, Any, Optional

# Configuration
FLOW_ID = "fbe7f7de-63f9-4e8d-9962-42d6cf6c1387"  # Your flow ID
BASE_URL = "http://127.0.0.1:7860"
RUN_URL = f"{BASE_URL}/api/v1/run/{FLOW_ID}?stream=false"

# Test queries for memory retrieval
test_queries = [
    "Need heart doctor appointment urgently",
    "Want to order pizza for dinner",
    "Need to find a dentist", 
    "Book flight to New York",
    "Order healthy vegan lunch"
]

def extract_search_results(response_data: Any) -> List[Dict]:
    """
    Extract search results from Langflow /run API response
    Handles multiple response formats from Chat Output components
    """
    results = []
    
    try:
        if isinstance(response_data, dict):
            # Format 1: Direct outputs array
            if 'outputs' in response_data:
                for output in response_data['outputs']:
                    if isinstance(output, dict) and 'results' in output:
                        result_data = output['results']
                        
                        # Handle Message object format
                        if isinstance(result_data, dict):
                            if 'message' in result_data:
                                message = result_data['message']
                                if isinstance(message, dict) and 'text' in message:
                                    # Parse the text content
                                    text_content = message['text']
                                    results.append({
                                        'text': text_content,
                                        'type': 'chat_output',
                                        'metadata': message.get('data', {})
                                    })
                                elif isinstance(message, str):
                                    results.append({
                                        'text': message,
                                        'type': 'chat_output_string'
                                    })
                            
                            # Handle direct search results
                            elif 'search_results' in result_data:
                                search_data = result_data['search_results']
                                if isinstance(search_data, list):
                                    for item in search_data:
                                        results.append({
                                            'text': item.get('page_content', str(item)),
                                            'metadata': item.get('metadata', {}),
                                            'type': 'search_result'
                                        })
                        
                        # Handle list format
                        elif isinstance(result_data, list):
                            for item in result_data:
                                if isinstance(item, dict):
                                    results.append({
                                        'text': item.get('page_content', str(item)),
                                        'metadata': item.get('metadata', {}),
                                        'type': 'search_result'
                                    })
            
            # Format 2: Direct result field (legacy)
            elif 'result' in response_data:
                result = response_data['result']
                if isinstance(result, str):
                    results.append({
                        'text': result,
                        'type': 'direct_result'
                    })
                elif isinstance(result, dict) and 'message' in result:
                    message = result['message']
                    results.append({
                        'text': message.get('text', str(message)),
                        'type': 'result_message'
                    })
    
    except Exception as e:
        print(f"⚠️ Error parsing response: {e}")
        print(f"📄 Raw response structure: {type(response_data)}")
        if isinstance(response_data, dict):
            print(f"📄 Available keys: {list(response_data.keys())}")
    
    return results

def format_search_result(result: Dict) -> str:
    """Format a search result for display"""
    text = result.get('text', '')
    metadata = result.get('metadata', {})
    result_type = result.get('type', 'unknown')
    
    # Parse memory-like text content
    if any(keyword in text.lower() for keyword in ['name:', 'email:', 'subject:', 'body:']):
        return f"🧠 Memory: {text}"
    
    # Parse metadata if available
    if metadata:
        if 'name' in metadata or 'email' in metadata:
            name = metadata.get('name', 'Unknown')
            email = metadata.get('email', 'No email')
            subject = metadata.get('subject', 'No subject')
            body = metadata.get('body', 'No content')
            return f"📧 From: {name} ({email})\n   Subject: {subject}\n   Content: {body}"
    
    return f"📄 [{result_type}] {text}"

def search_memories(query: str) -> Optional[List[Dict]]:
    """
    Search for memories using the Langflow /run API
    """
    print(f"🔍 Searching for: '{query}'")
    
    # Format payload for Langflow Chat Input
    payload = {
        "input_value": query,
        "output_type": "chat",
        "input_type": "chat",
        "tweaks": {
            # Add any component-specific tweaks here if needed
        }
    }
    
    try:
        response = requests.post(
            RUN_URL,
            headers={
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            json=payload,
            timeout=30
        )
        
        print(f"📡 HTTP Status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                result_data = response.json()
                print("✅ Response received successfully")
                
                # Debug: Show response structure  
                print(f"🔍 Response type: {type(result_data)}")
                if isinstance(result_data, dict):
                    print(f"🔍 Available keys: {list(result_data.keys())}")
                
                # Extract and display results
                search_results = extract_search_results(result_data)
                
                if search_results:
                    print(f"📋 Found {len(search_results)} results:")
                    print("=" * 50)
                    
                    for i, result in enumerate(search_results, 1):
                        print(f"Result {i}:")
                        formatted = format_search_result(result)
                        print(formatted)
                        print("-" * 30)
                    
                    return search_results
                else:
                    print("📭 No results found")
                    print("🔍 Debug - Response preview:")
                    print(json.dumps(result_data, indent=2)[:500] + "...")
                    return []
                    
            except json.JSONDecodeError as e:
                print(f"❌ JSON parsing error: {e}")
                print(f"📄 Raw response preview: {response.text[:200]}...")
                return None
        
        elif response.status_code == 422:
            print("❌ Validation error - check flow configuration")
            try:
                error_details = response.json()
                print(f"🔍 Error details: {json.dumps(error_details, indent=2)}")
            except:
                print(f"📄 Error text: {response.text}")
            return None
        
        else:
            print(f"❌ Request failed with status {response.status_code}")
            print(f"📄 Response: {response.text}")
            return None
            
    except requests.exceptions.Timeout:
        print("⏰ Request timeout (30s)")
        return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {e}")
        return None

def check_flow_health():
    """Check if the flow is accessible and properly configured"""
    try:
        # Try to get flow information
        flow_info_url = f"{BASE_URL}/api/v1/flows/{FLOW_ID}"
        response = requests.get(flow_info_url, timeout=10)
        
        if response.status_code == 200:
            flow_data = response.json()
            print(f"✅ Flow accessible: {flow_data.get('name', 'Unknown')}")
            return True
        else:
            print(f"⚠️ Flow not found or inaccessible (status: {response.status_code})")
            return False
            
    except Exception as e:
        print(f"❌ Cannot check flow health: {e}")
        return False

def test_simple_search():
    """Test with a simple search query"""
    print("🧪 Testing simple search...")
    test_result = search_memories("pizza")
    
    if test_result:
        print("✅ Simple search successful!")
        return True
    else:
        print("❌ Simple search failed")
        return False

def main():
    print("🔎 LANGFLOW MEMORY RETRIEVAL - FIXED VERSION")
    print("=" * 60)
    print(f"🌐 Flow ID: {FLOW_ID}")
    print(f"🌐 API URL: {RUN_URL}")
    print()
    
    # Health check
    if not check_flow_health():
        print("\n💡 Troubleshooting tips:")
        print("1. Verify Langflow is running on localhost:7860")
        print("2. Check that FLOW_ID is correct")
        print("3. Ensure flow has Chat Input and Chat Output components")
        print("4. Test the flow manually in Langflow UI first")
        return
    
    # Simple test
    if not test_simple_search():
        print("\n🔧 Configuration issues detected:")
        print("1. Check Astra DB component connection")
        print("2. Verify collection has vectorized data (not null)")
        print("3. Ensure proper flow connections:")
        print("   Chat Input → Astra DB Search → Parser → Chat Output")
        print("4. Check Astra DB token and permissions")
        return
    
    # Run all test queries
    print("\n" + "=" * 60)
    print("🚀 RUNNING ALL TEST QUERIES")
    print("=" * 60)
    
    all_results = []
    success_count = 0
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n🎯 Query {i}/{len(test_queries)}: {query}")
        print("-" * 40)
        
        results = search_memories(query)
        if results:
            success_count += 1
            all_results.extend(results)
        
        # Rate limiting
        if i < len(test_queries):
            time.sleep(1)
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    print(f"✅ Successful searches: {success_count}/{len(test_queries)}")
    print(f"📋 Total results retrieved: {len(all_results)}")
    
    if success_count > 0:
        print("\n🎉 Memory retrieval is working!")
        print("💡 If results seem incorrect, check:")
        print("  - Vector embeddings in your collection")
        print("  - Search query relevance")
        print("  - Reranker configuration")
    else:
        print("\n⚠️ No memories retrieved")
        print("💡 Next steps:")
        print("  1. Check Astra DB collection configuration")
        print("  2. Verify embeddings are generated ($vector not null)")
        print("  3. Test search directly in Astra DB console")
        print("  4. Review Langflow component connections")

if __name__ == "__main__":
    main()
