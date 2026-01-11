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

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def api_root(request):
    return Response({
        "message": "Welcome to AI Classroom API",
        "status": "Running",
        "endpoints": {
            "auth": "/api/token/",
            "classrooms": "/api/classrooms/",
            "users": "/api/users/"
        }
    })

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get', 'put', 'patch'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class ClassroomViewSet(viewsets.ModelViewSet):
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'faculty':
            return Classroom.objects.filter(faculty=user)
        # Students see classrooms they are enrolled in
        return Classroom.objects.filter(enrollments__student=user)

    def perform_create(self, serializer):
        # Generate unique class code
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            if not Classroom.objects.filter(class_code=code).exists():
                break
        serializer.save(faculty=self.request.user, class_code=code)

    @action(detail=False, methods=['post'])
    def join(self, request):
        code = request.data.get('code')
        try:
            classroom = Classroom.objects.get(class_code=code)
            Enrollment.objects.get_or_create(classroom=classroom, student=request.user)
            return Response(ClassroomSerializer(classroom).data)
        except Classroom.DoesNotExist:
            return Response({'error': 'Invalid class code'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def global_chat(self, request):
        try:
            user = request.user
            user_query = request.data.get('message', '')
            
            # Aggregate data from all user's classrooms
            if user.role == 'faculty':
                classrooms = Classroom.objects.filter(faculty=user)
            else:
                classrooms = Classroom.objects.filter(enrollments__student=user)
                
            assignments = Assignment.objects.filter(classroom__in=classrooms)
            announcements = Announcement.objects.filter(classroom__in=classrooms).order_by('-created_at')
            my_submissions = Submission.objects.filter(assignment__in=assignments, student=user)
            
            pending_count = max(0, assignments.count() - my_submissions.count())
            
            if groq_client:
                try:
                    response = groq_client.chat.completions.create(
                        model="llama-3.3-70b-versatile",
                        messages=[
                            {"role": "system", "content": "You are a helpful AI assistant. Answer clearly using bullet points."},
                            {"role": "user", "content": user_query}
                        ],
                        temperature=0.7,
                        max_tokens=1000
                    )
                    response_text = response.choices[0].message.content
                    return Response({'response': response_text})
                except Exception as ai_err:
                    return Response({'response': f"AI Engine Error: {str(ai_err)}", 'debug': True}, status=status.HTTP_200_OK)
            
            # Fallback if no API key
            return Response({
                'response': f"Hello {user.username}! I am currently running in limited mode because the Gemini API key is not configured. "
                            f"You have {classrooms.count()} classrooms and {pending_count} pending assignments across all your classes."
            })
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            print(error_trace) # Log to server terminal
            return Response({
                'response': f"System Error: {str(e)}", 
                'trace': error_trace if os.environ.get('DEBUG') else None
            }, status=status.HTTP_400_BAD_REQUEST) # Use 400 instead of 500 to see message in frontend

    @action(detail=True, methods=['get'])
    def stream(self, request, pk=None):
        classroom = self.get_object()
        announcements = Announcement.objects.filter(classroom=classroom).order_by('-created_at')
        assignments = Assignment.objects.filter(classroom=classroom).order_by('-created_at')
        
        # Combine and sort? Or return separate? Let's return separate for now.
        return Response({
            'announcements': AnnouncementSerializer(announcements, many=True).data,
            'assignments': AssignmentSerializer(assignments, many=True).data
        })
    @action(detail=True, methods=['get'])
    def people(self, request, pk=None):
        classroom = self.get_object()
        enrollments = Enrollment.objects.filter(classroom=classroom).select_related('student')
        return Response({
            'faculty': UserSerializer(classroom.faculty).data,
            'students': UserSerializer([e.student for e in enrollments], many=True).data
        })

    @action(detail=True, methods=['get'])
    def grades(self, request, pk=None):
        classroom = self.get_object()
        assignments = Assignment.objects.filter(classroom=classroom)
        enrollments = Enrollment.objects.filter(classroom=classroom).select_related('student')
        
        gradebook = []
        for enrollment in enrollments:
            student = enrollment.student
            student_grades = []
            for assignment in assignments:
                submission = Submission.objects.filter(student=student, assignment=assignment).first()
                student_grades.append({
                    'assignment_id': assignment.id,
                    'grade': submission.grade if submission else None,
                    'status': submission.status if submission else 'missing'
                })
            gradebook.append({
                'student_id': student.id,
                'student_name': student.username,
                'grades': student_grades
            })
            
        return Response({
            'assignments': AssignmentSerializer(assignments, many=True).data,
            'gradebook': gradebook
        })

    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        classroom = self.get_object()
        assignments = Assignment.objects.filter(classroom=classroom)
        enrollments_count = Enrollment.objects.filter(classroom=classroom).count()
        
        stats = []
        for asgn in assignments:
            subs = Submission.objects.filter(assignment=asgn)
            avg_grade = sum([s.grade for s in subs if s.grade]) / subs.filter(grade__isnull=False).count() if subs.filter(grade__isnull=False).exists() else 0
            stats.append({
                'assignment_id': asgn.id,
                'title': asgn.title,
                'submission_rate': (subs.count() / enrollments_count * 100) if enrollments_count > 0 else 0,
                'average_grade': round(avg_grade, 2)
            })
            
        return Response(stats)

    @action(detail=True, methods=['post'])
    def ai_chat(self, request, pk=None):
        try:
            classroom = self.get_object()
            user = request.user
            user_query = request.data.get('message', '')
            
            # Real-time data fetching for context
            assignments = Assignment.objects.filter(classroom=classroom)
            announcements = Announcement.objects.filter(classroom=classroom).order_by('-created_at')
            my_submissions = Submission.objects.filter(assignment__classroom=classroom, student=user)
            graded_submissions = my_submissions.filter(status='graded')
            
            # Prepare context for Gemini
            context = f"Classroom: {classroom.name} ({classroom.section})\n"
            context += f"Instructor: {classroom.faculty.username}\n"
            context += f"Current User: {user.username} (Role: {user.role})\n\n"
            
            context += "Available Assignments:\n"
            for a in assignments:
                status_str = "Submitted" if my_submissions.filter(assignment=a).exists() else "Pending"
                context += f"- {a.title}: {a.points} points, Due {a.due_date.strftime('%Y-%m-%d %H:%M')}. Status: {status_str}\n"
                
            context += "\nRecent Announcements:\n"
            for ann in announcements[:3]:
                context += f"- [{ann.created_at.strftime('%Y-%m-%d')}] {ann.content}\n"
                
            if graded_submissions.exists():
                grades = [s.grade for s in graded_submissions if s.grade is not None]
                if grades:
                    avg = sum(grades) / len(grades)
                    context += f"\nUser Performance: {len(grades)} graded tasks, Average Score: {avg:.1f} points.\n"

            if GEMINI_API_KEY:
                try:
                    model = genai.GenerativeModel('gemini-1.5-flash')
                    system_instruction = (
                        f"You are the Classroom AI Assistant for '{classroom.name}'. "
                        "You have direct access to assignments, student grades, and announcements. "
                        "If a student asks about their grade, refer to the performance data. "
                        "If they ask about deadlines, list the upcoming ones. "
                        "Always be encouraging, precise, and educational. Use markdown."
                    )
                    full_prompt = (
                        f"{system_instruction}\n\n"
                        f"### Context: {classroom.name}\n"
                        f"{context}\n\n"
                        f"### User Message\n{user_query}"
                    )
                    
                    response = model.generate_content(full_prompt)
                    response_text = response.text if response.candidates and response.candidates[0].content.parts else "I failed to process that request. Try asking about specific classroom details like deadlines or your grades."
                    return Response({'response': response_text})
                except Exception as ai_err:
                    return Response({'response': f"Classroom AI Error: {str(ai_err)}"}, status=status.HTTP_200_OK)
            
            # Fallback to local logic if no API key
            message = user_query.lower()
            if 'assignment' in message or 'work' in message:
                pending = assignments.count() - my_submissions.count()
                titles = ", ".join([a.title for a in assignments[:3]])
                response = f"There are {assignments.count()} assignments in {classroom.name}. "
                if pending > 0:
                    response += f"You have {pending} pending tasks. "
                response += f"The latest ones include: {titles}."
            elif 'deadline' in message or 'due' in message:
                upcoming = assignments.filter(due_date__gte=now()).order_by('due_date').first()
                if upcoming:
                    response = f"The next deadline is for '{upcoming.title}' on {upcoming.due_date.strftime('%B %d at %H:%M')}."
                else:
                    response = "Good news! There are no upcoming deadlines at the moment."
            else:
                response = "I'm currently running in low-power mode. Please add a Gemini API Key to enable full AI intelligence!"
                
            return Response({'response': response})
        except Exception as e:
            return Response({'response': f"System Error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        classroom_id = self.request.query_params.get('classroom')
        if classroom_id:
            return Assignment.objects.filter(classroom_id=classroom_id)
        return Assignment.objects.all()

    def perform_create(self, serializer):
        # Ensure classroom belongs to the faculty
        classroom_id = self.request.data.get('classroom')
        assignment = serializer.save(classroom_id=classroom_id)
        
        # Notify all enrolled students
        enrollments = Enrollment.objects.filter(classroom_id=classroom_id)
        for enrollment in enrollments:
            Notification.objects.create(
                user=enrollment.student,
                title="New Assignment",
                message=f"A new assignment '{assignment.title}' has been posted in {assignment.classroom.name}.",
                link=f"/classroom/{classroom_id}/assignment/{assignment.id}"
            )

class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Submission.objects.all().select_related('student', 'assignment')
        assignment_id = self.request.query_params.get('assignment')
        
        if assignment_id:
            queryset = queryset.filter(assignment_id=assignment_id)
            
        if user.role == 'student':
            queryset = queryset.filter(student=user)
        # If faculty, they see all submissions for classrooms they lead
        elif user.role == 'faculty':
            queryset = queryset.filter(assignment__classroom__faculty=user)
            
        return queryset

    def perform_create(self, serializer):
        submission = serializer.save(student=self.request.user)
        self.analyze_ai(submission)
        
        # Notify Faculty
        Notification.objects.create(
            user=submission.assignment.classroom.faculty,
            title="New Submission",
            message=f"{submission.student.username} submitted '{submission.assignment.title}'.",
            link=f"/classroom/{submission.assignment.classroom.id}/assignment/{submission.assignment.id}"
        )

    def perform_update(self, serializer):
        old_status = self.get_object().status
        submission = serializer.save()
        
        # Trigger AI Analysis on update (if file changed, or just always for safety)
        # In a real app we might check if 'file' is in validated_data, but let's run it to be safe
        self.analyze_ai(submission)

        # Notify student if graded
        if old_status != 'graded' and submission.status == 'graded':
            Notification.objects.create(
                user=submission.student,
                title="Assignment Graded",
                message=f"Your submission for '{submission.assignment.title}' has been graded: {submission.grade}/{submission.assignment.points}.",
                link=f"/classroom/{submission.assignment.classroom.id}/assignment/{submission.assignment.id}"
            )

    def analyze_ai(self, submission):
        try:
            content = ""
            metadata = {"type": "unknown", "pages": 0, "styles": []}
            file_path = submission.file.path
            _, ext = os.path.splitext(file_path)

            if ext.lower() == '.pdf':
                metadata["type"] = "pdf"
                with pdfplumber.open(file_path) as pdf:
                    metadata["pages"] = len(pdf.pages)
                    extracted_text_parts = []
                    style_samples = []
                    
                    for i, page in enumerate(pdf.pages):
                        text = page.extract_text()
                        if text: extracted_text_parts.append(text)
                        
                        # Extract rudimentary style info from the first few chars of each page
                        # to give AI a hint about fonts/margins
                        if i < 3: # Check first 3 pages
                            words = page.extract_words(extra_attrs=['fontname', 'size', 'x0', 'top'])
                            if words:
                                style_samples.append({
                                    "page": i + 1,
                                    "sample_fonts": list(set([w['fontname'] for w in words[:10]])),
                                    "sample_sizes": list(set([w['size'] for w in words[:10]])),
                                    "margin_left_sample": min([w['x0'] for w in words]),
                                    "margin_top_sample": min([w['top'] for w in words])
                                })
                    content = "\n".join(extracted_text_parts)
                    metadata["styles"] = style_samples

            elif ext.lower() in ['.docx', '.doc']:
                metadata["type"] = "docx"
                doc = docx.Document(file_path)
                content = "\n".join([para.text for para in doc.paragraphs])
                
                # Extract DOCX style info
                styles_found = []
                for i, para in enumerate(doc.paragraphs[:20]): # Check first 20 paragraphs
                    para_style = {
                        "alignment": str(para.alignment) if para.alignment else "Left/Default",
                        "fonts": [],
                        "sizes": []
                    }
                    for run in para.runs:
                        if run.font.name: para_style["fonts"].append(run.font.name)
                        if run.font.size: para_style["sizes"].append(str(run.font.size.pt))
                    
                    if para.text.strip():
                        styles_found.append(para_style)
                metadata["styles"] = styles_found

            else:
                submission.file.open(mode='rb')
                content = submission.file.read().decode('utf-8', errors='ignore')
                submission.file.close()

            if not content or not content.strip():
                content = "Empty or unreadable file content."

            # Spelling (with location tracking and proper noun filtering)
            spell = SpellChecker()
            import re
            
            # Common British/US spelling variants to accept
            british_variants = {
                'analyse', 'behaviour', 'colour', 'favour', 'honour', 'labour',
                'neighbour', 'rumour', 'splendour', 'centre', 'metre', 'litre',
                'defence', 'licence', 'offence', 'pretence', 'organisation',
                'realise', 'recognise', 'specialise', 'summarise', 'optimise'
            }
            skip_words = {'aiml', 'proteus', 'matlab', 'github', 'api', 'json', 'html', 'css', 'dsp', 'fsk'}
            
            # Use spaCy to detect proper nouns (names, organizations, locations)
            doc_nlp = nlp(content[:5000])  # Process first 5000 chars for NER
            proper_nouns = set()
            for ent in doc_nlp.ents:
                # Skip entities that are names, organizations, or locations
                if ent.label_ in ['PERSON', 'ORG', 'GPE', 'LOC', 'FAC']:
                    # Add each word in the entity to proper nouns set
                    for token in ent.text.split():
                        cleaned_token = re.sub(r'[^a-zA-Z]', '', token).lower()
                        if cleaned_token:
                            proper_nouns.add(cleaned_token)
            
            # Split content into lines for location tracking
            lines = content.split('\n')
            misspelled = []
            detailed_errors = []
            
            for line_num, line in enumerate(lines[:100], start=1):  # Check first 100 lines
                words_in_line = line.split()
                
                for word in words_in_line:
                    # Clean the word
                    cleaned = re.sub(r'[^a-zA-Z]', '', word).lower()
                    
                    # Only check words 4+ characters
                    if len(cleaned) >= 4 and cleaned.isalpha():
                        # Check if misspelled
                        if cleaned in spell.unknown([cleaned]):
                            # Filter out false positives
                            if (cleaned not in skip_words and 
                                cleaned not in british_variants and 
                                cleaned not in proper_nouns):  # NEW: Skip proper nouns
                                
                                # Get suggestion
                                correction = spell.correction(cleaned)
                                
                                # Add to simple list (for backward compatibility)
                                if cleaned not in misspelled:
                                    misspelled.append(cleaned)
                                
                                # Add detailed error info
                                detailed_errors.append({
                                    'word': cleaned,
                                    'line': line_num,
                                    'context': line.strip()[:100],  # First 100 chars of line
                                    'suggestion': correction if correction != cleaned else None
                                })
                
                # Limit to 20 detailed errors to avoid overwhelming the student
                if len(detailed_errors) >= 20:
                    break

            # Grammar/Clarity
            doc = nlp(content[:3000])
            suggestions = []
            grammar_errors = []
            
            for sent in doc.sents:
                if len(sent.text.split()) > 25:
                    suggestions.append(f"Long sentence: {sent.text[:40]}...")
                if any(tok.dep_ == 'nsubjpass' for tok in sent):
                    grammar_errors.append(f"Passive voice: {sent.text[:40]}...")

            # Readability (Safe wrap)
            try:
                if content.strip():
                    import nltk
                    try:
                        nltk.data.find('corpora/cmudict')
                    except LookupError:
                        nltk.download('cmudict', quiet=True)
                    readability = textstat.flesch_reading_ease(content[:5000])
                else:
                    readability = 0
            except Exception:
                # If textstat fails, default to 0
                readability = 0
            
            # Plagiarism
            other_submissions = Submission.objects.filter(assignment=submission.assignment).exclude(id=submission.id)
            similarity_score = 0.0
            matched_text = ""
            
            if other_submissions.exists():
                texts = [content]
                for other in other_submissions:
                    try:
                        other.file.open('rb')
                        texts.append(other.file.read().decode('utf-8', errors='ignore'))
                        other.file.close()
                    except:
                        texts.append("")
                
                if len(texts) > 1:
                    vectorizer = TfidfVectorizer(stop_words='english').fit_transform(texts)
                    vectors = vectorizer.toarray()
                    cosine_sim = cosine_similarity(vectors)
                    max_sim = max(cosine_sim[0][1:]) if len(cosine_sim[0]) > 1 else 0
                    similarity_score = round(max_sim * 100, 2)
                    matched_text = "Similar patterns found." if similarity_score > 40 else ""

            # Formatting & Instruction Check (Gemini)
            formatting_result = {}


            # Formatting Check (AI-powered with fallback)
            if submission.assignment.formatting_instructions:
                instructions_lower = submission.assignment.formatting_instructions.lower()
                
                # Basic rule-based check (works without AI)
                basic_issues = []
                basic_score = 100
                
                # Check for common formatting requirements
                if 'times new roman' in instructions_lower:
                    fonts_found = metadata.get('styles', [{}])[0].get('fonts', []) if metadata.get('styles') else []
                    if fonts_found and not any('times' in str(f).lower() for f in fonts_found):
                        basic_issues.append("Font may not be Times New Roman")
                        basic_score -= 20
                
                if '12' in instructions_lower and ('font' in instructions_lower or 'size' in instructions_lower):
                    sizes_found = metadata.get('styles', [{}])[0].get('sizes', []) if metadata.get('styles') else []
                    if sizes_found and not any('12' in str(s) for s in sizes_found):
                        basic_issues.append("Font size may not be 12pt")
                        basic_score -= 20
                
                # Try AI enhancement using Groq (free & fast)
                if groq_client:
                    try:
                        system_instruction = (
                            "You are an academic formatting assistant. Check if the document follows the teacher's instructions. "
                            "Return ONLY a valid JSON object with keys: 'compliant' (boolean), 'issues' (array of strings), 'score' (number 0-100). "
                            "Be strict but fair."
                        )
                        
                        user_prompt = (
                            f"Teacher Instructions: {submission.assignment.formatting_instructions}\n\n"
                            f"Document Metadata: {metadata}\n\n"
                            f"Text Sample: {content[:500]}\n\n"
                            "Analyze and return JSON only."
                        )
                        
                        response = groq_client.chat.completions.create(
                            model="llama-3.3-70b-versatile",  # Fast, free Llama model
                            messages=[
                                {"role": "system", "content": system_instruction},
                                {"role": "user", "content": user_prompt}
                            ],
                            temperature=0.3,
                            max_tokens=500
                        )
                        
                        json_str = response.choices[0].message.content.strip()
                        json_str = json_str.replace('```json', '').replace('```', '').strip()
                        import json
                        formatting_result = json.loads(json_str)
                        
                    except Exception as e:
                        # AI failed - use basic check results
                        formatting_result = {
                            "compliant": basic_score >= 70,
                            "score": basic_score,
                            "issues": basic_issues if basic_issues else ["Basic formatting check completed (AI unavailable)"]
                        }
                else:
                    # No API key - use basic check
                    formatting_result = {
                        "compliant": basic_score >= 70,
                        "score": basic_score,
                        "issues": basic_issues if basic_issues else ["Basic formatting check completed"]
                    }

            # Feedback and Grade
            feedback_parts = []
            if similarity_score > 30: feedback_parts.append("High similarity.")
            if len(misspelled) > 5: feedback_parts.append("Spelling issues.")
            
            # Incorporate formatting into summary
            format_score = 100
            if formatting_result:
                if not formatting_result.get('compliant', True):
                    feedback_parts.append("Formatting needs improvement.")
                    format_score = formatting_result.get('score', 100)
            
            summary = " ".join(feedback_parts) if feedback_parts else "Good work."

            total_points = submission.assignment.points
            
            # Weighted scoring: 40% Logic/Grammar, 30% Plagiarism, 30% Formatting
            # Base deductions
            deduction_grammar = min(len(misspelled) * 2, 20) + min(len(grammar_errors) * 3, 15)
            deduction_plagiarism = 30 if similarity_score > 40 else 0
            
            # Calculate final components
            score_content = max(0, 100 - deduction_grammar)
            score_plagiarism = max(0, 100 - deduction_plagiarism)
            
            final_score_percent = (score_content * 0.4) + (score_plagiarism * 0.3) + (format_score * 0.3)
            suggested = max(0, int((final_score_percent / 100) * total_points))

            AIReport.objects.update_or_create(
                submission=submission,
                defaults={
                    'spelling_errors': misspelled,
                    'detailed_spelling_errors': detailed_errors,
                    'grammar_errors': grammar_errors,
                    'clarity_suggestions': suggestions,
                    'similarity_score': similarity_score,
                    'matched_text': matched_text,
                    'readability_score': readability,
                    'feedback_summary': summary,
                    'suggested_grade': suggested,
                    'formatting_analysis': formatting_result
                }
            )
        except Exception as e:
            # Fallback for errors so submission isn't blocked
            print(f"Analysis Error: {e}")
            AIReport.objects.get_or_create(
                submission=submission,
                defaults={
                    'feedback_summary': f"Analysis partially failed: {str(e)}",
                    'similarity_score': 0,
                    'detailed_spelling_errors': [],
                    'formatting_analysis': {"error": str(e)}
                }
            )

class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        classroom_id = self.request.data.get('classroom')
        announcement = serializer.save(
            author=self.request.user,
            classroom_id=classroom_id
        )
        
        # Notify all enrolled students
        enrollments = Enrollment.objects.filter(classroom_id=classroom_id)
        for enrollment in enrollments:
            if enrollment.student != self.request.user:
                Notification.objects.create(
                    user=enrollment.student,
                    title="New Announcement",
                    message=f"{self.request.user.username} posted a new announcement in {announcement.classroom.name}.",
                    link=f"/classroom/{classroom_id}"
                )

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        print(f"DEBUG: Notification fetch for user: {self.request.user}")
        if not self.request.user.is_authenticated:
            print("DEBUG: User not authenticated!")
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'ok'})
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def auto_fix_submission(request):
    """
    AI-powered auto-correction endpoint.
    Automatically fixes spelling, grammar, and formatting errors in student submissions.
    """
    try:
        submission_id = request.data.get('submission_id')
        original_text = request.data.get('original_text', '')
        
        # If original_text is provided directly (standalone mode)
        if original_text and not submission_id:
            # Use default error context
            error_context = ""
        elif submission_id:
            # Get the submission and its AI report
            try:
                submission = Submission.objects.get(id=submission_id)
                ai_report = AIReport.objects.filter(submission=submission).first()
            except Submission.DoesNotExist:
                return Response(
                    {'error': 'Submission not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # If original_text not provided, try to extract from file
            if not original_text and submission.file:
                try:
                    file_path = submission.file.path
                    if file_path.endswith('.txt'):
                        with open(file_path, 'r', encoding='utf-8') as f:
                            original_text = f.read()
                    elif file_path.endswith('.pdf'):
                        with pdfplumber.open(file_path) as pdf:
                            original_text = '\n'.join([page.extract_text() for page in pdf.pages if page.extract_text()])
                    elif file_path.endswith('.docx'):
                        doc = docx.Document(file_path)
                        original_text = '\n'.join([para.text for para in doc.paragraphs])
                except Exception as e:
                    return Response(
                        {'error': f'Could not extract text from file: {str(e)}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
        
        if not original_text:
            return Response(
                {'error': 'No text content available to correct'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Prepare error context for AI
        error_context = ""
        if ai_report:
            # Add spelling errors
            if ai_report.spelling_errors:
                error_context += f"\nSpelling Errors: {ai_report.spelling_errors}"
            
            # Add grammar insights  
            if ai_report.grammar_errors:
                error_context += f"\nGrammar Issues: {ai_report.grammar_errors}"
            
            # Add formatting issues
            if ai_report.formatting_analysis and isinstance(ai_report.formatting_analysis, dict):
                if not ai_report.formatting_analysis.get('compliant', True):
                    issues = ai_report.formatting_analysis.get('issues', [])
                    if issues:
                        error_context += f"\nFormatting Problems: {', '.join(issues)}"
        
        # Use Groq API for correction
        if not groq_client:
            return Response(
                {'error': 'AI service not configured'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        # Create AI prompt
        prompt = f"""You are a text correction assistant. Your ONLY job is to fix errors in the text below.

Original Text:
{original_text}

Detected Issues:
{error_context}

CRITICAL INSTRUCTIONS:
1. Fix ONLY spelling errors, grammar mistakes, and formatting issues
2. Do NOT add any explanations, notes, or commentary
3. Do NOT add headers like "Corrected Version" or any titles
4. Do NOT explain what you changed
5. Return ONLY the corrected text itself
6. Preserve the original meaning and writing style
7. Keep the same paragraph structure and line breaks

Return the corrected text now:"""

        # Call Groq API
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a text correction tool. Return ONLY the corrected text with no explanations, headers, or additional commentary. Just fix the errors and return the text."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.2,  # Even lower for more consistent corrections
            max_tokens=4000
        )
        
        corrected_text = chat_completion.choices[0].message.content.strip()
        
        return Response({
            'original_text': original_text,
            'corrected_text': corrected_text,
            'success': True
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
from django.http import HttpResponse
from docx import Document
from docx.shared import Pt
import io

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def download_corrected_file(request):
    """
    Generate and download corrected file in original format.
    Supports DOCX, PDF (converted to DOCX), and TXT.
    """
    try:
        submission_id = request.data.get('submission_id')
        corrected_text = request.data.get('corrected_text')
        formatting_instructions = request.data.get('formatting_instructions', '')
        original_filename = request.data.get('original_filename', 'document.txt')
        
        if not corrected_text:
            return Response(
                {'error': 'corrected_text is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get file extension and base filename
        file_extension = original_filename.split('.')[-1].lower() if '.' in original_filename else 'txt'
        base_filename = '.'.join(original_filename.split('.')[:-1]) if '.' in original_filename else original_filename
        
        # Override with submission data if available
        if submission_id:
            try:
                submission = Submission.objects.get(id=submission_id)
                # Get original filename and extension from submission
                submission_filename = submission.file.name.split('/')[-1]
                file_extension = submission_filename.split('.')[-1].lower()
                base_filename = '.'.join(submission_filename.split('.')[:-1])
            except Submission.DoesNotExist:
                pass  # Use filename from request
        
        # Parse formatting instructions
        default_font_size = Pt(12)
        default_font_name = 'Times New Roman'
        
        if formatting_instructions:
            formatting = formatting_instructions.lower()
            
            # Extract font name
            if 'times new roman' in formatting:
                default_font_name = 'Times New Roman'
            elif 'arial' in formatting:
                default_font_name = 'Arial'
            elif 'calibri' in formatting:
                default_font_name = 'Calibri'
            
            # Extract font size
            import re
            size_match = re.search(r'(?:size|font)\s*[:\s]*(\d+)', formatting)
            if not size_match:
                size_match = re.search(r'\b(\d+)\s*pt\b', formatting)
            if not size_match:
                size_match = re.search(r'\b(10|11|12|14|16|18)\b', formatting)
            
            if size_match:
                font_size = int(size_match.group(1))
                default_font_size = Pt(font_size)
        
        # Extract tables from original DOCX if available
        original_tables = []
        if submission_id and file_extension in ['docx', 'doc']:
            try:
                submission = Submission.objects.get(id=submission_id)
                if submission.file and submission.file.path.endswith('.docx'):
                    original_doc = Document(submission.file.path)
                    # Store table data (not the table objects themselves)
                    for table in original_doc.tables:
                        table_data = []
                        for row in table.rows:
                            row_data = []
                            for cell in row.cells:
                                row_data.append(cell.text)
                            table_data.append(row_data)
                        if table_data:  # Only add non-empty tables
                            original_tables.append(table_data)
            except Exception as e:
                print(f"Could not extract tables: {e}")
                pass
        
        # Generate file based on original format
        if file_extension in ['docx', 'doc', 'pdf']:
            # Create DOCX file
            document = Document()
            
            # Apply formatting settings to document
            from docx.enum.text import WD_ALIGN_PARAGRAPH
            from docx.shared import Inches
            
            # Set margins if specified
            if formatting_instructions:
                instructions_lower = formatting_instructions.lower()
                margin_match = re.search(r'(\d+(?:\.\d+)?)\s*inch', instructions_lower)
                if margin_match:
                    margin_size = float(margin_match.group(1))
                    sections = document.sections
                    for section in sections:
                        section.top_margin = Inches(margin_size)
                        section.bottom_margin = Inches(margin_size)
                        section.left_margin = Inches(margin_size)
                        section.right_margin = Inches(margin_size)
            
            # Determine alignment
            alignment = WD_ALIGN_PARAGRAPH.LEFT  # Default
            if formatting_instructions:
                instructions_lower = formatting_instructions.lower()
                if 'center' in instructions_lower and 'align' in instructions_lower:
                    alignment = WD_ALIGN_PARAGRAPH.CENTER
                elif 'justify' in instructions_lower:
                    alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
                elif 'right' in instructions_lower and 'align' in instructions_lower:
                    alignment = WD_ALIGN_PARAGRAPH.RIGHT
            
            # Determine line spacing
            line_spacing = 1.0  # Default single spacing
            if formatting_instructions:
                instructions_lower = formatting_instructions.lower()
                if 'double' in instructions_lower and 'spac' in instructions_lower:
                    line_spacing = 2.0
                elif '1.5' in instructions_lower:
                    line_spacing = 1.5
            
            # Determine word spacing
            word_spacing_pt = 0  # Default normal spacing
            if formatting_instructions:
                instructions_lower = formatting_instructions.lower()
                if 'word spacing' in instructions_lower:
                    # Try to extract specific value (e.g., "word spacing: 2pt")
                    spacing_match = re.search(r'word\s*spacing[:\s]*(\d+(?:\.\d+)?)\s*pt', instructions_lower)
                    if spacing_match:
                        word_spacing_pt = float(spacing_match.group(1))
                    else:
                        # Default to 1pt expanded if mentioned without value
                        word_spacing_pt = 1.0
            
            # Add header if specified
            if formatting_instructions and 'header' in formatting_instructions.lower():
                header = document.sections[0].header
                header_para = header.paragraphs[0]
                header_para.text = "Document Header"
                header_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
            
            # Add footer with page numbers if specified
            if formatting_instructions and ('footer' in formatting_instructions.lower() or 'page number' in formatting_instructions.lower()):
                footer = document.sections[0].footer
                footer_para = footer.paragraphs[0]
                footer_para.text = "Page "
                footer_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
            
            # Add corrected text with proper formatting
            paragraphs = corrected_text.split('\n')
            for idx, para_text in enumerate(paragraphs):
                if para_text.strip():
                    p = document.add_paragraph()
                    run = p.add_run(para_text)
                    
                    # Apply alignment
                    p.alignment = alignment
                    
                    # Apply line spacing correctly
                    if line_spacing == 2.0:
                        p.paragraph_format.line_spacing = 2.0
                    elif line_spacing == 1.5:
                        p.paragraph_format.line_spacing = 1.5
                    else:
                        p.paragraph_format.line_spacing = 1.0
                    
                    # Set font properties
                    run.font.name = default_font_name
                    run.font.size = default_font_size
                    
                    # Apply word spacing if specified
                    if word_spacing_pt > 0:
                        run.font.spacing = Pt(word_spacing_pt)
                    
                    # Apply title formatting to first paragraph if specified
                    if idx == 0 and formatting_instructions:
                        instructions_lower = formatting_instructions.lower()
                        if 'title' in instructions_lower:
                            if 'bold' in instructions_lower:
                                run.font.bold = True
                            if 'underline' in instructions_lower:
                                run.font.underline = True
                            # Center title if specified
                            if 'center' in instructions_lower and 'title' in instructions_lower:
                                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                else:
                    document.add_paragraph()  # Empty line
            
            # Add preserved tables if any
            if original_tables:
                from docx.enum.table import WD_TABLE_ALIGNMENT
                
                for table_data in original_tables:
                    if not table_data:
                        continue
                    
                    # Add spacing before table
                    document.add_paragraph()
                    
                    # Create table
                    num_rows = len(table_data)
                    num_cols = len(table_data[0]) if table_data else 0
                    new_table = document.add_table(rows=num_rows, cols=num_cols)
                    
                    # Copy cell content
                    for i, row_data in enumerate(table_data):
                        for j, cell_text in enumerate(row_data):
                            if j < len(new_table.rows[i].cells):
                                new_table.rows[i].cells[j].text = cell_text
                    
                    # Apply table formatting if specified
                    if formatting_instructions:
                        instructions_lower = formatting_instructions.lower()
                        
                        # Apply borders
                        if 'border' in instructions_lower or 'table' in instructions_lower:
                            new_table.style = 'Table Grid'
                        
                        # Apply alignment
                        if 'center' in instructions_lower and 'table' in instructions_lower:
                            new_table.alignment = WD_TABLE_ALIGNMENT.CENTER
                    
                    # Add spacing after table
                    document.add_paragraph()
            
            # Save to bytes buffer
            buffer = io.BytesIO()
            document.save(buffer)
            buffer.seek(0)
            
            # Create response
            response = HttpResponse(
                buffer.getvalue(),
                content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            )
            response['Content-Disposition'] = f'attachment; filename="{base_filename}_corrected.docx"'
            response['Access-Control-Expose-Headers'] = 'Content-Disposition'
            
        else:  # TXT or other formats
            # Return as text file
            response = HttpResponse(corrected_text, content_type='text/plain;charset=utf-8')
            response['Content-Disposition'] = f'attachment; filename="{base_filename}_corrected.txt"'
            response['Access-Control-Expose-Headers'] = 'Content-Disposition'
        
        return response
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def auto_fix_file(request):
    """
    Upload a file and get AI-corrected version.
    Standalone endpoint for Auto-Fix AI page.
    """
    try:
        uploaded_file = request.FILES.get('file')
        formatting_instructions = request.data.get('formatting_instructions', '')
        
        if not uploaded_file:
            return Response(
                {'error': 'No file uploaded'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Extract text from uploaded file
        original_text = ''
        file_name = uploaded_file.name
        file_extension = file_name.split('.')[-1].lower()
        
        try:
            if file_extension == 'txt':
                original_text = uploaded_file.read().decode('utf-8')
            elif file_extension == 'pdf':
                import tempfile
                with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
                    for chunk in uploaded_file.chunks():
                        tmp_file.write(chunk)
                    tmp_file_path = tmp_file.name
                
                with pdfplumber.open(tmp_file_path) as pdf:
                    original_text = '\n'.join([page.extract_text() for page in pdf.pages if page.extract_text()])
                
                os.unlink(tmp_file_path)
            elif file_extension in ['docx', 'doc']:
                import tempfile
                with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{file_extension}') as tmp_file:
                    for chunk in uploaded_file.chunks():
                        tmp_file.write(chunk)
                    tmp_file_path = tmp_file.name
                
                doc = docx.Document(tmp_file_path)
                original_text = '\n'.join([para.text for para in doc.paragraphs])
                
                os.unlink(tmp_file_path)
            else:
                return Response(
                    {'error': 'Unsupported file type. Please upload TXT, PDF, or DOCX'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response(
                {'error': f'Failed to read file: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not original_text or not original_text.strip():
            return Response(
                {'error': 'No text content found in file'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Use Groq API for correction
        if not groq_client:
            return Response(
                {'error': 'AI service not configured'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Create AI prompt
        prompt = f"""You are a text correction assistant. Your ONLY job is to fix errors in the text below.

Original Text:
{original_text}

CRITICAL INSTRUCTIONS:
1. Fix ONLY spelling errors, grammar mistakes, and formatting issues
2. Do NOT add any explanations, notes, or commentary
3. Do NOT add headers like "Corrected Version" or any titles
4. Do NOT explain what you changed
5. Return ONLY the corrected text itself
6. Preserve the original meaning and writing style
7. Keep the same paragraph structure and line breaks

Return the corrected text now:"""

        # Call Groq API
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a text correction tool. Return ONLY the corrected text with no explanations, headers, or additional commentary. Just fix the errors and return the text."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.2,
            max_tokens=4000
        )
        
        corrected_text = chat_completion.choices[0].message.content.strip()
        
        # Perform comprehensive error analysis
        spell = SpellChecker()
        words = original_text.split()
        misspelled = spell.unknown(words)
        spelling_errors = list(misspelled)  # Show all, not just 10
        
        # Enhanced grammar checks
        grammar_errors = []
        text_lower = original_text.lower()
        
        # Check for common grammar issues
        if ' i ' in text_lower or text_lower.startswith('i '):
            grammar_errors.append("Lowercase 'i' should be capitalized")
        if ' dont ' in text_lower or ' doesnt ' in text_lower or ' cant ' in text_lower:
            grammar_errors.append("Missing apostrophes in contractions")
        if ' their ' in text_lower and ' there ' in text_lower:
            grammar_errors.append("Possible their/there confusion")
        if original_text.count('  ') > 0:
            grammar_errors.append("Multiple consecutive spaces")
        
        # Check for sentence structure
        sentences = original_text.split('.')
        for sentence in sentences:
            if sentence.strip() and len(sentence.strip()) > 0:
                if not sentence.strip()[0].isupper():
                    grammar_errors.append("Sentence should start with capital letter")
                    break
        
        # Enhanced formatting checks
        formatting_issues = []
        
        # Check document start
        if original_text and not original_text[0].isupper():
            formatting_issues.append("Document should start with capital letter")
        
        # Check punctuation
        if original_text and not original_text.rstrip().endswith(('.', '!', '?')):
            formatting_issues.append("Document should end with proper punctuation")
        
        # Check for multiple spaces
        if '  ' in original_text:
            formatting_issues.append("Contains multiple consecutive spaces")
        
        # Check for tabs
        if '\t' in original_text:
            formatting_issues.append("Contains tab characters (use spaces)")
        
        # Check line spacing
        if '\n\n\n' in original_text:
            formatting_issues.append("Excessive line breaks detected")
        
        # Check for inconsistent capitalization
        if original_text.isupper():
            formatting_issues.append("All caps text detected")
        
        # Validate against formatting instructions if provided
        if formatting_instructions:
            instructions_lower = formatting_instructions.lower()
            
            # Check font requirements
            if 'times new roman' in instructions_lower:
                formatting_issues.append("Font should be Times New Roman (apply in Word/DOCX)")
            elif 'arial' in instructions_lower:
                formatting_issues.append("Font should be Arial (apply in Word/DOCX)")
            elif 'calibri' in instructions_lower:
                formatting_issues.append("Font should be Calibri (apply in Word/DOCX)")
            
            # Check font size requirements
            import re
            size_match = re.search(r'(?:size|font)\s*[:\s]*(\d+)', instructions_lower)
            if not size_match:
                size_match = re.search(r'\b(\d+)\s*pt\b', instructions_lower)
            if size_match:
                required_size = size_match.group(1)
                formatting_issues.append(f"Font size should be {required_size}pt (apply in Word/DOCX)")
            
            # Check alignment requirements
            if 'center' in instructions_lower and 'align' in instructions_lower:
                formatting_issues.append("Text should be center-aligned (apply in Word/DOCX)")
            elif 'justify' in instructions_lower:
                formatting_issues.append("Text should be justified (apply in Word/DOCX)")
            elif 'left' in instructions_lower and 'align' in instructions_lower:
                formatting_issues.append("Text should be left-aligned (apply in Word/DOCX)")
            elif 'right' in instructions_lower and 'align' in instructions_lower:
                formatting_issues.append("Text should be right-aligned (apply in Word/DOCX)")
            
            # Check spacing requirements
            if 'double' in instructions_lower and 'spac' in instructions_lower:
                formatting_issues.append("Should use double spacing (apply in Word/DOCX)")
            elif 'single' in instructions_lower and 'spac' in instructions_lower:
                formatting_issues.append("Should use single spacing (apply in Word/DOCX)")
            elif '1.5' in instructions_lower and 'spac' in instructions_lower:
                formatting_issues.append("Should use 1.5 line spacing (apply in Word/DOCX)")
            
            # Check line/paragraph spacing
            if 'line spacing' in instructions_lower or 'gap between' in instructions_lower:
                formatting_issues.append("Check line/paragraph spacing requirements (apply in Word/DOCX)")
            
            # Check margin requirements
            if 'margin' in instructions_lower:
                margin_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:inch|in|cm)', instructions_lower)
                if margin_match:
                    margin_size = margin_match.group(1)
                    formatting_issues.append(f"Margins should be {margin_size} (apply in Word/DOCX)")
                else:
                    formatting_issues.append("Check margin requirements (apply in Word/DOCX)")
            
            # Check header/footer requirements
            if 'header' in instructions_lower:
                formatting_issues.append("Document should include header (apply in Word/DOCX)")
            if 'footer' in instructions_lower:
                formatting_issues.append("Document should include footer (apply in Word/DOCX)")
            
            # Check page number requirements
            if 'page number' in instructions_lower or 'page numbering' in instructions_lower:
                formatting_issues.append("Document should include page numbers (apply in Word/DOCX)")
            
            # Check title formatting
            if 'title' in instructions_lower:
                if 'bold' in instructions_lower:
                    formatting_issues.append("Title should be bold (apply in Word/DOCX)")
                if 'underline' in instructions_lower:
                    formatting_issues.append("Title should be underlined (apply in Word/DOCX)")
                if 'center' in instructions_lower:
                    formatting_issues.append("Title should be centered (apply in Word/DOCX)")
            
            # Check word spacing
            if 'word spacing' in instructions_lower:
                spacing_match = re.search(r'word\s*spacing[:\s]*(\d+(?:\.\d+)?)\s*pt', instructions_lower)
                if spacing_match:
                    spacing_val = spacing_match.group(1)
                    formatting_issues.append(f"Word spacing will be set to {spacing_val}pt")
                else:
                    formatting_issues.append("Word spacing will be set to 1pt (expanded)")
            
            # Check table formatting
            if 'table' in instructions_lower:
                formatting_issues.append("Table formatting will be applied to existing tables (DOCX only)")
                if 'align' in instructions_lower or 'center' in instructions_lower:
                    formatting_issues.append("Tables will be centered")
                if 'border' in instructions_lower:
                    formatting_issues.append("Tables will have grid borders")
        
        error_analysis = {
            'spelling_errors': spelling_errors,
            'spelling_count': len(spelling_errors),
            'grammar_errors': grammar_errors,
            'grammar_count': len(grammar_errors),
            'formatting_issues': formatting_issues,
            'formatting_count': len(formatting_issues)
        }
        
        return Response({
            'original_text': original_text,
            'corrected_text': corrected_text,
            'error_analysis': error_analysis,
            'success': True
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
