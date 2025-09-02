# consultorio/models.py
from django.db import models

class Consultorio(models.Model):
    nombre = models.CharField(
        max_length=100,
        verbose_name="Nombre o Razón Social",
        help_text="Nombre comercial o razón social del consultorio"
    )
    rif = models.CharField(
        max_length=20,
        unique=True,
        verbose_name="RIF",
        help_text="Ej: J-12345678-9"
    )
    direccion = models.TextField(
        verbose_name="Dirección",
        blank=True,
        null=True
    )
    correo = models.EmailField(
        verbose_name="Correo Electrónico",
        blank=True,
        null=True
    )
    telefono = models.CharField(
        max_length=20,
        verbose_name="Teléfono",
        blank=True,
        null=True
    )
    logo = models.ImageField(
        upload_to='logos/',
        verbose_name="Logo",
        blank=True,
        null=True,
        help_text="Logo del consultorio (opcional)"
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(
        default=True,
        help_text="Indica si este consultorio es el activo para el sistema"
    )

    class Meta:
        verbose_name = "Consultorio"
        verbose_name_plural = "Consultorios"
        # Asegura que solo haya un consultorio activo (opcional)
        # Puedes gestionar múltiples, pero uno marcado como "activo"

    def __str__(self):
        return self.nombre

    def save(self, *args, **kwargs):
        # Si este consultorio se marca como activo, desactiva los demás
        if self.activo:
            Consultorio.objects.filter(activo=True).exclude(pk=self.pk).update(activo=False)
        super().save(*args, **kwargs)