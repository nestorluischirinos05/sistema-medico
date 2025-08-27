# api/views.py
from rest_framework import viewsets, permissions, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListCreateAPIView
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.db import connection
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Medico, Paciente, Consulta, Especialidad, HistoriaClinica, Diagnostico, Tratamiento, Usuario, Rol,Cita,TipoExamen, AntecedenteMedico, Notificacion
from .serializers import (
    MedicoSerializer, 
    PacienteSerializer, 
    ConsultaSerializer, 
    EspecialidadSerializer, 
    HistoriaClinicaSerializer, 
    DiagnosticoSerializer, 
    TratamientoSerializer,
    RegistroSerializer,
    CitaSerializer, ExamenMedicoSerializer, ExamenMedico,TipoExamenSerializer, AntecedenteMedicoSerializer, NotificacionSerializer

)
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.conf import settings
from datetime import datetime
from django.contrib.auth.models import User

# === VISTAS DE AUTENTICACIÓN Y USUARIOS ===

# api/views.py
class LoginView(APIView):
    def post(self, request):
        correo = request.data.get('correo')
        password = request.data.get('password')  # ✅ Cambiado de 'contraseña' a 'password'

        # Autenticar con el campo 'password'
        user = authenticate(username=correo, password=password)
        
        if user:
            refresh = RefreshToken.for_user(user)
            # Inicializar medico_id como None
            medico_id = None
            if hasattr(user, 'medico'):  # Verifica si el usuario tiene perfil de médico
                medico_id = user.medico.id
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'nombre': user.nombre,
                'apellido': user.apellido,
                'is_staff': user.is_staff,
                'correo': user.correo,
                'rol': user.rol.nombre if user.rol else 'Sin rol',
                'rol_codigo': user.rol.codigo if user.rol else 'sin_rol',
                'medico_id': medico_id
                
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)

