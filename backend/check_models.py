
import google.generativeai as genai
import os
import environ
from pathlib import Path

# Setup env
env = environ.Env()
environ.Env.read_env(os.path.join(Path(__file__).resolve().parent, '.env'))

GEMINI_API_KEY = env('GEMINI_API_KEY', default=None)

if not GEMINI_API_KEY:
    print("No API Key found")
    exit()

genai.configure(api_key=GEMINI_API_KEY)

print("Listing models...")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(f"Error: {e}")
