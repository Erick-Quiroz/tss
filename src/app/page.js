'use client'
import Admin from './components/layout/admin/Admin';
import { useState, useEffect } from 'react';
import { Button, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { blueGrey } from '@mui/material/colors';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: blueGrey[100],
  color: theme.palette.text.primary,
  fontWeight: 'bold',
  fontSize: '1rem',
  padding: '8px 16px',
  textAlign: 'center',
}));

export default function Home() {
  const [excelData, setExcelData] = useState(null);

  useEffect(() => {
    fetch('/api/finanza')
      .then(response => response.json())
      .then(data => {
        console.log('Datos de la API cargados:', data);
        setExcelData(data.data);
      })
      .catch(error => {
        console.error('Error al cargar datos de la API:', error);
      });
  }, []);

  const exportPDF = () => {
    if (!excelData || !excelData[0] || !excelData[0].data) return;

    const headers = Object.keys(excelData[0].data[0]);
    const tableRows = excelData[0].data.map(row =>
      headers.map(header => (typeof row[header] === 'number' ? `${row[header]} Bs.` : row[header]))
    );

    const doc = new jsPDF();
    doc.autoTable({ head: [headers], body: tableRows });
    doc.save('tabla.pdf');
  };

  const renderTable = () => {
    if (!excelData || !excelData[0] || !excelData[0].data) return null;

    const headers = Object.keys(excelData[0].data[0]);

    return (
      <TableContainer component={Paper} style={{ width: '100%', marginTop: '20px', overflowX: 'auto' }}>
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
      <main style={{ width: '100%', padding: '20px', boxSizing: 'border-box' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Análisis de Datos
        </Typography>
        <Button variant="contained" color="primary" onClick={exportPDF}>
          Exportar PDF
        </Button>
        {renderTable()}
      </main>
    </Admin>
  );
}
