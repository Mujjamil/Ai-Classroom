import os
import django
import random
import string
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'classroom_backend.settings')
django.setup()

from core.models import User, Classroom, Enrollment, Assignment, Submission, Announcement

def seed_data():
    print("Seeding data...")
    
    # Create Faculty
    faculty, _ = User.objects.get_or_create(
        username='prof_smith',
        email='smith@university.edu',
        role='faculty'
    )
    faculty.set_password('password123')
    faculty.save()

    # Create Students
    student1, _ = User.objects.get_or_create(
        username='alice_student',
        email='alice@student.com',
        role='student'
    )
    student1.set_password('password123')
    student1.save()

    student2, _ = User.objects.get_or_create(
        username='bob_learner',
        email='bob@student.com',
        role='student'
    )
    student2.set_password('password123')
    student2.save()

    # Create Classroom
    classroom, _ = Classroom.objects.get_or_create(
        name='Advanced NLP 101',
        section='Section A',
        subject_code='CS402',
        faculty=faculty,
        class_code='NLP999'
    )

    # Enroll Students
    Enrollment.objects.get_or_create(classroom=classroom, student=student1)
    Enrollment.objects.get_or_create(classroom=classroom, student=student2)

    # Create Assignment
    assignment, _ = Assignment.objects.get_or_create(
        classroom=classroom,
        title='Essays on Transformers',
        description='Write a 500-word essay on the impact of attention mechanisms in NLP.',
        due_date=datetime.now() + timedelta(days=7),
        points=100
    )

    # Create Announcement
    Announcement.objects.get_or_create(
        classroom=classroom,
        author=faculty,
        content="Welcome to the NLP course! Please check the first assignment."
    )

    print("Seeding complete!")
    print(f"Faculty: prof_smith / password123")
    print(f"Student: alice_student / password123")
    print(f"Class Code: {classroom.class_code}")

if __name__ == '__main__':
    seed_data()
