'use client';
import React, { useState, useEffect } from 'react';
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper, Typography, Button } from '@mui/material';
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
      <ResponsiveContainer width="100%" height={400}>
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
    // Capturar la tabla como una imagen usando html2canvas
    html2canvas(document.getElementById('table-to-export')).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // Anchura de la página A4 en mm
      const pageHeight = 295; // Altura de la página A4 en mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Agregar la imagen al PDF
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Descargar el PDF
      pdf.save('tabla_analisis.pdf');
    });
  };

  return (
    <Admin>
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '20px' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Análisis de Datos
          </Typography>
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
