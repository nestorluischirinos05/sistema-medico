from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MedicoViewSet, PacienteViewSet, ConsultaViewSet, LoginView, obtener_diagnostico_por_consulta,  obtener_diagnosticos_por_paciente
from . import views
router = DefaultRouter()
router.register(r'medicos', MedicoViewSet)
router.register(r'pacientes', PacienteViewSet)
router.register(r'consultas', ConsultaViewSet)

# En urls.py
urlpatterns = [
    path('login/', views.LoginView.as_view(), name='login'),
    path('registro/', views.registro_usuario, name='registro'), # Registro público
    path('cambiar-contrasena/', views.cambiar_contrasena, name='cambiar_contrasena'),
    path('resetear-contrasena/', views.resetear_contrasena, name='resetear_contrasena'),
    
    # === Nuevos endpoints para administrador ===
    path('admin/usuarios/', views.crear_usuario_admin, name='crear_usuario_admin'),
    path('admin/roles/', views.listar_roles, name='listar_roles'),
    # =========================================

    path('especialidades/', views.EspecialidadListCreate.as_view()),
    path('historia-clinica/paciente/<int:paciente_id>/', views.historia_clinica_paciente_detalles),
    path('diagnosticos/', views.crear_diagnostico),
    path('diagnosticos/consulta/<int:consulta_id>/', views.obtener_diagnostico_por_consulta),
    path('diagnosticos/paciente/<int:paciente_id>/', views.obtener_diagnosticos_por_paciente),
    path('tratamientos/', views.crear_tratamiento),
    #path('paciente/citas/', views.crear_cita_paciente, name='crear_cita_paciente'),
    #path('paciente/medicos/', views.listar_medicos_para_paciente, name='listar_medicos_para_paciente'),

    path('paciente/citas/', views.crear_cita_paciente, name='crear_cita_paciente'),
    path('paciente/medicos/', views.listar_medicos_para_paciente, name='listar_medicos_para_paciente'),
    path('admin/citas/', views.crear_cita_admin, name='crear_cita_admin'),  # Para administradores
    path('', include(router.urls)),
]

