import os
import sys
import django

# Setup Django
sys.path.insert(0, '/Users/mactm/Downloads/ai-classroom-main/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'classroom_backend.settings')
django.setup()

from core.models import Submission

# Get the most recent submission
try:
    submission = Submission.objects.latest('id')
    print(f"Testing submission ID: {submission.id}")
    print(f"File: {submission.file.name}")
    print(f"Assignment: {submission.assignment.title}")
    
    # Try to access the analyze_ai function
    from core.views import SubmissionViewSet
    viewset = SubmissionViewSet()
    
    print("\nAttempting AI analysis...")
    viewset.analyze_ai(submission)
    print("✅ AI analysis completed successfully!")
    
except Exception as e:
    print(f"❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