# api/views.py
@api_view(['POST'])
def registro_usuario(request):
    """
    Registra un usuario. Si el rol es 'paciente', busca un Paciente por DNI
    y lo asocia. Si no existe, lo crea.
    """
    # Datos para Usuario
    correo = request.data.get('correo')
    nombre = request.data.get('nombre')
    apellido = request.data.get('apellido')
    password = request.data.get('password')
    rol_codigo = request.data.get('rol_codigo', 'paciente')

    # Datos adicionales para paciente
    dni = request.data.get('dni', '').strip()
    fecha_nacimiento_str = request.data.get('fecha_nacimiento', None)
    telefono = request.data.get('telefono', '').strip()
    direccion = request.data.get('direccion', '').strip()

    # Validaciones básicas
    if not all([correo, nombre, apellido, password]):
        return Response({
            'error': 'Los campos correo, nombre, apellido y contraseña son obligatorios.'
        }, status=status.HTTP_400_BAD_REQUEST)

    correo = correo.strip().lower()
    if '@' not in correo:
        return Response({
            'error': 'El correo electrónico no es válido.'
        }, status=status.HTTP_400_BAD_REQUEST)

    if Usuario.objects.filter(correo=correo).exists():
        return Response({
            'error': 'Ya existe un usuario con este correo electrónico.'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Obtener rol
    try:
        rol = Rol.objects.get(codigo=rol_codigo)
    except Rol.DoesNotExist:
        return Response({
            'error': f'El rol "{rol_codigo}" no existe.'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Procesar fecha de nacimiento
    fecha_nacimiento = None
    if fecha_nacimiento_str:
        try:
            fecha_nacimiento = datetime.strptime(fecha_nacimiento_str.strip(), '%Y-%m-%d').date()
        except ValueError:
            return Response({
                'error': 'Formato de fecha de nacimiento inválido. Usa YYYY-MM-DD.'
            }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Crear el usuario
        user = Usuario.objects.create_user(
            correo=correo,
            nombre=nombre.strip(),
            apellido=apellido.strip(),
            password=password,
            rol=rol
        )

        paciente_creado = None

        # Lógica para pacientes
        if rol.codigo == 'paciente':
            if not dni:
                return Response({
                    'error': 'El DNI es obligatorio para pacientes.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Buscar paciente existente por DNI
            paciente = Paciente.objects.filter(dni=dni).first()

            if paciente:
                # Asociar el usuario al paciente existente
                if paciente.usuario:
                    return Response({
                        'error': f'El paciente con DNI {dni} ya tiene un usuario asociado.'
                    }, status=status.HTTP_400_BAD_REQUEST)

                paciente.usuario = user
                paciente.nombre = nombre.strip()
                paciente.apellido = apellido.strip()
                if fecha_nacimiento:
                    paciente.fecha_nacimiento = fecha_nacimiento
                if telefono:
                    paciente.telefono = telefono
                if direccion:
                    paciente.direccion = direccion
                paciente.save()
                paciente_creado = paciente
            else:
                # Crear nuevo paciente
                paciente_creado = Paciente.objects.create(
                    usuario=user,
                    nombre=nombre.strip(),
                    apellido=apellido.strip(),
                    dni=dni,
                    fecha_nacimiento=fecha_nacimiento,
                    telefono=telefono,
                    direccion=direccion
                )

        return Response({
            'message': 'Usuario registrado exitosamente.' + (
                ' Y perfil de paciente asociado/creado.' if paciente_creado else ''
            ),
            'user': {
                'id': user.id,
                'correo': user.correo,
                'nombre': user.nombre,
                'apellido': user.apellido,
                'rol': user.rol.nombre,
                'rol_codigo': user.rol.codigo
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({
            'error': f'Error interno al crear el usuario: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# === VISTAS PARA ADMINISTRADORES ===

@api_view(['GET'])
def listar_roles(request):
    """
    Vista para listar todos los roles disponibles.
    """
    try:
        roles = Rol.objects.all()
        # Si tienes un serializer para Rol, úsalo. Si no, puedes devolver los datos manualmente.
        # Asumiendo que tienes un RolSerializer:
        # serializer = RolSerializer(roles, many=True)
        # return Response(serializer.data)
        
        # O devolver datos manualmente:
        roles_data = [{'id': rol.id, 'nombre': rol.nombre, 'codigo': rol.codigo} for rol in roles]
        return Response(roles_data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def crear_usuario_admin(request):
    """
    Permite a un administrador crear un nuevo usuario.
    """
    correo = request.data.get('correo')
    nombre = request.data.get('nombre')
    apellido = request.data.get('apellido')
    password = request.data.get('password')
    rol_codigo = request.data.get('rol_codigo', 'paciente')

    if not all([correo, nombre, apellido, password]):
        return Response({'error': 'Todos los campos son obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)

    if Usuario.objects.filter(correo=correo).exists():
        return Response({'error': 'Ya existe un usuario con este correo electrónico.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        rol = Rol.objects.get(codigo=rol_codigo)
    except Rol.DoesNotExist:
        return Response({'error': f'El rol con código "{rol_codigo}" no existe.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = Usuario.objects.create_user(
            correo=correo,
            nombre=nombre,
            apellido=apellido,
            password=password,
            rol=rol
        )
        return Response({
            'message': 'Usuario creado exitosamente.',
            'usuario': {
                'id': user.id,
                'correo': user.correo,
                'nombre': user.nombre,
                'apellido': user.apellido,
                'rol': user.rol.nombre,
                'rol_codigo': user.rol.codigo
            }
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': f'Error al crear el usuario: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# === VIEWSETS PARA MODELOS ===

class EsAdminOPublico(permissions.BasePermission):
    """
    Permite acceso de lectura a todos, pero escritura solo a admin.
    """
    def has_permission(self, request, view):
        # Todos pueden leer (GET)
        if request.method in permissions.SAFE_METHODS:
            return True
        # Solo admin puede modificar (POST, PUT, DELETE)
        return request.user.is_authenticated and request.user.is_staff

class MedicoViewSet(viewsets.ModelViewSet):
    queryset = Medico.objects.select_related('especialidad').all()
    serializer_class = MedicoSerializer
    permission_classes = [EsAdminOPublico]  # GET para todos, POST/PUT/DELETE solo para admin

    # Opcional: Si quieres que solo los autenticados vean la lista, usa esto en su lugar:
    # permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        """
        Asegura que el contexto incluya la request para uso en el serializer.
        """
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    @action(detail=False, methods=['get'], url_path='disponibles')
    def disponibles(self, request):
        """
        Endpoint opcional: devuelve solo médicos activos o disponibles.
        """
        medicos = self.get_queryset()
        serializer = self.get_serializer(medicos, many=True)
        return Response(serializer.data)

class PacienteViewSet(viewsets.ModelViewSet):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer


class ConsultaViewSet(viewsets.ModelViewSet):
    queryset = Consulta.objects.select_related('paciente', 'medico').all()
    serializer_class = ConsultaSerializer


class EspecialidadListCreate(generics.ListCreateAPIView):
    queryset = Especialidad.objects.all()
    serializer_class = EspecialidadSerializer


# === VISTAS PARA HISTORIA CLÍNICA Y DIAGNÓSTICOS ===

@api_view(['GET'])
def historia_clinica_paciente(request, paciente_id):
    try:
        historia = HistoriaClinica.objects.get(paciente__id=paciente_id)
        serializer = HistoriaClinicaSerializer(historia)
        return Response(serializer.data)
    except HistoriaClinica.DoesNotExist:
        return Response(
            {"error": "Este paciente no tiene historia clínica."},
            status=404
        )


@api_view(['GET'])
def historia_clinica_paciente_detalles(request, paciente_id):
    """
    Obtiene la historia clínica con todas las consultas, diagnósticos y tratamientos usando SQL directo
    """
    try:
        with connection.cursor() as cursor:
            # Ejecutamos la consulta SQL incluyendo tratamientos Y SUS INDICACIONES
            cursor.execute("""
                SELECT 
                    pa.id as paciente_id,
                    pa.nombre as paciente_nombre,
                    pa.apellido as paciente_apellido,
                    pa.dni as paciente_dni,
                    pa.fecha_nacimiento as paciente_fecha_nacimiento,
                    pa.telefono as paciente_telefono,
                    pa.direccion as paciente_direccion,
                    hc.id as historia_id,
                    hc.fecha_inicio as historia_fecha_inicio,
                    hc.observaciones as historia_observaciones,
                    con.id as consulta_id,
                    con.fecha as consulta_fecha,
                    con.motivo as consulta_motivo,
                    med.id as medico_id,
                    med.nombre as medico_nombre,
                    med.apellido as medico_apellido,
                    med.dni as medico_dni,
                    med.telefono as medico_telefono,
                    med.especialidad_id as medico_especialidad,
                    diag.id as diagnostico_id,
                    diag.descripcion as diagnostico_descripcion,
                    diag.fecha as diagnostico_fecha,
                    trat.id as tratamiento_id,
                    trat.descripcion as tratamiento_descripcion,
                    trat.indicaciones as tratamiento_indicaciones,  -- ¡Campo que faltaba!
                    trat.duracion_dias as tratamiento_duracion_dias,
                    trat.fecha_inicio as tratamiento_fecha_inicio
                FROM public.api_paciente as pa 
                LEFT JOIN public.api_historiaclinica as hc ON pa.id = hc.paciente_id
                INNER JOIN public.api_consulta as con ON pa.id = con.paciente_id
                INNER JOIN public.api_medico as med ON con.medico_id = med.id
                LEFT JOIN public.api_diagnostico as diag ON con.id = diag.consulta_id
                LEFT JOIN public.api_tratamiento as trat ON diag.id = trat.diagnostico_id
                WHERE pa.id = %s
                ORDER BY con.fecha DESC, diag.fecha DESC, trat.fecha_inicio DESC
            """, [paciente_id])
            
            rows = cursor.fetchall()
            
            if not rows:
                return Response({"error": "Este paciente no tiene historia clínica."}, status=404)
            
            # Procesamos los resultados
            paciente_data = None
            consultas_dict = {}
            diagnosticos_dict = {}  # Para rastrear diagnósticos y sus tratamientos
            
            for row in rows:
                # Datos del paciente (solo del primer registro)
                if paciente_data is None:
                    paciente_data = {
                        'id': row[0],
                        'nombre': row[1] if row[1] else '',
                        'apellido': row[2] if row[2] else '',
                        'dni': row[3] if row[3] else '',
                        'fecha_nacimiento': row[4],
                        'telefono': row[5] if row[5] else '',
                        'direccion': row[6] if row[6] else ''
                    }
                
                # Datos de la historia clínica
                historia_data = {
                    'id': row[7],
                    'fecha_inicio': row[8],
                    'observaciones': row[9] if row[9] else ''
                }
                
                # Verificar que la consulta exista
                if row[10] is None:
                    continue
                    
                # Datos de la consulta
                consulta_id = row[10]
                if consulta_id not in consultas_dict:
                    consultas_dict[consulta_id] = {
                        'id': consulta_id,
                        'paciente': paciente_id,
                        'medico': row[13],
                        'fecha': row[11],
                        'motivo': row[12] if row[12] else '',
                        'paciente_detalle': paciente_data,
                        'medico_detalle': {
                            'id': row[13],
                            'nombre': row[14] if row[14] else '',
                            'apellido': row[15] if row[15] else '',
                            'dni': row[16] if row[16] else '',
                            'telefono': row[17] if row[17] else '',
                            'especialidad': row[18]
                        },
                        'diagnosticos': []
                    }
                
                # Agregar diagnóstico si existe
                if row[19] is not None:  # diagnostico_id existe
                    diagnostico_id = row[19]
                    diagnostico_key = f"{consulta_id}_{diagnostico_id}"
                    
                    # Verificar si el diagnóstico ya existe en esta consulta
                    diagnostico_exists = any(
                        d['id'] == diagnostico_id 
                        for d in consultas_dict[consulta_id]['diagnosticos']
                    )
                    
                    if not diagnostico_exists:
                        diagnosticos_dict[diagnostico_key] = {
                            'id': diagnostico_id,
                            'descripcion': row[20] if row[20] else '',
                            'fecha': row[21],
                            'tratamientos': []
                        }
                        consultas_dict[consulta_id]['diagnosticos'].append(diagnosticos_dict[diagnostico_key])
                    
                    # Agregar tratamiento si existe
                    if row[22] is not None:  # tratamiento_id existe
                        tratamiento = {
                            'id': row[22],
                            'descripcion': row[23] if row[23] else '',  # tratamiento_descripcion
                            'indicaciones': row[24] if row[24] else '', # tratamiento_indicaciones (¡Campo que faltaba!)
                            'duracion_dias': row[25],  # tratamiento_duracion_dias
                            'fecha_inicio': row[26]     # tratamiento_fecha_inicio
                        }
                        
                        # Verificar que el diagnóstico exista en el diccionario
                        if diagnostico_key in diagnosticos_dict:
                            # Evitar duplicados de tratamientos
                            tratamiento_exists = any(
                                t['id'] == tratamiento['id'] 
                                for t in diagnosticos_dict[diagnostico_key]['tratamientos']
                            )
                            if not tratamiento_exists:
                                diagnosticos_dict[diagnostico_key]['tratamientos'].append(tratamiento)
            
            # Construir la respuesta final
            response_data = {
                'id': historia_data['id'],
                'fecha_inicio': historia_data['fecha_inicio'],
                'observaciones': historia_data['observaciones'],
                'paciente_detalle': paciente_data,
                'consultas': list(consultas_dict.values())
            }
            
            return Response(response_data)
            
    except Exception as e:
        return Response({"error": f"Error al procesar la solicitud: {str(e)}"}, status=500)


@api_view(['POST'])
def crear_diagnostico(request):
    serializer = DiagnosticoSerializer(data=request.data)
    if serializer.is_valid():
        diagnostico = serializer.save()
        # Devuelve el diagnóstico creado con sus relaciones
        serializer_response = DiagnosticoSerializer(diagnostico)
        return Response(serializer_response.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['GET'])
def obtener_diagnostico_por_consulta(request, consulta_id):
    """Obtener diagnóstico por ID de consulta"""
    try:
        diagnostico = Diagnostico.objects.get(consulta_id=consulta_id)
        serializer = DiagnosticoSerializer(diagnostico)
        return Response(serializer.data)
    except Diagnostico.DoesNotExist:
        return Response({"error": "Diagnóstico no encontrado"}, status=404)


@api_view(['GET'])
def obtener_diagnosticos_por_paciente(request, paciente_id):
    """Obtener todos los diagnósticos de un paciente"""
    try:
        diagnosticos = Diagnostico.objects.filter(
            consulta__paciente_id=paciente_id
        ).select_related('consulta')
        serializer = DiagnosticoSerializer(diagnosticos, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({"error": f"Error al obtener diagnósticos: {str(e)}"}, status=500)


# === VISTAS PARA TRATAMIENTOS ===

@api_view(['POST'])
def crear_tratamiento(request):
    try:
        serializer = TratamientoSerializer(data=request.data)
        if serializer.is_valid():
            tratamiento = serializer.save()
            # Devuelve el tratamiento creado con sus relaciones
            serializer_response = TratamientoSerializer(tratamiento)
            return Response(serializer_response.data, status=201)
        return Response(serializer.errors, status=400)
    except Exception as e:
        return Response({"error": f"Error al crear tratamiento: {str(e)}"}, status=500)


# === VISTAS PARA CAMBIO DE CONTRASEÑA ===

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cambiar_contrasena(request):
    """
    Permite a los usuarios cambiar su contraseña
    """
    usuario = request.user
    contrasena_actual = request.data.get('contrasena_actual')
    nueva_contrasena = request.data.get('nueva_contrasena')
    confirmar_contrasena = request.data.get('confirmar_contrasena')
    
    # Validar datos
    if not all([contrasena_actual, nueva_contrasena, confirmar_contrasena]):
        return Response({
            'error': 'Todos los campos son requeridos'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Verificar contraseña actual
    if not usuario.check_password(contrasena_actual):
        return Response({
            'error': 'La contraseña actual es incorrecta'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Verificar que las nuevas contraseñas coincidan
    if nueva_contrasena != confirmar_contrasena:
        return Response({
            'error': 'Las nuevas contraseñas no coinciden'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Verificar longitud mínima
    if len(nueva_contrasena) < 6:
        return Response({
            'error': 'La nueva contraseña debe tener al menos 6 caracteres'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Actualizar contraseña
    usuario.set_password(nueva_contrasena)
    usuario.save()
    
    return Response({
        'message': 'Contraseña actualizada correctamente'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resetear_contrasena(request):
    """
    Permite al administrador resetear la contraseña de cualquier usuario
    """
    # Verificar si el usuario es administrador
    if not request.user.is_staff:
        return Response({
            'error': 'No tienes permiso para realizar esta acción'
        }, status=status.HTTP_403_FORBIDDEN)
    
    usuario_id = request.data.get('usuario_id')
    nueva_contrasena = request.data.get('nueva_contrasena')
    
    if not usuario_id or not nueva_contrasena:
        return Response({
            'error': 'ID de usuario y nueva contraseña son requeridos'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        usuario = Usuario.objects.get(id=usuario_id)
        usuario.set_password(nueva_contrasena)
        usuario.save()
        
        return Response({
            'message': f'Contraseña de {usuario.nombre} {usuario.apellido} actualizada correctamente'
        }, status=status.HTTP_200_OK)
    except Usuario.DoesNotExist:
        return Response({
            'error': 'Usuario no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
# === VISTAS PARA CITAS ===

# Primero, asegúrate de importar el modelo Cita si lo creaste
# from .models import Cita  # Descomenta esta línea si tienes el modelo Cita
# from .serializers import CitaSerializer  # Descomenta si tienes el serializer

# Si aún no tienes el modelo Cita, aquí está la definición básica:
# Agrega esto a tu models.py:
"""
class Cita(models.Model):
    ESTADO_CHOICES = [
        ('solicitada', 'Solicitada'),
        ('confirmada', 'Confirmada'),
        ('cancelada', 'Cancelada'),
        ('completada', 'Completada'),
    ]

    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='citas')
    medico = models.ForeignKey(Medico, on_delete=models.CASCADE, related_name='citas')
    fecha_hora_propuesta = models.DateTimeField()
    motivo = models.TextField(blank=True, null=True)
    estado = models.CharField(max_length=15, choices=ESTADO_CHOICES, default='solicitada')
    fecha_solicitud = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cita: {self.paciente.nombre} {self.paciente.apellido} con Dr. {self.medico.nombre} {self.medico.apellido} el {self.fecha_hora_propuesta}"

    class Meta:
        verbose_name = "Cita"
        verbose_name_plural = "Citas"
        ordering = ['fecha_hora_propuesta']
"""

# Y el serializer básico en serializers.py:
"""
class CitaSerializer(serializers.ModelSerializer):
    paciente_detalle = PacienteSerializer(source='paciente', read_only=True)
    medico_detalle = MedicoSerializer(source='medico', read_only=True)
    
    class Meta:
        model = Cita
        fields = '__all__'
        read_only_fields = ('paciente', 'estado', 'fecha_solicitud')
"""

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_cita_paciente(request):
    """
    Permite a un paciente autenticado crear una nueva cita.
    """
    # Verificar si ya tienes el modelo Cita importado
    try:
        from .models import Cita
        from .serializers import CitaSerializer
    except ImportError:
        return Response({'error': 'Modelo de Cita no encontrado. Debe ser creado primero.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    user = request.user
    try:
        paciente = Paciente.objects.get(usuario=user)
    except Paciente.DoesNotExist:
        return Response({'error': 'Solo los pacientes pueden solicitar citas.'}, status=status.HTTP_403_FORBIDDEN)

    # Obtener datos de la solicitud
    medico_id = request.data.get('medico')
    fecha_hora_str = request.data.get('fecha_hora_propuesta')
    motivo = request.data.get('motivo', '')

    if not all([medico_id, fecha_hora_str]):
        return Response({'error': 'Los campos médico y fecha_hora_propuesta son obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        medico = Medico.objects.get(id=medico_id)
    except Medico.DoesNotExist:
        return Response({'error': 'Médico no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    try:
        from datetime import datetime
        # Asumimos que la fecha_hora_str viene en formato ISO 8601 o similar
        # Manejar diferentes formatos de fecha
        if isinstance(fecha_hora_str, str):
            # Intentar varios formatos comunes
            formatos = ['%Y-%m-%dT%H:%M:%S', '%Y-%m-%dT%H:%M:%S.%f', '%Y-%m-%d %H:%M:%S', '%Y-%m-%d']
            fecha_hora_propuesta = None
            
            for formato in formatos:
                try:
                    fecha_hora_propuesta = datetime.strptime(fecha_hora_str, formato)
                    break
                except ValueError:
                    continue
                    
            if fecha_hora_propuesta is None:
                # Si no coincide con ninguno, intentar parsear como ISO
                try:
                    fecha_hora_propuesta = datetime.fromisoformat(fecha_hora_str.replace('Z', '+00:00'))
                except:
                    return Response({'error': 'Formato de fecha/hora inválido.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Formato de fecha/hora inválido.'}, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({'error': f'Error al procesar la fecha: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    # Opcional: Validar que la fecha no sea en el pasado
    from django.utils import timezone
    if fecha_hora_propuesta < timezone.now():
        return Response({'error': 'La fecha de la cita no puede ser en el pasado.'}, status=status.HTTP_400_BAD_REQUEST)

    # Crear la cita
    try:
        cita = Cita.objects.create(
            paciente=paciente,
            medico=medico,
            fecha_hora_propuesta=fecha_hora_propuesta,
            motivo=motivo,
            estado='solicitada'  # Estado inicial
        )

        # Serializar y devolver la cita creada
        serializer = CitaSerializer(cita)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': f'Error al crear la cita: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_medicos_para_paciente(request):
    """
    Devuelve la lista de médicos disponibles para que el paciente pueda elegir.
    """
    try:
        medicos = Medico.objects.select_related('especialidad').all()
        serializer = MedicoSerializer(medicos, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': f'Error al obtener médicos: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Si también quieres permitir que administradores creen citas para pacientes:
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_cita_admin(request):
    """
    Permite a un administrador crear una cita para cualquier paciente y médico.
    """
    # Verificar si el usuario es administrador
    if not request.user.is_staff:
        return Response({'error': 'Solo administradores pueden usar esta función.'}, status=status.HTTP_403_FORBIDDEN)
        
    # Verificar si ya tienes el modelo Cita importado
    try:
        from .models import Cita
        from .serializers import CitaSerializer
    except ImportError:
        return Response({'error': 'Modelo de Cita no encontrado. Debe ser creado primero.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Obtener datos de la solicitud
    paciente_id = request.data.get('paciente')
    medico_id = request.data.get('medico')
    fecha_hora_str = request.data.get('fecha_hora_propuesta')
    motivo = request.data.get('motivo', '')

    if not all([paciente_id, medico_id, fecha_hora_str]):
        return Response({'error': 'Los campos paciente, médico y fecha_hora_propuesta son obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        paciente = Paciente.objects.get(id=paciente_id)
        medico = Medico.objects.get(id=medico_id)
    except Paciente.DoesNotExist:
        return Response({'error': 'Paciente no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
    except Medico.DoesNotExist:
        return Response({'error': 'Médico no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    try:
        from datetime import datetime
        # Asumimos que la fecha_hora_str viene en formato ISO 8601 o similar
        # Manejar diferentes formatos de fecha
        if isinstance(fecha_hora_str, str):
            # Intentar varios formatos comunes
            formatos = ['%Y-%m-%dT%H:%M:%S', '%Y-%m-%dT%H:%M:%S.%f', '%Y-%m-%d %H:%M:%S', '%Y-%m-%d']
            fecha_hora_propuesta = None
            
            for formato in formatos:
                try:
                    fecha_hora_propuesta = datetime.strptime(fecha_hora_str, formato)
                    break
                except ValueError:
                    continue
                    
            if fecha_hora_propuesta is None:
                # Si no coincide con ninguno, intentar parsear como ISO
                try:
                    fecha_hora_propuesta = datetime.fromisoformat(fecha_hora_str.replace('Z', '+00:00'))
                except:
                    return Response({'error': 'Formato de fecha/hora inválido.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Formato de fecha/hora inválido.'}, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({'error': f'Error al procesar la fecha: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    # Opcional: Validar que la fecha no sea en el pasado
    from django.utils import timezone
    if fecha_hora_propuesta < timezone.now():
        return Response({'error': 'La fecha de la cita no puede ser en el pasado.'}, status=status.HTTP_400_BAD_REQUEST)

    # Crear la cita
    try:
        cita = Cita.objects.create(
            paciente=paciente,
            medico=medico,
            fecha_hora_propuesta=fecha_hora_propuesta,
            motivo=motivo,
            estado='solicitada'  # Estado inicial por defecto, puede ser confirmada directamente por admin
        )

        # Serializar y devolver la cita creada
        serializer = CitaSerializer(cita)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': f'Error al crear la cita: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ExamenMedicoListCreate(generics.ListCreateAPIView):
    queryset = ExamenMedico.objects.all().select_related(
        'paciente', 'medico', 'tipo_examen', 'diagnostico_relacionado'
    )
    serializer_class = ExamenMedicoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Asignar médico desde el usuario autenticado
        try:
            medico = self.request.user.medico  # Asume que el usuario logueado es médico
            serializer.save(medico=medico)
        except Medico.DoesNotExist:
            raise serializers.ValidationError("El usuario no tiene un perfil de médico asociado.")

class ExamenMedicoDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = ExamenMedico.objects.all()
    serializer_class = ExamenMedicoSerializer
    permission_classes = [IsAuthenticated]

class ExamenesPorPaciente(generics.ListAPIView):
    serializer_class = ExamenMedicoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        paciente_id = self.kwargs['paciente_id']
        return ExamenMedico.objects.filter(paciente_id=paciente_id).order_by('-fecha_solicitud')

# Vista para descargar archivos
def descargar_archivo_examen(request, examen_id):
    examen = get_object_or_404(ExamenMedico, id=examen_id)
    if not examen.archivo_resultado:
        return Response({'error': 'No hay archivo para descargar'}, status=404)
    
    file_path = examen.archivo_resultado.path
    with open(file_path, 'rb') as fh:
        response = HttpResponse(fh.read(), content_type="application/octet-stream")
        response['Content-Disposition'] = f'attachment; filename={os.path.basename(file_path)}'
        return response

# DESPUÉS ✅
class TipoExamenListCreate(generics.ListCreateAPIView):
    queryset = TipoExamen.objects.all()
    serializer_class = TipoExamenSerializer
    permission_classes = [IsAuthenticated]  # O [IsAdminUser] si solo admins pueden crear

class DiagnosticoList(generics.ListCreateAPIView):
    queryset = Diagnostico.objects.all()
    serializer_class = DiagnosticoSerializer

@api_view(['GET'])
def buscar_paciente_por_dni(request):
    dni = request.query_params.get('dni', '').strip()
    if not dni:
        return Response({'error': 'El DNI es requerido.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        paciente = Paciente.objects.get(dni=dni)
        return Response({
            'id': paciente.id,
            'nombre': paciente.nombre,
            'apellido': paciente.apellido,
            'fecha_nacimiento': paciente.fecha_nacimiento,
            'telefono': paciente.telefono,
            'direccion': paciente.direccion,
            'existe': True
        })
    except Paciente.DoesNotExist:
        return Response({'existe': False})
    
@api_view(['GET'])
def buscar_medico_por_dni(request):
    dni = request.query_params.get('dni', '').strip()
    if not dni:
        return Response({'error': 'El DNI es requerido.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        medico = Medico.objects.get(dni=dni)
        return Response({
            'existe': True,
            'nombre_completo': f"{medico.nombre} {medico.apellido}"
        })
    except Medico.DoesNotExist:
        return Response({'existe': False})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_citas_por_medico(request):
    """
    Devuelve las citas del médico autenticado.
    Si el usuario es admin, puede ver todas las citas o filtrar por médico.
    Filtros opcionales: fecha_inicio, fecha_fin, medico_id (solo para admin)
    """
    # Variables para filtrar
    fecha_inicio_str = request.query_params.get('fecha_inicio', None)
    fecha_fin_str = request.query_params.get('fecha_fin', None)
    medico_id = request.query_params.get('medico_id', None)

    # Inicializar el queryset
    citas = Cita.objects.all().select_related('paciente', 'medico')

    # Lógica según el tipo de usuario
    if request.user.is_staff:
        # Admin: puede ver todas las citas
        if medico_id:
            try:
                medico_id = int(medico_id)
                citas = citas.filter(medico_id=medico_id)
            except (ValueError, TypeError):
                return Response(
                    {'error': 'El parámetro medico_id debe ser un número válido.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
    else:
        # Médico regular: solo ve sus citas
        try:
            medico = request.user.medico
            citas = citas.filter(medico=medico)
        except Medico.DoesNotExist:
            return Response(
                {'error': 'El usuario no tiene un perfil de médico asociado.'},
                status=status.HTTP_403_FORBIDDEN
            )

    # Aplicar filtros de fecha
    if fecha_inicio_str:
        try:
            fecha_inicio = datetime.fromisoformat(fecha_inicio_str)
            citas = citas.filter(fecha_hora_propuesta__gte=fecha_inicio)
        except ValueError:
            return Response(
                {'error': 'Formato de fecha_inicio inválido. Usa ISO 8601 (ej: 2025-08-01T08:00:00).'},
                status=status.HTTP_400_BAD_REQUEST
            )

    if fecha_fin_str:
        try:
            fecha_fin = datetime.fromisoformat(fecha_fin_str)
            citas = citas.filter(fecha_hora_propuesta__lte=fecha_fin)
        except ValueError:
            return Response(
                {'error': 'Formato de fecha_fin inválido. Usa ISO 8601 (ej: 2025-08-31T18:00:00).'},
                status=status.HTTP_400_BAD_REQUEST
            )

    # Ordenar por fecha
    citas = citas.order_by('fecha_hora_propuesta')

    # Serializar manualmente para FullCalendar
    eventos = []
    for cita in citas:
        eventos.append({
            'id': cita.id,
            'title': f"{cita.paciente.nombre} {cita.paciente.apellido}",
            'start': cita.fecha_hora_propuesta.isoformat(),
            'end': cita.fecha_hora_propuesta.isoformat(),  # Puedes ajustar duración si lo deseas
            'extendedProps': {
                'motivo': cita.motivo or 'Sin motivo',
                'estado': cita.estado,
                'paciente_id': cita.paciente.id,
                'paciente_nombre': f"{cita.paciente.nombre} {cita.paciente.apellido}",
                'medico_id': cita.medico.id,
                'medico_nombre': f"{cita.medico.nombre} {cita.medico.apellido}",
            },
            'backgroundColor': (
                '#4CAF50' if cita.estado == 'confirmada' else
                '#FF9800' if cita.estado == 'solicitada' else
                '#F44336' if cita.estado == 'cancelada' else
                '#9E9E9E'
            ),
            'borderColor': '#000',
            'textColor': '#fff',
        })

    return Response(eventos, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_citas_por_paciente(request):
    """
    Devuelve las citas del paciente autenticado.
    """
    try:
        paciente = request.user.paciente
    except Paciente.DoesNotExist:
        return Response(
            {'error': 'El usuario no tiene un perfil de paciente asociado.'},
            status=status.HTTP_403_FORBIDDEN
        )

    citas = Cita.objects.filter(paciente=paciente).select_related('medico').order_by('fecha_hora_propuesta')

    eventos = []
    for cita in citas:
        eventos.append({
            'id': cita.id,
            'title': f"Dr. {cita.medico.nombre} {cita.medico.apellido}",
            'start': cita.fecha_hora_propuesta.isoformat(),
            'end': (cita.fecha_hora_propuesta).isoformat(),
            'extendedProps': {
                'motivo': cita.motivo,
                'estado': cita.estado,
                'medico_id': cita.medico.id,
            },
            'backgroundColor': (
                '#4CAF50' if cita.estado == 'confirmada' else
                '#FF9800' if cita.estado == 'solicitada' else
                '#F44336' if cita.estado == 'cancelada' else
                '#9E9E9E'
            ),
            'borderColor': '#000'
        })

    return Response(eventos, status=status.HTTP_200_OK)

class CitaListCreate(ListCreateAPIView):
    queryset = Cita.objects.all().select_related('paciente', 'medico')
    serializer_class = CitaSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # El paciente y médico ya vienen en los datos
        # Puedes agregar lógica adicional si lo necesitas
        serializer.save()

from .models import Cita

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_todas_citas(request):
    """
    Solo para admins: devuelve todas las citas del sistema.
    """
    if not request.user.is_staff:
        return Response({'error': 'No tienes permiso para ver esta información.'}, status=403)

    citas = Cita.objects.all().select_related('paciente', 'medico')
    eventos = []
    for cita in citas:
        eventos.append({
            'id': cita.id,
            'title': f"{cita.paciente.nombre} {cita.paciente.apellido}",
            'start': cita.fecha_hora_propuesta.isoformat(),
            'end': cita.fecha_hora_propuesta.isoformat(),
            'extendedProps': {
                'motivo': cita.motivo,
                'estado': cita.estado,
                'paciente_id': cita.paciente.id,
                'medico_id': cita.medico.id,
                'medico_nombre': f"{cita.medico.nombre} {cita.medico.apellido}",
            },
            'backgroundColor': (
                '#4CAF50' if cita.estado == 'confirmada' else
                '#FF9800' if cita.estado == 'solicitada' else
                '#F44336' if cita.estado == 'cancelada' else
                '#9E9E9E'
            ),
            'borderColor': '#000',
        })
    return Response(eventos, status=200)

class AntecedenteMedicoDetail(generics.RetrieveUpdateAPIView):
    """
    Obtener o actualizar los antecedentes médicos de un paciente.
    Solo accesible para médicos o admin.
    """
    queryset = AntecedenteMedico.objects.all()
    serializer_class = AntecedenteMedicoSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Obtiene los antecedentes del paciente especificado en la URL
        paciente_id = self.kwargs['paciente_id']
        antecedente, created = AntecedenteMedico.objects.get_or_create(
            paciente_id=paciente_id
        )
        return antecedente

# api/views.py
class CitaViewSet(viewsets.ModelViewSet):
    queryset = Cita.objects.all()
    serializer_class = CitaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Cita.objects.all()
        elif hasattr(user, 'medico'):
            return Cita.objects.filter(medico=user.medico)
        elif hasattr(user, 'paciente'):
            return Cita.objects.filter(paciente=user.paciente)
        return Cita.objects.none()

    @action(detail=True, methods=['delete'], url_path='eliminar')
    def eliminar(self, request, pk=None):
        cita = self.get_object()
        user = request.user
        if not (user.is_staff or (hasattr(user, 'medico') and user.medico == cita.medico)):
            return Response({'error': 'Permiso denegado'}, status=403)
        cita.delete()
        return Response({'message': 'Cita eliminada.'})
    
# api/views.py
@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def gestionar_cita(request, cita_id):
    try:
        cita = Cita.objects.get(id=cita_id)
    except Cita.DoesNotExist:
        return Response({'error': 'Cita no encontrada.'}, status=404)

    user = request.user
    puede_editar = False
    puede_eliminar = False

    if user.is_staff:
        puede_editar = puede_eliminar = True
    elif hasattr(user, 'medico') and user.medico == cita.medico:
        puede_editar = puede_eliminar = True
    elif hasattr(user, 'paciente') and user.paciente == cita.paciente:
        puede_editar = True  # El paciente puede editar (motivo, estado)
        puede_eliminar = False  # Pero no eliminar

    # === DELETE ===
    if request.method == 'DELETE':
        if not puede_eliminar:
            return Response({'error': 'No tienes permiso para eliminar esta cita.'}, status=403)
        cita.delete()
        return Response({'message': 'Cita eliminada correctamente.'}, status=200)

    # === PUT ===
    if request.method == 'PUT':
        if not puede_editar:
            return Response({'error': 'No tienes permiso para editar esta cita.'}, status=403)

        serializer = CitaSerializer(cita, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_notificacion(request):
    """
    Crea una notificación para un usuario.
    Usado internamente por el sistema.
    """
    data = request.data.copy()
    # Solo admin o sistema puede asignar a otro usuario
    if not request.user.is_staff:
        data['usuario'] = request.user.id

    serializer = NotificacionSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mis_notificaciones(request):
    notificaciones = Notificacion.objects.filter(usuario=request.user).order_by('-fecha')
    serializer = NotificacionSerializer(notificaciones, many=True)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def marcar_notificacion_leida(request, notificacion_id):
    """
    Marca una notificación como leída
    """
    try:
        notificacion = Notificacion.objects.get(id=notificacion_id, usuario=request.user)
    except Notificacion.DoesNotExist:
        return Response({'error': 'Notificación no encontrada'}, status=404)

    notificacion.leida = True
    notificacion.save()
    return Response({'message': 'Notificación marcada como leída'})