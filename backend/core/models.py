from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('faculty', 'Faculty'),
        ('student', 'Student'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

class Classroom(models.Model):
    name = models.CharField(max_length=255)
    section = models.CharField(max_length=100)
    subject_code = models.CharField(max_length=50)
    class_code = models.CharField(max_length=10, unique=True)
    faculty = models.ForeignKey(User, on_delete=models.CASCADE, related_name='led_classrooms')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Enrollment(models.Model):
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='enrollments')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrolled_classrooms')
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('classroom', 'student')

class Assignment(models.Model):
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=255)
    description = models.TextField()
    due_date = models.DateTimeField()
    points = models.IntegerField(default=100)
    formatting_instructions = models.TextField(blank=True, null=True, help_text="Specific formatting rules (e.g., Font size 12, Times New Roman, Double spacing).")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Submission(models.Model):
    STATUS_CHOICES = (
        ('submitted', 'Submitted'),
        ('reviewed', 'Reviewed'),
        ('graded', 'Graded'),
    )
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    file = models.FileField(upload_to='submissions/')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    submitted_at = models.DateTimeField(auto_now_add=True)
    grade = models.FloatField(null=True, blank=True)
    feedback_text = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.student.username} - {self.assignment.title}"

class AIReport(models.Model):
    submission = models.OneToOneField(Submission, on_delete=models.CASCADE, related_name='ai_report')
    spelling_errors = models.JSONField(default=list)
    detailed_spelling_errors = models.JSONField(default=list, help_text='Detailed spelling errors with location and context')
    grammar_errors = models.JSONField(default=list)
    clarity_suggestions = models.JSONField(default=list)
    similarity_score = models.FloatField(default=0.0)
    matched_text = models.TextField(null=True, blank=True)
    readability_score = models.FloatField(default=0.0)
    feedback_summary = models.TextField(null=True, blank=True)
    formatting_analysis = models.JSONField(default=dict, help_text="AI Analysis of formatting compliance")
    suggested_grade = models.IntegerField(null=True, blank=True)
    analyzed_at = models.DateTimeField(auto_now_add=True)

class Announcement(models.Model):
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='announcements')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    link = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.title}"
