# api/management/commands/inicializar.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Rol

User = get_user_model()

class Command(BaseCommand):
    help = 'Crea roles iniciales y superusuario'

    def handle(self, *args, **options):
        # === 1. Crear roles si no existen ===
        roles = [
            {'codigo': 'admin', 'nombre': 'Administrador'},
            {'codigo': 'medico', 'nombre': 'Médico'},
            {'codigo': 'paciente', 'nombre': 'Paciente'},
        ]

        for rol_data in roles:
            rol, created = Rol.objects.get_or_create(
                codigo=rol_data['codigo'],
                defaults={'nombre': rol_data['nombre']}
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"✅ Rol '{rol.nombre}' creado")
                )
            else:
                self.stdout.write(
                    self.style.NOTICE(f"ℹ️ Rol '{rol.nombre}' ya existe")
                )

        # === 2. Crear superusuario con rol 'admin' ===
        admin_email = 'admin@clinica.com'
        admin_password = '16672947Ne.*'  # Cambia esto en producción

        try:
            admin_rol = Rol.objects.get(codigo='admin')
        except Rol.DoesNotExist:
            self.stdout.write(
                self.style.ERROR("❌ No se encontró el rol 'admin'")
            )
            return

        if not User.objects.filter(correo=admin_email).exists():
            User.objects.create_superuser(
                correo=admin_email,
                nombre='Admin',
                apellido='Sistema',
                password=admin_password,
                rol=admin_rol  # Asignar el rol
            )
            self.stdout.write(
                self.style.SUCCESS("✅ Superusuario creado y asignado al rol 'admin'")
            )
            self.stdout.write(f"📧 Email: {admin_email}")
            self.stdout.write(f"🔑 Contraseña: {admin_password} (cámbiala en producción)")
        else:
            self.stdout.write(
                self.style.NOTICE("ℹ️ Superusuario ya existe")
            )