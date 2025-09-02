# consultorio/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('activo/', views.consultorio_activo, name='consultorio_activo'),
    path('guardar/', views.guardar_consultorio, name='guardar_consultorio'),
]