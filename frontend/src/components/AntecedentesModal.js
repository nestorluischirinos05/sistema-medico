// components/AntecedentesModal.js
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  TextField,
  Box,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';

const AntecedentesModal = ({
  open,
  onClose,
  antecedentes,
  setAntecedentes,
  handleSubmit,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleAntecedentesChange = (e) => {
    setAntecedentes({ ...antecedentes, [e.target.name]: e.target.value });
  };

  // Función genérica para alternar elementos en una lista separada por comas
  const toggleItem = (listName, item) => {
    const currentList = antecedentes[listName]?.split(', ').filter(Boolean) || [];
    const newList = currentList.includes(item)
      ? currentList.filter(i => i !== item)
      : [...currentList, item];

    setAntecedentes({
      ...antecedentes,
      [listName]: [...new Set(newList)].join(', ')
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: isMobile ? 0 : 3,
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        }
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: '#1976d2',
          color: 'white',
          fontWeight: 600,
          fontSize: isMobile ? '1.25rem' : '1.5rem',
          py: 2,
          textAlign: 'center',
        }}
      >
        📝 Editar Antecedentes Médicos
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Grid container spacing={2} xs={12}>
          {/* Enfermedades crónicas */}
          <Grid item xs={12}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                mb: 1,
                fontSize: '1rem'
              }}
            >
              🏥 Enfermedades Crónicas
            </Typography>
            <Box
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                p: 2,
                backgroundColor: '#f8f9ff',
                maxHeight: 200,
                overflowY: 'auto',
                '&::-webkit-scrollbar': { width: 6 },
                '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
                '&::-webkit-scrollbar-thumb': { background: '#c0c0c0', borderRadius: 3 },
              }}
            >
              {[
                'Diabetes',
                'Hipertensión',
                'Asma',
                'EPOC',
                'Insuficiencia cardíaca',
                'Enfermedad renal',
                'Cáncer',
                'Artritis',
                'Alzheimer',
                'Parkinson',
              ].map((enfermedad) => {
                const checked = antecedentes.enfermedades_cronicas?.split(', ').includes(enfermedad);
                return (
                  <Chip
                    key={enfermedad}
                    label={enfermedad}
                    clickable
                    color={checked ? 'primary' : 'default'}
                    variant={checked ? 'filled' : 'outlined'}
                    onClick={() => toggleItem('enfermedades_cronicas', enfermedad)}
                    sx={{
                      m: 0.5,
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      height: 32,
                      transition: 'all 0.2s ease',
                    }}
                  />
                );
              })}
            </Box>
            <TextField
              fullWidth
              multiline
              rows={2}
              name="enfermedades_cronicas"
              label="Otras enfermedades"
              value={antecedentes.enfermedades_cronicas}
              onChange={handleAntecedentesChange}
              variant="outlined"
              placeholder="Ej: Lupus, epilepsia, etc."
              sx={{ mt: 2 }}
              InputProps={{ sx: { fontSize: '0.9rem' } }}
              InputLabelProps={{ sx: { fontSize: '0.9rem' } }}
            />
          </Grid>

          {/* Cirugías previas */}
          <Grid item xs={12}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                mb: 1,
                fontSize: '1rem'
              }}
            >
              🔪 Cirugías Previas
            </Typography>
            <Box
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                p: 2,
                backgroundColor: '#f8f9ff',
                maxHeight: 180,
                overflowY: 'auto',
                '&::-webkit-scrollbar': { width: 6 },
                '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
                '&::-webkit-scrollbar-thumb': { background: '#c0c0c0', borderRadius: 3 },
              }}
            >
              {[
                'Apéndice',
                'Cesárea',
                'Colecistectomía',
                'Hernia',
                'Rodilla',
                'Cadera',
                'Corazón',
                'Cataratas',
                'Mama',
                'Columna',
              ].map((cirugia) => {
                const checked = antecedentes.cirugias_previas?.split(', ').includes(cirugia);
                return (
                  <Chip
                    key={cirugia}
                    label={cirugia}
                    clickable
                    color={checked ? 'primary' : 'default'}
                    variant={checked ? 'filled' : 'outlined'}
                    onClick={() => toggleItem('cirugias_previas', cirugia)}
                    sx={{
                      m: 0.5,
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      height: 32,
                      transition: 'all 0.2s ease',
                    }}
                  />
                );
              })}
            </Box>
            <TextField
              fullWidth
              multiline
              rows={2}
              name="cirugias_previas"
              label="Otras cirugías"
              value={antecedentes.cirugias_previas}
              onChange={handleAntecedentesChange}
              variant="outlined"
              placeholder="Ej: By-pass, tiroidectomía, etc."
              sx={{ mt: 2 }}
              InputProps={{ sx: { fontSize: '0.9rem' } }}
              InputLabelProps={{ sx: { fontSize: '0.9rem' } }}
            />
          </Grid>

          {/* Alergias */}
          <Grid item xs={12}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                mb: 1,
                fontSize: '1rem'
              }}
            >
              🤧 Alergias
            </Typography>
            <Box
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                p: 2,
                backgroundColor: '#f8f9ff',
                maxHeight: 180,
                overflowY: 'auto',
                '&::-webkit-scrollbar': { width: 6 },
                '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
                '&::-webkit-scrollbar-thumb': { background: '#c0c0c0', borderRadius: 3 },
              }}
            >
              {[
                'Penicilina',
                'Amoxicilina',
                'Aspirina',
                'Ibuprofeno',
                'Mariscos',
                'Peanuts',
                'Huevo',
                'Leche',
                'Polen',
                'Ácaros',
              ].map((alergia) => {
                const checked = antecedentes.alergias?.split(', ').includes(alergia);
                return (
                  <Chip
                    key={alergia}
                    label={alergia}
                    clickable
                    color={checked ? 'primary' : 'default'}
                    variant={checked ? 'filled' : 'outlined'}
                    onClick={() => toggleItem('alergias', alergia)}
                    sx={{
                      m: 0.5,
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      height: 32,
                      transition: 'all 0.2s ease',
                    }}
                  />
                );
              })}
            </Box>
            <TextField
              fullWidth
              multiline
              rows={2}
              name="alergias"
              label="Otras alergias"
              value={antecedentes.alergias}
              onChange={handleAntecedentesChange}
              variant="outlined"
              placeholder="Ej: Latex, picadura de abeja, etc."
              sx={{ mt: 2 }}
              InputProps={{ sx: { fontSize: '0.9rem' } }}
              InputLabelProps={{ sx: { fontSize: '0.9rem' } }}
            />
          </Grid>

          {/* Medicamentos actuales */}
          <Grid item xs={12}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                mb: 1,
                fontSize: '1rem'
              }}
            >
              💊 Medicamentos Actuales
            </Typography>
            <Box
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                p: 2,
                backgroundColor: '#f8f9ff',
                maxWidth: '100%',
                overflowX: 'auto',
                '&::-webkit-scrollbar': { width: 6 },
                '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
                '&::-webkit-scrollbar-thumb': { background: '#c0c0c0', borderRadius: 3 },
              }}
            >
              {[
                'Metformina',
                'Lisinopril',
                'Atorvastatina',
                'Valsartan',
                'Omeprazol',
                'Ibuprofeno',
                'Paracetamol',
                'Insulina',
                'Warfarina',
                'Aspirina',
                'Digoxina',
                'Furosemida',
                'Captopril',
              ].map((medicamento) => {
                const checked = antecedentes.medicamentos_actuales?.split(', ').includes(medicamento);
                return (
                  <Chip
                    key={medicamento}
                    label={medicamento}
                    clickable
                    color={checked ? 'primary' : 'default'}
                    variant={checked ? 'filled' : 'outlined'}
                    onClick={() => toggleItem('medicamentos_actuales', medicamento)}
                    sx={{
                      m: 0.5,
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      height: 32,
                      transition: 'all 0.2s ease',
                    }}
                  />
                );
              })}
            </Box>

            {/* Opcional: TextField para otros medicamentos */}
            <TextField
              fullWidth
              multiline
              rows={2}
              name="medicamentos_actuales"
              label="Otros medicamentos"
              value={antecedentes.medicamentos_actuales}
              onChange={handleAntecedentesChange}
              variant="outlined"
              placeholder="Ej: Ciprofloxacino, Prednisona, etc."
              sx={{ mt: 2 }}
            />

          </Grid>

          {/* Antecedentes familiares */}
          <Grid item xs={12}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                mb: 1,
                fontSize: '1rem'
              }}
            >
              🧬 Antecedentes Familiares
            </Typography>
            <Box
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                p: 2,
                backgroundColor: '#f8f9ff',
                maxHeight: 180,
                overflowY: 'auto',
                '&::-webkit-scrollbar': { width: 6 },
                '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
                '&::-webkit-scrollbar-thumb': { background: '#c0c0c0', borderRadius: 3 },
              }}
            >
              {[
                'Padre', 'Madre', 'Hermano', 'Hermana', 'Abuelo', 'Abuela', 'Tío', 'Tía'
              ].map((familiar) => {
                const checked = antecedentes.antecedentes_familiares?.split(', ').includes(familiar);
                return (
                  <Chip
                    key={familiar}
                    label={familiar}
                    clickable
                    color={checked ? 'primary' : 'default'}
                    variant={checked ? 'filled' : 'outlined'}
                    onClick={() => toggleItem('antecedentes_familiares', familiar)}
                    sx={{
                      m: 0.5,
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      height: 32,
                      transition: 'all 0.2s ease',
                    }}
                  />
                );
              })}
              {[
                'Diabetes', 'Hipertensión', 'Cáncer', 'Infarto', 'Alzheimer', 'Parkinson', 'EPOC', 'Asma'
              ].map((enfermedad) => {
                const checked = antecedentes.antecedentes_familiares?.split(', ').includes(enfermedad);
                return (
                  <Chip
                    key={enfermedad}
                    label={enfermedad}
                    clickable
                    color={checked ? 'error' : 'default'}
                    variant={checked ? 'filled' : 'outlined'}
                    onClick={() => toggleItem('antecedentes_familiares', enfermedad)}
                    sx={{
                      m: 0.5,
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      height: 32,
                      transition: 'all 0.2s ease',
                    }}
                  />
                );
              })}
            </Box>
            <TextField
              fullWidth
              multiline
              rows={2}
              name="antecedentes_familiares"
              label="Otros antecedentes"
              value={antecedentes.antecedentes_familiares}
              onChange={handleAntecedentesChange}
              variant="outlined"
              placeholder="Ej: Sobrino con epilepsia, prima con lupus"
              sx={{ mt: 2 }}
              InputProps={{ sx: { fontSize: '0.9rem' } }}
              InputLabelProps={{ sx: { fontSize: '0.9rem' } }}
            />
          </Grid>

