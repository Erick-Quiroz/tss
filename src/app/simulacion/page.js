'use client';
import React, { useState, useEffect } from 'react';
import { Typography, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper, Tabs, Tab, Box, Button, Modal, FormControlLabel, Checkbox } from '@mui/material';
import { styled } from '@mui/material/styles';
import { blueGrey } from '@mui/material/colors';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import Admin from '../components/layout/admin/Admin';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: blueGrey[100],
  color: theme.palette.text.primary,
  fontWeight: 'bold',
  fontSize: '1rem',
  padding: '8px 16px',
  textAlign: 'center',
}));

const categories1 = [
  'Disponibilidades', 'Inversiones Temporales', 'Cuentas por Cobrar', 
  'Inventarios', 'Otros Activos Corrientes', 'Activos Fijos Netos', 
  'Inversiones Permanentes', 'Otros Activos No Corrientes'
];

const categories2 = [
  'Cuentas por Pagar', 'Otras Cuentas por Pagar', 
  'Prestamos Bnacarios a CP', 'Prestamos Bancarios', 'Bonos por Pagar'
];

const hiddenCategories = [
  'Capital Social', 'Reservas y Ajustes de Capital', 
  'Resultado Acumulados', 'Resultado de la Gestion'
];

const initialData = {
  'ACTIVOS': Array(8).fill(0),
  'Activos Corrientes': Array(8).fill(0),
  'Disponibilidades': Array(8).fill(0),
  'Inversiones Temporales': Array(8).fill(0),
  'Cuentas por Cobrar': Array(8).fill(0),
  'Inventarios': Array(8).fill(0),
  'Otros Activos Corrientes': Array(8).fill(0),
  'Activos No Corrientes': Array(8).fill(0),
  'Activos Fijos Netos': Array(8).fill(0),
  'Inversiones Permanentes': Array(8).fill(0),
  'Otros Activos No Corrientes': Array(8).fill(0),
  'PASIVOS Y PATRIMONIO': Array(8).fill(0),
  'PASIVOS': Array(8).fill(0),
  'Pasivos a Corto Plazo': Array(8).fill(0),
  'Cuentas por Pagar': Array(8).fill(0),
  'Otras Cuentas por Pagar': Array(8).fill(0),
  'Prestamos Bnacarios a CP': Array(8).fill(0),
  'Pasivos a Largo Plazo': Array(8).fill(0),
  'Prestamos Bancarios': Array(8).fill(0),
  'Bonos por Pagar': Array(8).fill(0),
  'PATRIMONIO': Array(8).fill(0),
  'TOTAL': Array(8).fill(0)
};

const calculateSummedValues = (data, columns) => {
  return data[columns[0]].map((_, colIndex) => {
    return columns.reduce((sum, col) => {
      const value = parseFloat(data[col]?.[colIndex] || 0);
      return sum + value;
    }, 0).toFixed(2);
  });
};

