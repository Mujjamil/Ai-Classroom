from django.utils.timezone import now
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, Classroom, Enrollment, Assignment, Submission, AIReport, Announcement, Notification
from .serializers import (
    UserSerializer, ClassroomSerializer, EnrollmentSerializer, 
    AssignmentSerializer, SubmissionSerializer, MyTokenObtainPairSerializer,
    AnnouncementSerializer, NotificationSerializer
)
import random
import string
import os
from pathlib import Path
import google.generativeai as genai
import environ
from spellchecker import SpellChecker
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import spacy
import pdfplumber
import docx
import textstat
import io

# Initialize environ
env = environ.Env()
environ.Env.read_env(os.path.join(Path(__file__).resolve().parent.parent, '.env'))

# Configure AI API (Groq - Free alternative to Gemini)
GROQ_API_KEY = env('GROQ_API_KEY', default=None)
if GROQ_API_KEY:
    from groq import Groq
    groq_client = Groq(api_key=GROQ_API_KEY)
else:
    groq_client = None

nlp = spacy.load("en_core_web_sm")

# Helper function to extract file content
def extract_file_content(file):
    """Extract text content from uploaded file (PDF, DOCX, TXT)"""
    try:
        file_name = file.name.lower()
        
        if file_name.endswith('.pdf'):
            with pdfplumber.open(file) as pdf:
                text_parts = []
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        text_parts.append(text)
                return '\n'.join(text_parts)
        
        elif file_name.endswith('.docx') or file_name.endswith('.doc'):
            doc = docx.Document(file)
            return '\n'.join([para.text for para in doc.paragraphs])
        
        elif file_name.endswith('.txt'):
            return file.read().decode('utf-8', errors='ignore')
        
        else:
            return "Unsupported file format. Please upload PDF, DOCX, or TXT files."
    
    except Exception as e:
        return f"Error reading file: {str(e)}"

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def analyze_file(request):
    """
    Analyze uploaded file and answer student questions using Groq AI
    """
    if not groq_client:
        return Response({
            'error': 'AI service not configured. Please add GROQ_API_KEY to .env file.'
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    
    file = request.FILES.get('file')
    question = request.data.get('question', 'Explain this file in simple words')
    
    if not file:
        return Response({
            'error': 'No file uploaded'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Extract content from file
    content = extract_file_content(file)
    
    if content.startswith('Error') or content.startswith('Unsupported'):
        return Response({
            'error': content
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Limit content to first 15000 characters to fit in context window
    content = content[:15000]
    
    try:
        # Use Groq AI to answer the question
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a helpful study assistant for students. "
                        "IMPORTANT FORMATTING RULES:\n"
                        "1. Always use bullet points (•) or numbered lists (1., 2., 3.) for clarity\n"
                        "2. Use headings with ** for main sections\n"
                        "3. Break down complex information into digestible points\n"
                        "4. Use simple language and examples\n"
                        "5. Never write long continuous paragraphs\n"
                        "6. For questions and answers, format as:\n"
                        "   **Q1: Question here?**\n"
                        "   • Answer point 1\n"
                        "   • Answer point 2\n\n"
                        "7. For summaries, use bullet points with key information\n"
                        "8. For explanations, break into numbered steps or points\n"
                        "Provide clear, concise, and well-structured educational responses."
                    )
                },
                {
                    "role": "user",
                    "content": f"{question}\n\nFile Content:\n{content}"
                }
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        answer = response.choices[0].message.content
        
        return Response({
            'answer': answer,
            'file_name': file.name,
            'question': question
        })
    
    except Exception as e:
        return Response({
            'error': f'AI analysis failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
