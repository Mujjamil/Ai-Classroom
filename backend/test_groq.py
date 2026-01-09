from groq import Groq
import os

# Test if Groq is working
# Get API key from environment variable
api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    print("ERROR: GROQ_API_KEY environment variable not set")
    print("Please set it with: export GROQ_API_KEY='your-api-key-here'")
    exit(1)

try:
    client = Groq(api_key=api_key)
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Say 'Hello, Groq is working!' in JSON format with a 'message' key."}
        ],
        temperature=0.3,
        max_tokens=50
    )
    
    print("SUCCESS! Groq is working!")
    print("Response:", response.choices[0].message.content)
    
except Exception as e:
    print(f"ERROR: {e}")
