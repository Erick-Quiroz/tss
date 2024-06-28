'use client';
import React, { useState, useEffect } from 'react';
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper, Typography, Button, Modal, Box, FormControlLabel, Checkbox } from '@mui/material';
import { styled } from '@mui/material/styles';
import { blueGrey } from '@mui/material/colors';
import Admin from '../components/layout/admin/Admin';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: blueGrey[100],
  color: theme.palette.text.primary,
  fontWeight: 'bold',
  fontSize: '1rem',
  padding: '8px 16px',
  textAlign: 'center',
}));

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export default function Home() {
  const [excelData, setExcelData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    table: true,
    chart: true,
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

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleExportChange = event => {
    setExportOptions({ ...exportOptions, [event.target.name]: event.target.checked });
  };

  const handleExport = () => {
    // Verificar las opciones de exportación y ejecutar la exportación correspondiente
    if (exportOptions.table && exportOptions.chart) {
      exportPDF(); // Exportar ambos
    } else if (exportOptions.table) {
      exportTablePDF(); // Exportar solo la tabla
    } else if (exportOptions.chart) {
      exportChartPDF(); // Exportar solo el gráfico
    }

    handleCloseModal(); // Cerrar el modal después de exportar
  };

  const renderTable = () => {
    if (!excelData || !excelData[0] || !excelData[0].data) return null;

    const headers = Object.keys(excelData[0].data[0]); // Obtener los encabezados desde los datos

    return (
      <TableContainer component={Paper} style={{ width: '100%', marginTop: '20px' }}>
        <Table id="table-to-export">
          <TableHead>
            <TableRow>
              <StyledTableCell align="center">Categoría</StyledTableCell>
              {headers.slice(1).map((header, index) => (
                <StyledTableCell key={index} align="center">
                  {`Análisis Vertical % ${header}`}
                </StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {excelData[0].data.map((row, rowIndex) => {
              console.log(`Datos de la fila ${rowIndex + 1}: ${JSON.stringify(row)}`);
              const pivotValue = parseFloat(String(row[headers[1]]).replace('Bs', '').replace(',', '')); // Valor pivote (primera columna)

              return (
                <TableRow key={rowIndex} style={{ backgroundColor: rowIndex % 2 === 0 ? blueGrey[50] : 'transparent' }}>
                  <TableCell key={`category-${rowIndex}`} align="center">
                    {row[headers[0]]}
                  </TableCell>
                  {headers.slice(1).map((header, headerIndex) => {
                    const currentYearValue = parseFloat(String(row[header]).replace('Bs', '').replace(',', ''));

                    // Condición para formatear el valor pivote y calcular el valor del análisis.
                    let analysisValue;
                    if (headerIndex === 0) {
                      analysisValue = 100; // El valor del pivote de la primera columna siempre es 100%
                    } else {
                      analysisValue = ((currentYearValue / pivotValue) * 100).toFixed(2);
                    }

                    // Imprimir datos y resultados en la consola
                    console.log(`Fila ${rowIndex + 1}, Columna ${header}:`);
                    console.log(`Valor Actual (${header}): ${currentYearValue}`);
                    console.log(`Valor Pivote: ${pivotValue}`);
                    console.log(`Fórmula: (${currentYearValue} / ${pivotValue}) * 100`);
                    console.log(`Resultado: ${analysisValue}%`);

                    return (
                      <TableCell key={headerIndex} align="center">
                        {analysisValue}%
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
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
      data: excelData[0].data.map(row => parseFloat(String(row[header]).replace('Bs', '').replace(',', ''))),
      borderColor: getRandomColor(),
      backgroundColor: 'rgba(75,192,192,0.2)',
      fill: false,
    }));

    const chartData = labels.map((label, index) => {
      const data = { name: label };
      headers.forEach(header => {
        data[header] = datasets.find(dataset => dataset.label === header).data[index];
      });
      return data;
    });

    return (
      <ResponsiveContainer id="line-chart-to-export" width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {headers.map((header, index) => (
            <Line key={index} type="monotone" dataKey={header} stroke={datasets[index].borderColor} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const exportPDF = () => {
    // Capturar tanto la tabla como el gráfico como imágenes usando html2canvas
    const tableCanvasPromise = html2canvas(document.getElementById('table-to-export'));
    const chartCanvasPromise = html2canvas(document.getElementById('line-chart-to-export'));

    Promise.all([tableCanvasPromise, chartCanvasPromise]).then(canvases => {
      const [tableCanvas, chartCanvas] = canvases;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // Anchura de la página A4 en mm
      const pageHeight = 295; // Altura de la página A4 en mm

      // Agregar la tabla al PDF
      const tableImgData = tableCanvas.toDataURL('image/png');
      const tableImgHeight = (tableCanvas.height * imgWidth) / tableCanvas.width;
      let heightLeft = tableImgHeight;
      let position = 0;
      pdf.addImage(tableImgData, 'PNG', 0, position, imgWidth, tableImgHeight);
      heightLeft -= pageHeight;

      // Agregar el gráfico al PDF
      const chartImgData = chartCanvas.toDataURL('image/png');
      const chartImgHeight = (chartCanvas.height * imgWidth) / chartCanvas.width;
      position += heightLeft < 0 ? pageHeight : 0; // Avanzar a la siguiente página si es necesario
      pdf.addPage();
      pdf.addImage(chartImgData, 'PNG', 0, position, imgWidth, chartImgHeight);

      // Descargar el PDF
      pdf.save('tabla_analisis.pdf');
    });
  };

  const exportTablePDF = () => {
    // Capturar solo la tabla como imagen usando html2canvas
    html2canvas(document.getElementById('table-to-export')).then(tableCanvas => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // Anchura de la página A4 en mm
      const imgHeight = (tableCanvas.height * imgWidth) / tableCanvas.width;
      pdf.addImage(tableCanvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('tabla_analisis.pdf');
    });
  };

  const exportChartPDF = () => {
    // Capturar solo el gráfico como imagen usando html2canvas
    html2canvas(document.getElementById('line-chart-to-export')).then(chartCanvas => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // Anchura de la página A4 en mm
      const imgHeight = (chartCanvas.height * imgWidth) / chartCanvas.width;
      pdf.addImage(chartCanvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('grafico_analisis.pdf');
    });
  };

  return (
    <Admin>
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '20px' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Análisis de Datos
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
