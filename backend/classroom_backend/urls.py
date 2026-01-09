from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from core.views import api_root

urlpatterns = [
    path('', api_root, name='index'),
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
