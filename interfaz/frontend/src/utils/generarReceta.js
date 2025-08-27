// utils/generarReceta.js
import { formatearFecha } from './formatoFecha'; // O pásalo como parámetro

const generarReceta = (tratamiento, diagnosticoDescripcion, medicoNombre, fechaConsulta, pacienteNombre = 'Paciente') => {
  const printWindow = window.open('', '_blank');
  const fechaEmision = formatearFecha(new Date().toISOString());

  const contenido = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receta Médica</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @media print {
            @page {
              margin: 0.5in;
            }
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
            line-height: 1.4;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #1976d2;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .header h1 {
            color: #1976d2;
            margin: 0 0 5px 0;
            font-size: 24px;
          }
          .header h2 {
            color: #2e7d32;
            margin: 0 0 10px 0;
            font-size: 20px;
          }
          .header p {
            margin: 3px 0;
            font-size: 14px;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-weight: bold;
            color: #1976d2;
            font-size: 18px;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #ddd;
          }
          .content {
            background-color: #f9f9f9;
            border-left: 4px solid #1976d2;
            padding: 15px;
            margin: 10px 0;
            border-radius: 0 4px 4px 0;
          }
          .content.indicaciones {
            border-left-color: #2e7d32;
            background-color: #f0f7ff;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            margin: 15px 0;
          }
          .info-item {
            background-color: #e3f2fd;
            padding: 10px;
            border-radius: 4px;
            font-size: 14px;
          }
          .info-item strong {
            color: #1976d2;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-style: italic;
            color: #666;
          }
          pre {
            white-space: pre-wrap;
            font-family: inherit;
            margin: 0;
          }
          @media screen {
            body {
              max-width: none;
            }
          }
          @media print {
            body {
              margin: 0;
              padding: 15px;
            }
          }
          @media (max-width: 600px) {
            body {
              padding: 10px;
            }
            .header h1 {
              font-size: 20px;
            }
            .header h2 {
              font-size: 18px;
            }
            .info-grid {
              grid-template-columns: 1fr;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RECETA MÉDICA</h1>
          <h2>HOSPITAL CENTRAL</h2>
          <p>Av. Principal 123, Ciudad Salud</p>
          <p>Tel: (0212) 555-1234 | Email: info@hospitalcentral.com</p>
        </div>
        
        <div class="info-grid">
          <div class="info-item">
            <strong>Paciente:</strong> ${pacienteNombre}
          </div>
          <div class="info-item">
            <strong>Fecha Emisión:</strong> ${fechaEmision}
          </div>
          <div class="info-item">
            <strong>Médico:</strong> Dr. ${medicoNombre}
          </div>
          <div class="info-item">
            <strong>Fecha Consulta:</strong> ${formatearFecha(fechaConsulta)}
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">DIAGNÓSTICO</div>
          <div class="content">
            <pre>${diagnosticoDescripcion}</pre>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">TRATAMIENTO</div>
          <div class="content">
            <pre>${tratamiento.descripcion || 'No especificado'}</pre>
          </div>
        </div>
        
        ${tratamiento.indicaciones ? `
        <div class="section">
          <div class="section-title">INDICACIONES</div>
          <div class="content indicaciones">
            <pre>${tratamiento.indicaciones}</pre>
          </div>
        </div>
        ` : ''}
        
        ${(tratamiento.duracion_dias || tratamiento.fecha_inicio) ? `
        <div class="section">
          <div class="section-title">DETALLES DEL TRATAMIENTO</div>
          <div class="info-grid">
            ${tratamiento.fecha_inicio ? `
            <div class="info-item">
              <strong>Inicio del tratamiento:</strong> ${formatearFecha(tratamiento.fecha_inicio)}
            </div>
            ` : ''}
            ${tratamiento.duracion_dias ? `
            <div class="info-item">
              <strong>Duración:</strong> ${tratamiento.duracion_dias} días
            </div>
            ` : ''}
          </div>
        </div>
        ` : ''}
        
        <div class="footer">
          <p>______________________________________________________</p>
          <p>Firma y Sello del Médico</p>
          <div class="important-note">
            <p>Esta receta es válida por 10 días a partir de la fecha de emisión.</p>
            <p>Presente esta receta en cualquier farmacia autorizada.</p>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(contenido);
  printWindow.document.close();
};

export default generarReceta;