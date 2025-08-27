from datetime import date
from rest_framework import serializers
from .models import *

class EspecialidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Especialidad
        fields = '__all__'
        
class MedicoSerializer(serializers.ModelSerializer):
    especialidad = EspecialidadSerializer(read_only=True)  # Incluye los datos completos de la especialidad

    class Meta:
        model = Medico
        fields = '__all__'

    especialidad_id = serializers.PrimaryKeyRelatedField(
        queryset=Especialidad.objects.all(),
        source='especialidad',
        write_only=True)

class PacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = '__all__'

class TratamientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tratamiento
        fields = ['id', 'diagnostico', 'descripcion', 'indicaciones', 'duracion_dias', 'fecha_inicio']

    def validate_fecha_inicio(self, value):
        if isinstance(value, str):
            try:
                return date.fromisoformat(value)
            except ValueError:
                raise serializers.ValidationError("Formato de fecha inválido para 'fecha_inicio'. Usa YYYY-MM-DD.")
        return value

class DiagnosticoSerializer(serializers.ModelSerializer):
    tratamiento = TratamientoSerializer(many=True, read_only=True)

    class Meta:
        model = Diagnostico
        fields = ['id', 'consulta', 'descripcion', 'fecha', 'tratamiento']

    def validate_fecha(self, value):
        if isinstance(value, str):
            try:
                return date.fromisoformat(value)  # Solo YYYY-MM-DD
            except ValueError:
                raise serializers.ValidationError("Formato de fecha inválido. Usa YYYY-MM-DD.")
        return value

class ConsultaSerializer(serializers.ModelSerializer):
    diagnosticos = DiagnosticoSerializer(many=True, read_only=True, source='diagnostico_set')
    paciente_detalle = PacienteSerializer(source='paciente', read_only=True)
    medico_detalle = MedicoSerializer(source='medico', read_only=True)

    class Meta:
        model = Consulta
        fields = [
            'id', 'paciente', 'medico', 'fecha', 'motivo',
            'paciente_detalle', 'medico_detalle', 'diagnosticos'
        ]

    def validate_fecha(self, value):
        """
        Asegura que el valor sea un objeto `date`, no `datetime`.
        Si es string, se convierte correctamente.
        """
        if isinstance(value, str):
            try:
                # Convierte string ISO a date
                return date.fromisoformat(value)
            except ValueError:
                raise serializers.ValidationError("Formato de fecha inválido. Usa YYYY-MM-DD.")
        if not isinstance(value, date):
            raise serializers.ValidationError("La fecha debe ser una fecha válida.")
        return value

    def create(self, validated_data):
        paciente = validated_data['paciente']

        # Crear historia clínica si no existe
        HistoriaClinica.objects.get_or_create(
            paciente=paciente,
            defaults={'observaciones': 'Historia clínica creada automáticamente.'}
        )

        # Crear consulta
        return Consulta.objects.create(**validated_data)
    
    def create(self, validated_data):
        paciente = validated_data['paciente']

        # 🔍 Paso 1: Verificar si el paciente tiene historia clínica
        HistoriaClinica.objects.get_or_create(
            paciente=paciente,
            defaults={'observaciones': 'Historia clínica creada automáticamente.'}
        )

        # 🔁 Paso 2: Crear la consulta
        consulta = Consulta.objects.create(**validated_data)
        return consulta



class HistoriaClinicaSerializer(serializers.ModelSerializer):
    paciente_detalle = PacienteSerializer(source='paciente', read_only=True)
    consultas = ConsultaSerializer(source='paciente.consulta_set', many=True, read_only=True)

    class Meta:
        model = HistoriaClinica
        fields = ['id', 'fecha_inicio', 'observaciones', 'paciente_detalle', 'consultas']

# serializers.py - agrega este serializer
class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    rol_codigo = serializers.CharField(write_only=True, required=False)  # Recibir código de rol
    
    class Meta:
        model = Usuario
        fields = ['correo', 'nombre', 'apellido', 'password', 'password_confirm', 'rol_codigo']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        rol_codigo = validated_data.pop('rol_codigo', 'paciente')  # Rol predeterminado: paciente
        
        # Obtener el rol
        try:
            rol = Rol.objects.get(codigo=rol_codigo)
        except Rol.DoesNotExist:
            rol = Rol.objects.get(codigo='paciente')  # Fallback a paciente si no existe el rol
        
        password = validated_data.pop('password')
        user = Usuario.objects.create(rol=rol, **validated_data)
        user.set_password(password)
        user.save()
        return user

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = '__all__' # o especifica los campos que necesitas, como ['id', 'nombre', 'codigo']

class CitaSerializer(serializers.ModelSerializer):
    paciente_detalle = PacienteSerializer(source='paciente', read_only=True)
    medico_detalle = MedicoSerializer(source='medico', read_only=True)

    class Meta:
        model = Cita
        fields = '__all__'
        read_only_fields = ('fecha_solicitud',)  # Solo esto es inmutable

    def update(self, instance, validated_data):
        # Permitimos actualización de todos los campos permitidos por la vista
        return super().update(instance, validated_data)

class TipoExamenSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoExamen
        fields = '__all__'

class ExamenMedicoSerializer(serializers.ModelSerializer):
    paciente = PacienteSerializer(read_only=True)
    paciente_id = serializers.PrimaryKeyRelatedField(
        queryset=Paciente.objects.all(),
        source='paciente',
        write_only=True
    )
    medico = MedicoSerializer(read_only=True)
    medico_id = serializers.PrimaryKeyRelatedField(
        queryset=Medico.objects.all(),
        source='medico',
        write_only=True,
        required=False
    )
    tipo_examen = TipoExamenSerializer(read_only=True)
    tipo_examen_id = serializers.PrimaryKeyRelatedField(
        queryset=TipoExamen.objects.all(),
        source='tipo_examen',
        write_only=True
    )
    diagnostico_relacionado = DiagnosticoSerializer(read_only=True)
    diagnostico_relacionado_id = serializers.PrimaryKeyRelatedField(
        queryset=Diagnostico.objects.all(),
        source='diagnostico_relacionado',
        write_only=True,
        required=False,
        allow_null=True
    )

    # Campo para mostrar la URL del archivo
    archivo_resultado_url = serializers.SerializerMethodField()

    class Meta:
        model = ExamenMedico
        fields = [
            'id', 'paciente', 'paciente_id', 'medico', 'medico_id',
            'tipo_examen', 'tipo_examen_id', 'diagnostico_relacionado',
            'diagnostico_relacionado_id', 'fecha_solicitud', 'fecha_realizacion',
            'fecha_resultado', 'estado', 'observaciones', 'interpretacion_medica',
            'archivo_resultado', 'archivo_resultado_url'
        ]

    def get_archivo_resultado_url(self, obj):
        if obj.archivo_resultado:
            return obj.archivo_resultado.url
        return None

class AntecedenteMedicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AntecedenteMedico
        fields = '__all__'
        read_only_fields = ('paciente', 'fecha_registro')

class NotificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificacion
        fields = ['id', 'tipo', 'titulo', 'mensaje', 'leida', 'fecha', 'metadata']
        read_only_fields = ['id', 'fecha']