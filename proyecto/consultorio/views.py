# consultorio/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from .models import Consultorio
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

@api_view(['GET'])
def consultorio_activo(request):
    """Devuelve el consultorio activo"""
    try:
        consultorio = Consultorio.objects.get(activo=True)
        return Response({
            'id': consultorio.id,
            'nombre': consultorio.nombre,
            'rif': consultorio.rif,
            'direccion': consultorio.direccion,
            'correo': consultorio.correo,
            'telefono': consultorio.telefono,
            'logo': consultorio.logo.url if consultorio.logo else None,
            'activo': consultorio.activo
        })
    except Consultorio.DoesNotExist:
        raise Http404("No hay un consultorio configurado")

@api_view(['POST'])
def guardar_consultorio(request):
    """Crea o actualiza el consultorio activo"""
    try:
        # Si existe, actualiza; si no, crea
        consultorio, created = Consultorio.objects.get_or_create(
            id=1,  # Solo un registro principal
            defaults={'nombre': 'Nuevo Consultorio'}
        )

        consultorio.nombre = request.data.get('nombre', consultorio.nombre)
        consultorio.rif = request.data.get('rif', consultorio.rif)
        consultorio.direccion = request.data.get('direccion', consultorio.direccion)
        consultorio.correo = request.data.get('correo', consultorio.correo)
        consultorio.telefono = request.data.get('telefono', consultorio.telefono)

        # Manejar logo
        if 'logo' in request.FILES:
            logo = request.FILES['logo']
            # Eliminar logo anterior si existe
            if consultorio.logo and default_storage.exists(consultorio.logo.path):
                default_storage.delete(consultorio.logo.path)
            # Guardar nuevo logo
            consultorio.logo.save(logo.name, ContentFile(logo.read()))

        consultorio.activo = True
        consultorio.save()

        return Response({'message': 'Consultorio guardado'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)