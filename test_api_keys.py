"""Test script to verify API keys work correctly."""
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')

print("\n" + "="*60)
print("API KEY VERIFICATION TEST")
print("="*60 + "\n")

# Test 1: Check if keys are loaded
print("1. Checking if API keys are loaded...")
print(f"   GEMINI_API_KEY: {'✓ Found' if GEMINI_API_KEY else '✗ Not found'}")
if GEMINI_API_KEY:
    print(f"   Key starts with: {GEMINI_API_KEY[:10]}...")
print(f"   GROQ_API_KEY: {'✓ Found' if GROQ_API_KEY else '✗ Not found'}")
if GROQ_API_KEY:
    print(f"   Key starts with: {GROQ_API_KEY[:10]}...")

# Test 2: Test Gemini API
if GEMINI_API_KEY:
    print("\n2. Testing Gemini API...")
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={GEMINI_API_KEY}"
        headers = {"Content-Type": "application/json"}
        data = {
            "contents": [{
                "parts": [{"text": "Say 'Hello World' in exactly 2 words"}]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 100,
            }
        }
        
        print("   Sending test request to Gemini...")
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        print(f"   Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            if 'candidates' in result and result['candidates']:
                content = result['candidates'][0]['content']['parts'][0]['text']
                print(f"   ✓ Gemini API works! Response: {content.strip()}")
            else:
                print(f"   ✗ Unexpected response structure: {result}")
        else:
            print(f"   ✗ Gemini API failed with status {response.status_code}")
            print(f"   Error: {response.text}")
            
    except Exception as e:
        print(f"   ✗ Gemini API test failed: {str(e)}")
else:
    print("\n2. Skipping Gemini test (no API key)")

# Test 3: Test Groq API
if GROQ_API_KEY:
    print("\n3. Testing Groq API...")
    try:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        data = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "user", "content": "Say 'Hello World' in exactly 2 words"}
            ],
            "max_tokens": 50,
            "temperature": 0.7
        }
        
        print("   Sending test request to Groq...")
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        print(f"   Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            if 'choices' in result and result['choices']:
                content = result['choices'][0]['message']['content']
                print(f"   ✓ Groq API works! Response: {content.strip()}")
            else:
                print(f"   ✗ Unexpected response structure: {result}")
        else:
            print(f"   ✗ Groq API failed with status {response.status_code}")
            print(f"   Error: {response.text}")
            
    except Exception as e:
        print(f"   ✗ Groq API test failed: {str(e)}")
else:
    print("\n3. Skipping Groq test (no API key)")

# Summary
print("\n" + "="*60)
print("SUMMARY")
print("="*60)

if GEMINI_API_KEY or GROQ_API_KEY:
    print("\n✓ At least one API key is configured")
    print("\nNext steps:")
    print("1. If tests passed, restart your backend: cd backend && python app.py")
    print("2. Try generating a README from the UI")
    print("3. Check backend console for 'Using Gemini...' or 'Using Llama...' messages")
else:
    print("\n✗ No API keys configured!")
    print("\nPlease add API keys to .env file:")
    print("  GEMINI_API_KEY=AIzaSy...")
    print("  GROQ_API_KEY=gsk_...")

print("\n")
