from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class UsuarioManager(BaseUserManager):
    def create_user(self, correo, nombre, apellido, password=None, **extra_fields):
        if not correo:
            raise ValueError('El usuario debe tener un correo electrónico')
        correo = self.normalize_email(correo)
        user = self.model(correo=correo, nombre=nombre, apellido=apellido, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, correo, nombre, apellido, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(correo, nombre, apellido, password, **extra_fields)


class Usuario(AbstractBaseUser, PermissionsMixin):
    correo = models.EmailField(unique=True)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    rol = models.ForeignKey('Rol', on_delete=models.SET_NULL, null=True, blank=True)  # Relación con Rol

    objects = UsuarioManager()

    USERNAME_FIELD = 'correo'
    REQUIRED_FIELDS = ['nombre', 'apellido']

    def __str__(self):
        return f"{self.nombre} {self.apellido} ({self.correo})"


class Rol(models.Model):
    nombre = models.CharField(max_length=50)
    codigo = models.CharField(max_length=20, unique=True, default='sin_codigo')  # Agregar default

    def __str__(self):
        return self.nombre


class Especialidad(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)  # ✅ Nuevo campo

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Especialidad"
        verbose_name_plural = "Especialidades"


class Medico(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    dni = models.CharField(max_length=20, unique=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    especialidad = models.ForeignKey(Especialidad, on_delete=models.CASCADE)


class Paciente(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.SET_NULL, null=True, blank=True)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    dni = models.CharField(max_length=20, unique=True)
    fecha_nacimiento = models.DateField()
    telefono = models.CharField(max_length=20, blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    usuario = models.OneToOneField(Usuario, on_delete=models.SET_NULL, null=True, blank=True)  # Relación con Usuario


class HistoriaClinica(models.Model):
    paciente = models.OneToOneField(Paciente, on_delete=models.CASCADE)
    fecha_inicio = models.DateField(auto_now_add=True)  # Se pone sola al crear
    observaciones = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"HC - {self.paciente.nombre} {self.paciente.apellido}"

class Consulta(models.Model):
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE)
    medico = models.ForeignKey(Medico, on_delete=models.CASCADE)
    fecha = models.DateField()
    motivo = models.TextField()

# En models.py
class Diagnostico(models.Model):
    consulta = models.ForeignKey(Consulta, on_delete=models.CASCADE, related_name='diagnosticos')
    descripcion = models.TextField()
    fecha = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Diagnóstico - {self.consulta.paciente.nombre}"

class Tratamiento(models.Model):
    diagnostico = models.ForeignKey(Diagnostico, on_delete=models.CASCADE)
    descripcion = models.TextField()  # Esto será el tratamiento (ej: "Acetaminofén")
    indicaciones = models.TextField(blank=True, null=True)  # Esto serán las indicaciones (ej: "Cada 8 horas por 5 días")
    duracion_dias = models.IntegerField(blank=True, null=True)
    fecha_inicio = models.DateField()
    
    def __str__(self):
        return f"Tratamiento - {self.descripcion}"

class Cita(models.Model):
    """
    Modelo para representar una cita solicitada por un paciente con un médico.
    """
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
    # Opcional: Puedes agregar campos para fecha de confirmación, notas del médico, etc.

    def __str__(self):
        return f"Cita: {self.paciente.nombre} {self.paciente.apellido} con Dr. {self.medico.nombre} {self.medico.apellido} el {self.fecha_hora_propuesta}"

    class Meta:
        verbose_name = "Cita"
        verbose_name_plural = "Citas"
        ordering = ['fecha_hora_propuesta']

class TipoExamen(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Tipo de Examen"
        verbose_name_plural = "Tipos de Examen"

class ExamenMedico(models.Model):
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='examenes')
    medico = models.ForeignKey(Medico, on_delete=models.CASCADE, related_name='examenes_solicitados')
    tipo_examen = models.ForeignKey(TipoExamen, on_delete=models.CASCADE)
    diagnostico_relacionado = models.ForeignKey(Diagnostico, on_delete=models.SET_NULL, null=True, blank=True)
    
    fecha_solicitud = models.DateTimeField(auto_now_add=True)
    fecha_realizacion = models.DateField(null=True, blank=True)
    fecha_resultado = models.DateField(null=True, blank=True)
    
    estado = models.CharField(
        max_length=20,
        choices=[
            ('solicitado', 'Solicitado'),
            ('en_proceso', 'En Proceso'),
            ('completado', 'Completado'),
            ('cancelado', 'Cancelado')
        ],
        default='solicitado'
    )
    
    observaciones = models.TextField(blank=True, null=True)
    interpretacion_medica = models.TextField(blank=True, null=True)  # Análisis del médico
    archivo_resultado = models.FileField(upload_to='examenes/', null=True, blank=True)  # PDF, JPG, etc.
    
    def __str__(self):
        return f"{self.tipo_examen.nombre} - {self.paciente.nombre} {self.paciente.apellido}"

    class Meta:
        verbose_name = "Examen Médico"
        verbose_name_plural = "Exámenes Médicos"
        ordering = ['-fecha_solicitud']

class AntecedenteMedico(models.Model):
    paciente = models.OneToOneField(Paciente, on_delete=models.CASCADE, related_name='antecedentes')
    
    # Antecedentes patológicos (enfermedades crónicas)
    enfermedades_cronicas = models.TextField(blank=True, null=True, help_text="Diabetes, hipertensión, asma, etc.")
    
    # Antecedentes quirúrgicos
    cirugias_previas = models.TextField(blank=True, null=True, help_text="Apéndice, cesárea, etc.")
    
    # Alergias
    alergias = models.TextField(blank=True, null=True, help_text="Medicamentos, alimentos, etc.")
    
    # Medicamentos actuales
    medicamentos_actuales = models.TextField(blank=True, null=True, help_text="Medicamentos que toma actualmente")
    
    # Antecedentes familiares
    antecedentes_familiares = models.TextField(blank=True, null=True, help_text="Enfermedades en familiares directos")
    
    # Hábitos
    fuma = models.BooleanField(default=False)
    paquetes_por_dia = models.CharField(max_length=10, blank=True, null=True)
    alcohol = models.CharField(max_length=20, choices=[
        ('nunca', 'Nunca'),
        ('ocasional', 'Ocasional'),
        ('frecuente', 'Frecuente')
    ], default='nunca')
    ejercicio = models.CharField(max_length=50, blank=True, null=True, help_text="Frecuencia y tipo de ejercicio")
    dieta = models.CharField(max_length=100, blank=True, null=True, help_text="Dieta habitual")

    # Fecha de registro
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Antecedentes - {self.paciente.nombre} {self.paciente.apellido}"

    class Meta:
        verbose_name = "Antecedente Médico"
        verbose_name_plural = "Antecedentes Médicos"

# api/models.py

class Notificacion(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=20)  # 'cita', 'diagnostico', 'tratamiento'
    titulo = models.CharField(max_length=100)
    mensaje = models.TextField()
    leida = models.BooleanField(default=False)
    metadata = models.JSONField(null=True, blank=True)  # Para guardar cita_id, etc.
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.titulo} - {self.usuario.nombre}"

    class Meta:
        ordering = ['-fecha']
        verbose_name = "Notificación"
        verbose_name_plural = "Notificaciones"