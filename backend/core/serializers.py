from rest_framework import serializers
from .models import User, Classroom, Enrollment, Assignment, Submission, AIReport, Announcement, Notification
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = user.role
        return token

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'avatar', 'password', 'first_name', 'last_name')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class ClassroomSerializer(serializers.ModelSerializer):
    faculty_name = serializers.ReadOnlyField(source='faculty.username')
    
    class Meta:
        model = Classroom
        fields = ('id', 'name', 'section', 'subject_code', 'class_code', 'faculty', 'faculty_name', 'created_at')
        extra_kwargs = {
            'faculty': {'read_only': True, 'required': False},
            'class_code': {'read_only': True, 'required': False}
        }

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'

class AssignmentSerializer(serializers.ModelSerializer):
    faculty_name = serializers.ReadOnlyField(source='classroom.faculty.username')
    classroom_name = serializers.ReadOnlyField(source='classroom.name')

    class Meta:
        model = Assignment
        fields = '__all__'
        extra_kwargs = {
            'classroom': {'read_only': True, 'required': False}
        }

class AIReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIReport
        fields = '__all__'

class SubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.username')
    ai_report = AIReportSerializer(read_only=True)

    class Meta:
        model = Submission
        fields = ('id', 'student_name', 'ai_report', 'assignment', 'student', 'file', 'status', 'submitted_at', 'grade', 'feedback_text')
        extra_kwargs = {
            'student': {'read_only': True, 'required': False}
        }

class AnnouncementSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Announcement
        fields = ('id', 'classroom', 'author', 'author_name', 'content', 'created_at')
        extra_kwargs = {
            'author': {'read_only': True, 'required': False},
            'classroom': {'read_only': True, 'required': False}
        }

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
