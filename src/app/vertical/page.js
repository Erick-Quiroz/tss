'use client';
import React, { useState, useEffect } from 'react';
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper, Tabs, Tab, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { blueGrey } from '@mui/material/colors';
import Admin from '../components/layout/admin/Admin';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: blueGrey[100],
  color: theme.palette.text.primary,
  fontWeight: 'bold',
  fontSize: '1rem',
  padding: '8px 16px',
  textAlign: 'center',
}));

const Home = () => {
  const [excelData, setExcelData] = useState(null);
  const [subtotalInfo, setSubtotalInfo] = useState({});
  const [selectedYear, setSelectedYear] = useState(0);
  const [totalGeneral, setTotalGeneral] = useState({});
  const [granTotal, setGranTotal] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/finanza');
        if (!response.ok) {
          throw new Error('Error al cargar datos');
        }
        const data = await response.json();
        console.log('Datos de la API cargados:', data);
        setExcelData(data.data);
      } catch (error) {
        console.error('Error al cargar datos de la API:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!excelData || !excelData[0] || !excelData[0].data) return;

    const updatedExcelData = updateVerticalAnalysis();

    if (JSON.stringify(updatedExcelData) !== JSON.stringify(excelData)) {
      setExcelData(updatedExcelData);
    }
  }, [excelData]);

  const updateVerticalAnalysis = () => {
    if (!excelData) return [];

    const years = excelData[0].data[0] ? Object.keys(excelData[0].data[0]).filter(key => key.startsWith('AÑO')) : [];

    let totalGeneralLocal = {};
    let granTotalLocal = {};
    years.forEach(year => {
      totalGeneralLocal[year] = 0;
      granTotalLocal[year] = 0;
      excelData.forEach(sheet => {
        sheet.data.forEach(row => {
          if (row.CATEGORIA.toLowerCase().includes('total')) {
            granTotalLocal[year] += row[year];
          }
          if (row.CATEGORIA.toLowerCase().includes('subtotal')) {
            totalGeneralLocal[year] += row[year];
          }
        });
      });
    });

    setTotalGeneral(totalGeneralLocal); // Guardar totalGeneral en el estado
    setGranTotal(granTotalLocal); // Guardar granTotal en el estado

    let subtotalInfoObject = {};

    years.forEach(year => {
      const subtotalInfoArray = [];
      excelData.forEach(sheet => {
        let currentSubtotal = null;
        let subtotalValue = null;
        let dataBeforeSubtotal = [];

        sheet.data.forEach(row => {
          if (row.CATEGORIA.toLowerCase().includes('subtotal')) {
            if (currentSubtotal) {
              const infoObject = {
                dataBeforeSubtotal: dataBeforeSubtotal.filter(item => item.CATEGORIA && item.dato),
                subtotalCATEGORIA: `Subtotal ${subtotalValue}`,
                subtotalValue: subtotalValue,
              };
              subtotalInfoArray.push(infoObject);
              dataBeforeSubtotal = [];
            }
            currentSubtotal = row.CATEGORIA;
            subtotalValue = row[year];

            dataBeforeSubtotal.push({
              CATEGORIA: row.CATEGORIA,
              dato: subtotalValue,
            });

          } else {
            const previousCATEGORIA = row.CATEGORIA;
            const previousYear = row[year];
            if (previousCATEGORIA && previousYear) {
              dataBeforeSubtotal.push({
                CATEGORIA: previousCATEGORIA,
                dato: previousYear,
              });
            }
          }
        });

        if (currentSubtotal) {
          const infoObject = {
            dataBeforeSubtotal: dataBeforeSubtotal.filter(item => item.CATEGORIA && item.dato),
            subtotalCATEGORIA: `Subtotal ${subtotalValue}`,
            subtotalValue: subtotalValue,
          };
          subtotalInfoArray.push(infoObject);
        }

        // Incluir también el total en subtotalInfoArray con su fórmula
        const totalRow = sheet.data.find(row => row.CATEGORIA.toLowerCase().includes('total'));
        if (totalRow) {
          const totalValue = totalRow[year];
          const totalObject = {
            dataBeforeSubtotal: [],
            subtotalCATEGORIA: `TOTAL ${totalValue}`,
            subtotalValue: totalValue,
          };
          subtotalInfoArray.push(totalObject);
        }
      });

      subtotalInfoObject[year] = subtotalInfoArray;
    });

    console.log('Información antes de cada subtotal por año:', subtotalInfoObject);
    setSubtotalInfo(subtotalInfoObject);

    const updatedData = excelData.map(sheet => ({
      ...sheet,
      data: sheet.data.map(row => {
        const updatedRow = { ...row };

        years.forEach(year => {
          const value = row[year];
          if (value && totalGeneralLocal[year] !== 0) {
            const verticalAnalysis = (value / totalGeneralLocal[year]) * 100;
            updatedRow[`AV_${year}`] = verticalAnalysis.toFixed(2);
          } else {
            updatedRow[`AV_${year}`] = 0;
          }
        });

        return updatedRow;
      })
    }));

    return updatedData;
  };

  const handleTabChange = (event, newValue) => {
    setSelectedYear(newValue);
  };

  const renderTables = () => {
    if (!excelData || !excelData[0] || !excelData[0].data || Object.keys(subtotalInfo).length === 0) return null;

    const years = excelData[0].data[0] ? Object.keys(excelData[0].data[0]).filter(key => key.startsWith('AÑO')) : [];

    return (
      <div style={{ width: '100%' }}>
        <Tabs value={selectedYear} onChange={handleTabChange}>
          {years.map((year, index) => (
            <Tab key={index} label={`${year}`} />
          ))}
        </Tabs>
        {years.map((year, yearIndex) => (
          selectedYear === yearIndex && (
            <div key={yearIndex}>
              <TableContainer component={Paper} style={{ width: '100%', marginTop: '20px' }}>
                <Table style={{ minWidth: '100%' }}>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Categoría</StyledTableCell>
                      <StyledTableCell>{`${year}`}</StyledTableCell>
                      <StyledTableCell>Análisis Vertical %</StyledTableCell>
                      <StyledTableCell>Análisis Vertical Subcuentas %</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {excelData[0].data.map((row, rowIndex) => {
                      const avVertical = parseFloat(row[`AV_${year}`]);
                      let subcuentasPercentage = '';

                      const subtotalInfoForCATEGORIA = subtotalInfo[year].find(subtotal => {
                        const foundItem = subtotal.dataBeforeSubtotal.find(item => item.CATEGORIA === row.CATEGORIA);
                        return foundItem;
                      });

                      if (subtotalInfoForCATEGORIA) {
                        const foundItem = subtotalInfoForCATEGORIA.dataBeforeSubtotal.find(item => item.CATEGORIA === row.CATEGORIA);
                        const dato = parseFloat(foundItem.dato);
                        const subtotalValue = parseFloat(subtotalInfoForCATEGORIA.subtotalValue);
                        subcuentasPercentage = ((dato / subtotalValue) * 100).toFixed(2);
                      }

                      return (
                        <TableRow key={rowIndex} style={{ backgroundColor: rowIndex % 2 === 0 ? blueGrey[50] : 'transparent', fontWeight: row.CATEGORIA.toLowerCase().includes('subtotal') ? 'bold' : 'normal' }}>
                          <TableCell align="center">{row.CATEGORIA}</TableCell>
                          <TableCell align="center">{row[year]} Bs.</TableCell>
                          <TableCell align="center">{avVertical.toFixed(2)}%</TableCell>
                          <TableCell align="center">{subcuentasPercentage}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              {renderChart(year)}
            </div>
          )
        ))}
      </div>
    );
  };

  const renderChart = (year) => {
    const dataForChart = excelData[0].data.map(row => ({
      label: row.CATEGORIA,
      value: parseFloat(row[`AV_${year}`])
    }));
  
    const chartData = {
      labels: dataForChart.map(item => item.label),
      datasets: [
        {
          label: `Análisis Vertical ${year}`,
          data: dataForChart.map(item => item.value),
          fill: false,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
        }
      ]
    };
  
    const chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: `Análisis Vertical ${year}`,
        },
      },
    };
  
    return (
      <div style={{ width: '100%', marginTop: '20px' }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    );
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    if (!excelData || !excelData[0] || !excelData[0].data) return;

    const year = Object.keys(excelData[0].data[0]).find(key => key.startsWith('AÑO'));

    const tableColumn = ["Categoría", year, "Análisis Vertical %", "Análisis Vertical Subcuentas %"];
    const tableRows = [];

    excelData[0].data.forEach(row => {
      const avVertical = parseFloat(row[`AV_${year}`]);
      let subcuentasPercentage = '';

      const subtotalInfoForCATEGORIA = subtotalInfo[year].find(subtotal => {
        const foundItem = subtotal.dataBeforeSubtotal.find(item => item.CATEGORIA === row.CATEGORIA);
        return foundItem;
      });

      if (subtotalInfoForCATEGORIA) {
        const foundItem = subtotalInfoForCATEGORIA.dataBeforeSubtotal.find(item => item.CATEGORIA === row.CATEGORIA);
        const dato = parseFloat(foundItem.dato);
        const subtotalValue = parseFloat(subtotalInfoForCATEGORIA.subtotalValue);
        subcuentasPercentage = ((dato / subtotalValue) * 100).toFixed(2);
      }

      const rowData = [
        row.CATEGORIA,
        `${row[year]} Bs.`,
        `${avVertical.toFixed(2)}%`,
        `${subcuentasPercentage}%`
      ];
      tableRows.push(rowData);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.text(`Análisis Vertical ${year}`, 14, 15);
    doc.save(`analisis_vertical_${year}.pdf`);
  };

  return (
    <Admin>
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '20px' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Análisis Vertical por Año
          </Typography>
          <Button variant="contained" color="primary" onClick={exportPDF}>
            Exportar PDF
          </Button>
        </div>
        {renderTables()}
      </main>
    </Admin>
  );
}

export default Home;
