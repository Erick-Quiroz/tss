'use client'
import Admin from './components/layout/admin/Admin'; // Asegúrate de que la ruta sea correcta
import { useState, useEffect } from 'react';
import { Button, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper } from '@mui/material';
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

  const renderTable = () => {
    if (!excelData || !excelData[0] || !excelData[0].data) return null;

    const headers = Object.keys(excelData[0].data[0]); // Obtener los encabezados desde los datos

    return (
      <TableContainer component={Paper} style={{ width: '100%', marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header, index) => (
                <StyledTableCell key={index} align="center">
                  {header}
                </StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {excelData[0].data.map((row, rowIndex) => (
              <TableRow key={rowIndex} style={{ backgroundColor: rowIndex % 2 === 0 ? blueGrey[50] : 'transparent' }}>
                {headers.map((header, headerIndex) => (
                  <TableCell key={headerIndex} align="center">
                    {typeof row[header] === 'number' ? `${row[header]} Bs.` : row[header]}
                  </TableCell>
                ))}
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
