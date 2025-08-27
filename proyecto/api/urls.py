from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MedicoViewSet, PacienteViewSet, ConsultaViewSet, LoginView, obtener_diagnostico_por_consulta,  obtener_diagnosticos_por_paciente,ExamenMedicoDetail, ExamenMedicoListCreate, ExamenesPorPaciente, descargar_archivo_examen, TipoExamenListCreate, DiagnosticoList, buscar_paciente_por_dni, obtener_citas_por_medico, obtener_citas_por_paciente, CitaListCreate, listar_todas_citas, AntecedenteMedicoDetail
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
    #path('diagnosticos/', views.crear_diagnostico),
    path('diagnosticos/consulta/<int:consulta_id>/', views.obtener_diagnostico_por_consulta),
    path('diagnosticos/paciente/<int:paciente_id>/', views.obtener_diagnosticos_por_paciente),
    path('tratamientos/', views.crear_tratamiento),
    #path('paciente/citas/', views.crear_cita_paciente, name='crear_cita_paciente'),
    #path('paciente/medicos/', views.listar_medicos_para_paciente, name='listar_medicos_para_paciente'),

    path('paciente/citas/', views.crear_cita_paciente, name='crear_cita_paciente'),
    path('paciente/medicos/', views.listar_medicos_para_paciente, name='listar_medicos_para_paciente'),
    path('admin/citas/', views.crear_cita_admin, name='crear_cita_admin'),  # Para administradores
    path('', include(router.urls)),

    path('examenes/', views.ExamenMedicoListCreate.as_view(), name='examenes-list-create'),
    # DESPUÉS
    path('tipo-examenes/', views.TipoExamenListCreate.as_view(), name='tipo-examenes-list-create'),
    path('examenes/<int:pk>/', views.ExamenMedicoDetail.as_view(), name='examen-detail'),
    path('paciente/<int:paciente_id>/examenes/', views.ExamenesPorPaciente.as_view(), name='examenes-por-paciente'),
    path('examenes/<int:examen_id>/descargar/', views.descargar_archivo_examen, name='descargar-examen'),
    path('diagnosticos/', views.DiagnosticoList.as_view(), name='diagnosticos-list'),
    # api/urls.py
    path('buscar-paciente/', views.buscar_paciente_por_dni, name='buscar_paciente_por_dni'), 
    # api/urls.py
    path('buscar-medico/', views.buscar_medico_por_dni, name='buscar_medico_por_dni'), 
    # api/urls.py
    path('citas/', views.CitaListCreate.as_view(), name='citas-list-create'),
    path('citas/medico/', views.obtener_citas_por_medico, name='citas_por_medico'),
    path('citas/paciente/', views.obtener_citas_por_paciente, name='citas_por_paciente'),
    # api/urls.py
    path('citas/todas/', views.listar_todas_citas, name='listar_todas_citas'),
    path('antecedentes/<int:paciente_id>/', views.AntecedenteMedicoDetail.as_view(), name='antecedentes-detail'),
    # api/urls.py
    path('citas/<int:cita_id>/', views.gestionar_cita, name='gestionar_cita'),
    # api/urls.py
    path('notificaciones/', views.crear_notificacion, name='crear_notificacion'),
    path('mis-notificaciones/', views.mis_notificaciones, name='mis_notificaciones'),
]
urlpatterns += router.urls