export default function Home() {
  const [monteCarloData, setMonteCarloData] = useState(initialData);
  const [selectedYear, setSelectedYear] = useState('AÑO 2018');
  const [modalOpen, setModalOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    table: true,
    chart: true,
    chartFiveYears: true,
  });

  useEffect(() => {
    const generateMonteCarloData = () => {
      const newMonteCarloData = { ...initialData };
      
      Object.keys(newMonteCarloData).forEach(category => {
        if (category === 'ACTIVOS' || category === 'PASIVOS Y PATRIMONIO' || category === 'PASIVOS' || category === 'TOTAL' || category === 'PATRIMONIO') return;
        
        const isCategory1 = categories1.includes(category);
        const isCategory2 = categories2.includes(category);
        let values = [];
        if (isCategory1) {
          values = Array.from({ length: 8 }, monteCarloCategory1);
        } else if (isCategory2) {
          values = Array.from({ length: 8 }, monteCarloCategory2);
        } else {
          values = Array(8).fill((Math.random() * 10000).toFixed(2));
        }
        newMonteCarloData[category] = values;
      });

      newMonteCarloData['Activos Corrientes'] = calculateSummedValues(newMonteCarloData, ['Disponibilidades', 'Inversiones Temporales', 'Cuentas por Cobrar', 'Inventarios', 'Otros Activos Corrientes']);
      newMonteCarloData['Activos No Corrientes'] = calculateSummedValues(newMonteCarloData, ['Activos Fijos Netos', 'Inversiones Permanentes', 'Otros Activos No Corrientes']);
      newMonteCarloData['PASIVOS Y PATRIMONIO'] = calculateSummedValues(newMonteCarloData, ['Activos Corrientes', 'Activos No Corrientes']);
      newMonteCarloData['Pasivos a Corto Plazo'] = calculateSummedValues(newMonteCarloData, ['Cuentas por Pagar', 'Otras Cuentas por Pagar', 'Prestamos Bnacarios a CP']);
      newMonteCarloData['Pasivos a Largo Plazo'] = calculateSummedValues(newMonteCarloData, ['Prestamos Bancarios', 'Bonos por Pagar']);
      newMonteCarloData['PASIVOS'] = calculateSummedValues(newMonteCarloData, ['Pasivos a Corto Plazo', 'Pasivos a Largo Plazo']);
      newMonteCarloData['ACTIVOS'] = calculateSummedValues(newMonteCarloData, ['Activos Corrientes', 'Activos No Corrientes']);
      newMonteCarloData['PATRIMONIO'] = newMonteCarloData['ACTIVOS'].map((value, index) => (parseFloat(value) - parseFloat(newMonteCarloData['PASIVOS'][index])).toFixed(2));
      newMonteCarloData['TOTAL'] = calculateSummedValues(newMonteCarloData, ['ACTIVOS', 'PASIVOS Y PATRIMONIO']);

      setMonteCarloData(newMonteCarloData);
    };
    generateMonteCarloData();
  }, [selectedYear]);

  const monteCarloCategory1 = () => {
    const x = Math.random();
    return (6000 + 80 * Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * x)).toFixed(2);
  };

  const monteCarloCategory2 = () => {
    const x = Math.random();
    const low = 5000;
    const mid = 6000;
    const high = 7000;
    if (x <= (mid - low) / (high - low)) {
      return (low + Math.sqrt(x * (mid - low) * (high - low))).toFixed(2);
    } else {
      return (high - Math.sqrt((1 - x) * (high - low) * (high - low))).toFixed(2);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedYear(newValue);
  };

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
    if (exportOptions.table && exportOptions.chart && exportOptions.chartFiveYears) {
      exportPDF(); // Exportar todo
    } else if (exportOptions.table && exportOptions.chart) {
      exportTableAndChartPDF(); // Exportar tabla y gráfico de un año
    } else if (exportOptions.table && exportOptions.chartFiveYears) {
      exportTableAndChartFiveYearsPDF(); // Exportar tabla y gráfico de cinco años
    } else if (exportOptions.chart && exportOptions.chartFiveYears) {
      exportBothChartsPDF(); // Exportar ambos gráficos
    } else if (exportOptions.table) {
      exportTablePDF(); // Exportar solo la tabla
    } else if (exportOptions.chart) {
      exportChartPDF(); // Exportar solo el gráfico de un año
    } else if (exportOptions.chartFiveYears) {
      exportChartFiveYearsPDF(); // Exportar solo el gráfico de cinco años
    }

    handleCloseModal(); // Cerrar el modal después de exportar
  };

  const renderTable = () => {
    const headers = ['CATEGORIA', ...Array.from({ length: 8 }, (_, i) => (i + 1).toString()), 'Valores resultantes'];

    return (
      <TableContainer component={Paper} style={{ width: '100%', marginTop: '20px' }}>
        <Table id="table-to-export">
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
            {Object.keys(monteCarloData).map((category, rowIndex) => {
              const values = monteCarloData[category] || [];
              const resultValue = values.reduce((acc, curr) => acc + parseFloat(curr), 0) / values.length;

              return (
                <TableRow key={rowIndex} style={{ backgroundColor: rowIndex % 2 === 0 ? blueGrey[50] : 'transparent' }}>
                  <TableCell align="center">{category}</TableCell>
                  {values.map((value, i) => (
                    <TableCell key={i} align="center">
                      {value} Bs.
                    </TableCell>
                  ))}
                  <TableCell align="center">{resultValue.toFixed(2)} Bs.</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderChart = () => {
    const labels = Object.keys(monteCarloData).filter(category => !hiddenCategories.includes(category));
    const resultValues = labels.map(category => {
      const values = monteCarloData[category] || [];
      return values.reduce((acc, curr) => acc + parseFloat(curr), 0) / values.length;
    });

    const data = {
      labels,
      datasets: [
        {
          label: `Valores resultantes para el año ${selectedYear.slice(-4)}`,
          data: resultValues,
          borderColor: 'rgba(75,192,192,1)',
          backgroundColor: 'rgba(75,192,192,0.2)',
          fill: false,
          borderDash: [], // Ensure continuous lines
          tension: 0.4, // Smooth lines
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          beginAtZero: true,
        },
        y: {
          beginAtZero: true,
        },
      },
    };

    return (
      <div id="chart-to-export" style={{ width: '100%', height: '500px', marginTop: '20px' }}> {/* Adjust height for larger chart */}
        <Line data={data} options={options} />
      </div>
    );
  };

  const renderChartFiveYears = () => {
    const categories = Object.keys(monteCarloData).filter(category => !hiddenCategories.includes(category));
    const years = ['2018', '2019', '2020', '2021', '2022'];
    
    const datasets = years.map((year, index) => {
      return {
        label: `Valores ${year}`,
        data: categories.map(category => monteCarloData[category][index]),
        borderColor: `rgba(${(index + 1) * 50}, 99, 132, 1)`,
        backgroundColor: `rgba(${(index + 1) * 50}, 99, 132, 0.2)`,
        fill: false,
        borderDash: [], // Ensure continuous lines
        tension: 0.4, // Smooth lines
      };
    });

    const data = {
      labels: categories,
      datasets,
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          beginAtZero: true,
        },
        y: {
          beginAtZero: true,
        },
      },
    };

    return (
      <div id="chart-five-years-to-export" style={{ width: '100%', height: '500px', marginTop: '20px' }}> {/* Adjust height for larger chart */}
        <Line data={data} options={options} />
      </div>
    );
  };

  const exportPDF = () => {
    const tableCanvasPromise = html2canvas(document.getElementById('table-to-export'));
    const chartCanvasPromise = html2canvas(document.getElementById('chart-to-export'));
    const chartFiveYearsCanvasPromise = html2canvas(document.getElementById('chart-five-years-to-export'));

    Promise.all([tableCanvasPromise, chartCanvasPromise, chartFiveYearsCanvasPromise]).then(canvases => {
      const [tableCanvas, chartCanvas, chartFiveYearsCanvas] = canvases;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // Anchura de la página A4 en mm
      const pageHeight = 295; // Altura de la página A4 en mm

      // Agregar la tabla al PDF
      const tableImgData = tableCanvas.toDataURL('image/png');
      const tableImgHeight = (tableCanvas.height * imgWidth) / tableCanvas.width;
      pdf.text(`Posibles Valores para el año ${selectedYear.slice(-4)}`, 10, 10);
      pdf.addImage(tableImgData, 'PNG', 0, 20, imgWidth, tableImgHeight);
      pdf.addPage();

      // Agregar el gráfico al PDF
      const chartImgData = chartCanvas.toDataURL('image/png');
      const chartImgHeight = (chartCanvas.height * imgWidth) / chartCanvas.width;
      pdf.text(`Posibles Valores para el año ${selectedYear.slice(-4)}`, 10, 10);
      pdf.addImage(chartImgData, 'PNG', 0, 20, imgWidth, chartImgHeight);
      pdf.addPage();

      // Agregar el gráfico de cinco años al PDF
      const chartFiveYearsImgData = chartFiveYearsCanvas.toDataURL('image/png');
      const chartFiveYearsImgHeight = (chartFiveYearsCanvas.height * imgWidth) / chartFiveYearsCanvas.width;
      pdf.text("Valores para los años 2018-2022:", 10, 10);
      pdf.addImage(chartFiveYearsImgData, 'PNG', 0, 20, imgWidth, chartFiveYearsImgHeight);

      // Descargar el PDF
      pdf.save('table_and_charts.pdf');
    });
  };

  const exportTableAndChartPDF = () => {
    const tableCanvasPromise = html2canvas(document.getElementById('table-to-export'));
    const chartCanvasPromise = html2canvas(document.getElementById('chart-to-export'));

    Promise.all([tableCanvasPromise, chartCanvasPromise]).then(canvases => {
      const [tableCanvas, chartCanvas] = canvases;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // Anchura de la página A4 en mm
      const pageHeight = 295; // Altura de la página A4 en mm

      // Agregar la tabla al PDF
      const tableImgData = tableCanvas.toDataURL('image/png');
      const tableImgHeight = (tableCanvas.height * imgWidth) / tableCanvas.width;
      pdf.text(`Posibles Valores para el año ${selectedYear.slice(-4)}`, 10, 10);
      pdf.addImage(tableImgData, 'PNG', 0, 20, imgWidth, tableImgHeight);
      pdf.addPage();

      // Agregar el gráfico al PDF
      const chartImgData = chartCanvas.toDataURL('image/png');
      const chartImgHeight = (chartCanvas.height * imgWidth) / chartCanvas.width;
      pdf.text(`Posibles Valores para el año ${selectedYear.slice(-4)}`, 10, 10);
      pdf.addImage(chartImgData, 'PNG', 0, 20, imgWidth, chartImgHeight);

      // Descargar el PDF
      pdf.save('table_and_chart.pdf');
    });
  };

  const exportTableAndChartFiveYearsPDF = () => {
    const tableCanvasPromise = html2canvas(document.getElementById('table-to-export'));
    const chartFiveYearsCanvasPromise = html2canvas(document.getElementById('chart-five-years-to-export'));

    Promise.all([tableCanvasPromise, chartFiveYearsCanvasPromise]).then(canvases => {
      const [tableCanvas, chartFiveYearsCanvas] = canvases;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // Anchura de la página A4 en mm
      const pageHeight = 295; // Altura de la página A4 en mm

      // Agregar la tabla al PDF
      const tableImgData = tableCanvas.toDataURL('image/png');
      const tableImgHeight = (tableCanvas.height * imgWidth) / tableCanvas.width;
      pdf.text(`Posibles Valores para el año ${selectedYear.slice(-4)}`, 10, 10);
      pdf.addImage(tableImgData, 'PNG', 0, 20, imgWidth, tableImgHeight);
      pdf.addPage();

      // Agregar el gráfico de cinco años al PDF
      const chartFiveYearsImgData = chartFiveYearsCanvas.toDataURL('image/png');
      const chartFiveYearsImgHeight = (chartFiveYearsCanvas.height * imgWidth) / chartFiveYearsCanvas.width;
      pdf.text("Valores para los años 2018-2022:", 10, 10);
      pdf.addImage(chartFiveYearsImgData, 'PNG', 0, 20, imgWidth, chartFiveYearsImgHeight);

      // Descargar el PDF
      pdf.save('table_and_chart_five_years.pdf');
    });
  };

  const exportTablePDF = () => {
    // Capturar solo la tabla como imagen usando html2canvas
    html2canvas(document.getElementById('table-to-export')).then(tableCanvas => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.text(`Posibles Valores para el año ${selectedYear.slice(-4)}`, 20, 20);
      const imgWidth = 210; // Anchura de la página A4 en mm
      const imgHeight = (tableCanvas.height * imgWidth) / tableCanvas.width;
      pdf.addImage(tableCanvas.toDataURL('image/png'), 'PNG', 0, 30, imgWidth, imgHeight);
      pdf.save('tabla_analisis.pdf');
    });
  };

  const exportBothChartsPDF = () => {
    const chartCanvasPromise = html2canvas(document.getElementById('chart-to-export'));
    const chartFiveYearsCanvasPromise = html2canvas(document.getElementById('chart-five-years-to-export'));

    Promise.all([chartCanvasPromise, chartFiveYearsCanvasPromise]).then(canvases => {
      const [chartCanvas, chartFiveYearsCanvas] = canvases;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // Anchura de la página A4 en mm
      const pageHeight = 295; // Altura de la página A4 en mm

      // Agregar el gráfico al PDF
      const chartImgData = chartCanvas.toDataURL('image/png');
      const chartImgHeight = (chartCanvas.height * imgWidth) / chartCanvas.width;
      pdf.text(`Posibles Valores para el año ${selectedYear.slice(-4)}`, 10, 10);
      pdf.addImage(chartImgData, 'PNG', 0, 20, imgWidth, chartImgHeight);
      pdf.addPage();

      // Agregar el gráfico de cinco años al PDF
      const chartFiveYearsImgData = chartFiveYearsCanvas.toDataURL('image/png');
      const chartFiveYearsImgHeight = (chartFiveYearsCanvas.height * imgWidth) / chartFiveYearsCanvas.width;
      pdf.text("Valores para los años 2018-2022:", 10, 10);
      pdf.addImage(chartFiveYearsImgData, 'PNG', 0, 20, imgWidth, chartFiveYearsImgHeight);

      // Descargar el PDF
      pdf.save('both_charts.pdf');
    });
  };

  const exportChartPDF = () => {
    html2canvas(document.getElementById('chart-to-export')).then(chartCanvas => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.text(`Posibles Valores para el año ${selectedYear.slice(-4)}`, 20, 20);
      const imgWidth = 210; // Anchura de la página A4 en mm
      const imgHeight = (chartCanvas.height * imgWidth) / chartCanvas.width;
      pdf.addImage(chartCanvas.toDataURL('image/png'), 'PNG', 0, 30, imgWidth, imgHeight);
      pdf.save('chart.pdf');
    });
  };

  const exportChartFiveYearsPDF = () => {
    html2canvas(document.getElementById('chart-five-years-to-export')).then(chartCanvas => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.text("Valores para los años 2018-2022:", 20, 20);
      const imgWidth = 210; // Anchura de la página A4 en mm
      const imgHeight = (chartCanvas.height * imgWidth) / chartCanvas.width;
      pdf.addImage(chartCanvas.toDataURL('image/png'), 'PNG', 0, 30, imgWidth, imgHeight);
      pdf.save('chart_five_years.pdf');
    });
  };

  return (
    <Admin>
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '20px' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Simulación
          </Typography>
          <Button variant="contained" color="primary" onClick={handleOpenModal}>
            EXPORTAR PDF
          </Button>
        </div>
        <Box sx={{ width: '100%' }}>
          <Tabs value={selectedYear} onChange={handleTabChange} centered>
            <Tab label="2018" value="AÑO 2018" />
            <Tab label="2019" value="AÑO 2019" />
            <Tab label="2020" value="AÑO 2020" />
            <Tab label="2021" value="AÑO 2021" />
            <Tab label="2022" value="AÑO 2022" />
          </Tabs>
        </Box>
        <div style={{ maxWidth: '80%', margin: '20px', overflowX: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Posibles Valores para el año {selectedYear.slice(-4)}:
          </Typography>
          {renderTable()}
          {renderChart()}
          <Typography variant="h6" gutterBottom style={{ marginTop: '40px' }}>
            Valores para los años 2018-2022:
          </Typography>
          {renderChartFiveYears()}
        </div>
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
              label="Gráfico un año"
            />
            <FormControlLabel
              control={<Checkbox checked={exportOptions.chartFiveYears} onChange={handleExportChange} name="chartFiveYears" />}
              label="Gráfico cinco años"
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