'use client';
import Admin from '../components/layout/admin/Admin'; // Asegúrate de que la ruta sea correcta
import { useState, useEffect } from 'react';
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper } from '@mui/material';
import { styled } from '@mui/material/styles'; // Importar styled para definir estilos
import { blueGrey } from '@mui/material/colors'; // Importar colores predefinidos de MUI

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: blueGrey[100], // Color de fondo azul grisáceo claro predefinido
  color: theme.palette.text.primary, // Color de texto primario del tema
  fontWeight: 'bold', // Texto en negrita
  fontSize: '1rem', // Tamaño de fuente
  padding: '8px 16px', // Relleno de celda
  textAlign: 'center', // Alineación de texto al centro
}));

export default function Home() {
  const [excelData, setExcelData] = useState(null);
  const [pasivosMenosPatrimonio, setPasivosMenosPatrimonio] = useState([]);
  useEffect(() => {
    fetch('/api/finanza')
      .then(response => response.json())
      .then(data => {
        console.log('Datos de la API cargados:', data);
        setExcelData(data.data); // Establecer los datos de la API en el estado local
      })
      .catch(error => {
        console.error('Error al cargar datos de la API:', error);
      });
  }, []);

  useEffect(() => {
    if (excelData && excelData.length > 0) {
      // Filtrar el dato de Pasivos Totales y Patrimonio
      const activosCorrientesData = excelData[0].data.find(row => {
        const categoria = row.CATEGORIA.toLowerCase();
        return categoria.includes('activos corrientes');
      });
      const totalPasivosPatrimonioData = excelData[0].data.find(row => {
        return row.CATEGORIA.toLowerCase().includes('total pasivos y patrimonio');
      });

      // Filtrar el dato de Patrimonio
      const patrimonioData = excelData[0].data.find(row => {
        return row.CATEGORIA.toLowerCase().includes('subtotal patrimonio');
      });

      // Mostrar los resultados por consola
      console.log('Activo corriente :', activosCorrientesData);

      console.log('Total Pasivos y Patrimonio:', totalPasivosPatrimonioData);
      console.log('Patrimonio:', patrimonioData);

      if (totalPasivosPatrimonioData && patrimonioData) {
        // Determinar los años disponibles dinámicamente
        const years = Object.keys(totalPasivosPatrimonioData).filter(key => key.startsWith('AÑO '));

        // Calcular el array de Pasivos totales menos Patrimonio por cada año
        const pasivosMenosPatrimonioCalculado = years.map(year => {
          const totalPasivos = totalPasivosPatrimonioData[year];
          const patrimonio = patrimonioData[year];
          const pasivoMenosPatrimonio = totalPasivos - patrimonio;
          return { year, value: pasivoMenosPatrimonio };
        });

        setPasivosMenosPatrimonio(pasivosMenosPatrimonioCalculado);
        console.log('Pasivos Totales Menos Patrimonio por Año:', pasivosMenosPatrimonioCalculado);
      }
    }
  }, [excelData]);

  const renderTable = () => {
    if (!excelData || !excelData[0] || !excelData[0].data) return null;

    // Obtener los años como filas
    const years = Object.keys(excelData[0].data[0]).filter(header => header.startsWith('AÑO '));

    return (
      <TableContainer component={Paper} style={{ width: '100%', marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell align="center">AÑO</StyledTableCell>
              <StyledTableCell align="center">Ratio de Liquidez</StyledTableCell>
              <StyledTableCell align="center">Ratio de Endeudamiento</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {years.map((year, index) => (
              <TableRow key={index} style={{ backgroundColor: index % 2 === 0 ? blueGrey[50] : 'transparent' }}>
                <TableCell align="center">{year}</TableCell>
                {/* Celda para la Columna 1, verificar si existe en los datos */}
                <TableCell align="center">
                  
                </TableCell>
                {/* Celda para la Columna 2, verificar si existe en los datos */}
                <TableCell align="center">
                  
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Admin>
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        {renderTable()}
      </main>
    </Admin>
  );
}