{/* === EJERCICIO ===*/}
          <Grid item xs={12}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                mb: 1,
                fontSize: '1rem'
              }}
            >
              🏃 Ejercicio
            </Typography>
            <Box
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                p: 2,
                backgroundColor: '#f8f9ff',
                maxHeight: 180,
                overflowY: 'auto',
                '&::-webkit-scrollbar': { width: 6 },
                '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
                '&::-webkit-scrollbar-thumb': { background: '#c0c0c0', borderRadius: 3 },
              }}
            >
              {[
                'Ninguno', 'Caminata', 'Gimnasio', 'Correr', 'Natación', 'Ciclismo',
                'Yoga', 'Fútbol', 'Bicicleta', 'Pesas'
              ].map((actividad) => {
                const checked = antecedentes.ejercicio?.split(', ').includes(actividad);
                return (
                  <Chip
                    key={actividad}
                    label={actividad}
                    clickable
                    color={checked ? 'primary' : 'default'}
                    variant={checked ? 'filled' : 'outlined'}
                    onClick={() => toggleItem('ejercicio', actividad)}
                    sx={{
                      m: 0.5,
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      height: 32,
                      transition: 'all 0.2s ease',
                    }}
                  />
                );
              })}
            </Box>
            <TextField
              fullWidth
              name="ejercicio"
              label="Otra actividad"
              value={antecedentes.ejercicio}
              onChange={handleAntecedentesChange}
              variant="outlined"
              placeholder="Ej: Tenis, baile, etc."
              sx={{ mt: 2 }}
              InputProps={{ sx: { fontSize: '0.9rem' } }}
            />
          </Grid>

          {/* === DIETA ===*/}
          <Grid item xs={12}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                mb: 1,
                fontSize: '1rem'
              }}
            >
              🍽️ Dieta
            </Typography>
            <Box
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                p: 2,
                backgroundColor: '#f8f9ff',
                maxHeight: 180,
                overflowY: 'auto',
                '&::-webkit-scrollbar': { width: 6 },
                '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
                '&::-webkit-scrollbar-thumb': { background: '#c0c0c0', borderRadius: 3 },
              }}
            >
              {[
                'Normal', 'Vegetariana', 'Diabética', 'Hipertensión', 'Baja en grasa',
                'Mediterránea', 'Proteica', 'Keto', 'Sin gluten', 'Ovolactovegetariana'
              ].map((dieta) => {
                const checked = antecedentes.dieta?.split(', ').includes(dieta);
                return (
                  <Chip
                    key={dieta}
                    label={dieta}
                    clickable
                    color={checked ? 'primary' : 'default'}
                    variant={checked ? 'filled' : 'outlined'}
                    onClick={() => toggleItem('dieta', dieta)}
                    sx={{
                      m: 0.5,
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      height: 32,
                      transition: 'all 0.2s ease',
                    }}
                  />
                );
              })}
            </Box>
            <TextField
              fullWidth
              name="dieta"
              label="Otro tipo de dieta"
              value={antecedentes.dieta}
              onChange={handleAntecedentesChange}
              variant="outlined"
              placeholder="Ej: Intermitente, macrobiótica, etc."
              sx={{ mt: 2 }}
              InputProps={{ sx: { fontSize: '0.9rem' } }}
            />
          </Grid>
          {/* ¿Fuma? */}
          <Grid item xs={12}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                mb: 1,
                fontSize: '1rem'
              }}
            >
              🚬 ¿Fuma?
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={antecedentes.fuma ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setAntecedentes({ ...antecedentes, fuma: true })}
                fullWidth
                sx={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  py: 1,
                  borderRadius: 2,
                }}
              >
                Sí
              </Button>
              <Button
                variant={!antecedentes.fuma ? 'contained' : 'outlined'}
                color="secondary"
                onClick={() => setAntecedentes({ ...antecedentes, fuma: false })}
                fullWidth
                sx={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  py: 1,
                  borderRadius: 2,
                }}
              >
                No
              </Button>
            </Box>
          </Grid>

          {/* Paquetes por día */}
          {antecedentes.fuma && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="paquetes_por_dia"
                label="Paquetes por día"
                type="number"
                value={antecedentes.paquetes_por_dia || ''}
                onChange={handleAntecedentesChange}
                variant="outlined"
                placeholder="1"
                InputProps={{ sx: { fontSize: '0.9rem' } }}
              />
            </Grid>
          )}

          {/* Consumo de alcohol */}
          <Grid item xs={12}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                mb: 1,
                fontSize: '1rem'
              }}
            >
              🍷 Consumo de Alcohol
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { key: 'nunca', label: 'Nunca' },
                { key: 'ocasional', label: 'Ocasional' },
                { key: 'frecuente', label: 'Frecuente' },
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={antecedentes.alcohol === key ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => setAntecedentes({ ...antecedentes, alcohol: key })}
                  fullWidth
                  sx={{
                    justifyContent: 'flex-start',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                  }}
                >
                  {label}
                </Button>
              ))}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          color="inherit"
          variant="outlined"
          sx={{
            borderRadius: 2,
            fontWeight: 500,
            fontSize: '0.9rem',
            px: 3,
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          sx={{
            backgroundColor: '#1976d2',
            '&:hover': { backgroundColor: '#1565c0' },
            borderRadius: 2,
            fontWeight: 600,
            fontSize: '0.9rem',
            px: 4,
            py: 1,
            boxShadow: 2,
          }}
        >
          💾 Guardar Cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AntecedentesModal;