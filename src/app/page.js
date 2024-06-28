'use client'
import Admin from './components/layout/admin/Admin';
import { useState, useEffect } from 'react';
import { Button, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper, Typography, Modal, Box, Checkbox, FormControlLabel } from '@mui/material';
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
  const [modalOpen, setModalOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    table: false,
    chart: false,
  });

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

  const handleExportChange = (event) => {
    setExportOptions({ ...exportOptions, [event.target.name]: event.target.checked });
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleExport = () => {
    if (!excelData || !excelData[0] || !excelData[0].data) return;

    const doc = new jsPDF();

    let finalY = 20;

    if (exportOptions.table) {
      const headers = Object.keys(excelData[0].data[0]);
      const tableColumn = headers;
      const tableRows = [];

      excelData[0].data.forEach(row => {
        const rowData = headers.map(header => typeof row[header] === 'number' ? `${row[header]} Bs.` : row[header]);
        tableRows.push(rowData);
      });

      doc.text('Tabla exportada', 14, finalY);
      finalY += 10;

      doc.autoTable(tableColumn, tableRows, { startY: finalY });
      finalY = doc.autoTable.previous.finalY + 15;
    }

    if (exportOptions.chart) {
      const canvas = document.querySelector('#chart-canvas');
      const imgData = canvas.toDataURL('image/png');
      doc.text('Gráfico exportado', 14, finalY);
      finalY += 10;
      doc.addImage(imgData, 'PNG', 15, finalY, 180, 90);
    }

    doc.save('exportado.pdf');
    handleCloseModal();
  };

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
          <Line data={data} id="chart-canvas" />
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

  return (
    <Admin>
      <main style={{ width: '100%', padding: '20px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Balance General
          </Typography>
          <Button variant="contained" color="primary" onClick={handleOpenModal}>
            Exportar PDF
          </Button>
        </div>
        {renderTable()}
        {renderChart()}
        <Modal open={modalOpen} onClose={handleCloseModal}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4
          }}>
            <Typography variant="h6" component="h2">
              Selecciona las opciones
            </Typography>
            <FormControlLabel
              control={<Checkbox checked={exportOptions.table} onChange={handleExportChange} name="table" />}
              label="Tabla"
            />
            <FormControlLabel
              control={<Checkbox checked={exportOptions.chart} onChange={handleExportChange} name="chart" />}
              label="Gráfico"
            />
            <Button variant="contained" color="primary" onClick={handleExport}>
              Exportar
            </Button>
          </Box>
        </Modal>
      </main>
    </Admin>
  );
}
