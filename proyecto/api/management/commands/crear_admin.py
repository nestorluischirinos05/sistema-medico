# api/management/commands/crear_admin.py
from django.core.management.base import BaseCommand
from api.models import Usuario

class Command(BaseCommand):
    help = 'Crea un usuario administrador'

    def handle(self, *args, **options):
        if not Usuario.objects.filter(correo='admin@hospital.com').exists():
            admin_user = Usuario.objects.create_superuser(
                correo='admin@hospital.com',
                nombre='Administrador',
                apellido='Sistema',
                password='admin123'
            )
            self.stdout.write(
                self.style.SUCCESS(f'Usuario administrador creado: {admin_user.correo}')
            )
        else:
            self.stdout.write(
                self.style.WARNING('El usuario administrador ya existe')
            )