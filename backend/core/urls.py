from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, ClassroomViewSet, AssignmentViewSet, 
    SubmissionViewSet, AnnouncementViewSet, MyTokenObtainPairView,
    NotificationViewSet, auto_fix_submission, download_corrected_file, auto_fix_file
)
from rest_framework_simplejwt.views import TokenRefreshView
from .file_analysis import analyze_file

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'classrooms', ClassroomViewSet)
router.register(r'assignments', AssignmentViewSet)
router.register(r'submissions', SubmissionViewSet)
router.register(r'announcements', AnnouncementViewSet)
router.register(r'notifications', NotificationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('analyze-file/', analyze_file, name='analyze-file'),
    path('auto-fix-submission/', auto_fix_submission, name='auto-fix-submission'),
    path('download-corrected-file/', download_corrected_file, name='download-corrected-file'),
    path('auto-fix-file/', auto_fix_file, name='auto-fix-file'),
]
