# api/management/commands/cargar_especialidades.py
from django.core.management.base import BaseCommand
from api.models import Especialidad

class Command(BaseCommand):
    help = 'Carga especialidades médicas iniciales'

    def handle(self, *args, **options):
        especialidades = [
            {
                "nombre": "Alergología",
                "descripcion": "Se enfoca en el diagnóstico y tratamiento de alergias, asma y trastornos del sistema inmunológico."
            },
            {
                "nombre": "Anestesiología",
                "descripcion": "Se dedica al manejo del dolor y el cuidado de los pacientes antes, durante y después de la cirugía."
            },
            {
                "nombre": "Cardiología",
                "descripcion": "Se especializa en el diagnóstico y tratamiento de enfermedades del corazón y del sistema circulatorio."
            },
            {
                "nombre": "Cirugía General",
                "descripcion": "Realiza operaciones para tratar una amplia gama de afecciones, desde apendicitis hasta tumores."
            },
            {
                "nombre": "Dermatología",
                "descripcion": "Se ocupa del diagnóstico y tratamiento de enfermedades de la piel, cabello y uñas."
            },
            {
                "nombre": "Endocrinología",
                "descripcion": "Estudia las glándulas y hormonas, tratando condiciones como la diabetes y los trastornos de la tiroides."
            },
            {
                "nombre": "Gastroenterología",
                "descripcion": "Se especializa en el sistema digestivo, tratando enfermedades del esófago, estómago, intestinos, hígado y páncreas."
            },
            {
                "nombre": "Geriatría",
                "descripcion": "Se dedica a la atención de la salud de las personas mayores, abordando las enfermedades y necesidades específicas de esta población."
            },
            {
                "nombre": "Ginecología y Obstetricia",
                "descripcion": "Se enfoca en la salud de la mujer, incluyendo el embarazo, el parto y las enfermedades del sistema reproductor femenino."
            },
            {
                "nombre": "Hematología",
                "descripcion": "Se especializa en el diagnóstico y tratamiento de enfermedades de la sangre, como la anemia y la leucemia."
            },
            {
                "nombre": "Infectología",
                "descripcion": "Trata enfermedades causadas por virus, bacterias, hongos y parásitos."
            },
            {
                "nombre": "Medicina Interna",
                "descripcion": "Se ocupa del diagnóstico y tratamiento de enfermedades de los órganos internos en adultos."
            },
            {
                "nombre": "Nefrología",
                "descripcion": "Se especializa en el diagnóstico y tratamiento de enfermedades de los riñones."
            },
            {
                "nombre": "Neurología",
                "descripcion": "Se enfoca en el sistema nervioso, tratando trastornos del cerebro, la médula espinal y los nervios."
            },
            {
                "nombre": "Oftalmología",
                "descripcion": "Se especializa en el cuidado de los ojos y la visión."
            },
            {
                "nombre": "Oncología",
                "descripcion": "Se dedica al diagnóstico, tratamiento e investigación del cáncer."
            },
            {
                "nombre": "Otorrinolaringología",
                "descripcion": "Trata enfermedades del oído, la nariz y la garganta."
            },
            {
                "nombre": "Patología",
                "descripcion": "Analiza muestras de tejidos y fluidos corporales para diagnosticar enfermedades."
            },
            {
                "nombre": "Pediatría",
                "descripcion": "Se enfoca en la salud y el bienestar de los niños, desde el nacimiento hasta la adolescencia."
            },
            {
                "nombre": "Psiquiatría",
                "descripcion": "Se especializa en el diagnóstico, tratamiento y prevención de los trastornos mentales."
            },
            {
                "nombre": "Reumatología",
                "descripcion": "Se ocupa de las enfermedades que afectan las articulaciones, los músculos y los huesos."
            },
            {
                "nombre": "Urología",
                "descripcion": "Trata enfermedades del tracto urinario en hombres y mujeres, así como del sistema reproductor masculino."
            }
        ]

        for esp in especialidades:
            obj, created = Especialidad.objects.get_or_create(
                nombre=esp["nombre"],
                defaults={"descripcion": esp["descripcion"]}
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"✅ {esp['nombre']} creada")
                )
            else:
                self.stdout.write(
                    self.style.NOTICE(f"ℹ️ {esp['nombre']} ya existe")
                )

        self.stdout.write(
            self.style.SUCCESS("✅ Todas las especialidades han sido cargadas.")
        )