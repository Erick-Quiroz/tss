'use client'
import Admin from './components/layout/admin/Admin';
import { useState, useEffect } from 'react';
import { Button, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { blueGrey } from '@mui/material/colors';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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

  const renderChart = () => {
    if (!excelData || !excelData[0] || !excelData[0].data) return null;

    const headers = Object.keys(excelData[0].data[0]).filter(header => header.toLowerCase().startsWith('año'));

    const labels = excelData[0].data.map(row => row.CATEGORIA);

    const datasets = headers.map(header => ({
      label: header,
      data: excelData[0].data.map(row => row[header]),
      borderColor: getRandomColor(), // Color aleatorio para cada línea
      backgroundColor: 'rgba(75,192,192,0.2)',
      fill: false,
    }));

    const data = {
      labels,
      datasets,
    };

    return (
      <div style={{ width: '100%', marginTop: '20px' }}>
        <Typography variant="h6" align="center">Balance General</Typography>
        <div style={{ width: '100%' }}>
          <Line data={data} />
        </div>
      </div>
    );
  };

  // Función para generar colores aleatorios
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const exportPDF = () => {
    if (!excelData || !excelData[0] || !excelData[0].data) return;

    const doc = new jsPDF();

    const headers = Object.keys(excelData[0].data[0]); // Obtener los encabezados desde los datos

    const tableColumn = headers;
    const tableRows = [];

    excelData[0].data.forEach(row => {
      const rowData = headers.map(header => typeof row[header] === 'number' ? `${row[header]} Bs.` : row[header]);
      tableRows.push(rowData);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.text('Datos de la Tabla', 14, 15);
    doc.save('tabla.pdf');
  };

  return (
    <Admin>
      <main style={{ width: '100%', padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>c
        <Typography variant="h4" component="h1" gutterBottom>
          Balance General
        </Typography>
        
          <Typography variant="h6"></Typography>
          <Button variant="contained" color="primary" onClick={exportPDF}>
            Exportar PDF
          </Button>
        </div>
        {renderTable()}
        {renderChart()}
      </main>
    </Admin>
  );
}
