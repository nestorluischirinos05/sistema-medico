from rest_framework import serializers
from .models import *

class MedicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medico
        fields = '__all__'

class PacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = '__all__'

class TratamientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tratamiento
        fields = ['id', 'diagnostico', 'descripcion', 'indicaciones', 'duracion_dias', 'fecha_inicio']

class DiagnosticoSerializer(serializers.ModelSerializer):
    tratamiento = TratamientoSerializer(many=True, read_only=True)  # Un diagnóstico puede tener varios tratamientos

    class Meta:
        model = Diagnostico
        fields = ['id', 'consulta', 'descripcion', 'fecha', 'tratamiento']

class ConsultaSerializer(serializers.ModelSerializer):
    # Cambia esta línea:
    diagnosticos = DiagnosticoSerializer(many=True, read_only=True, source='diagnostico_set')
    paciente_detalle = PacienteSerializer(source='paciente', read_only=True)
    medico_detalle = MedicoSerializer(source='medico', read_only=True)

    class Meta:
        model = Consulta
        fields = [
            'id', 'paciente', 'medico', 'fecha', 'motivo',
            'paciente_detalle', 'medico_detalle', 'diagnosticos'  # Cambia 'diagnostico' por 'diagnosticos'
        ]

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

class EspecialidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Especialidad
        fields = '__all__'

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
    # Opcional: Incluir detalles del paciente y médico en la respuesta
    paciente_detalle = PacienteSerializer(source='paciente', read_only=True)
    medico_detalle = MedicoSerializer(source='medico', read_only=True)
    
    class Meta:
        model = Cita
        fields = '__all__' # O especifica los campos que quieres exponer
        read_only_fields = ('paciente', 'estado', 'fecha_solicitud') # El paciente se asigna automáticamente, estado y fecha_solicitud también

    def create(self, validated_data):
        # El paciente se asignará en la vista basada en el usuario autenticado
        # El estado se establece por defecto a 'solicitada'
        return super().create(validated_data)
