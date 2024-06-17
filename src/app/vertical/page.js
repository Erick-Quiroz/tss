'use client'
import { useState, useEffect } from 'react';
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper, Tabs, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';
import { blueGrey } from '@mui/material/colors';
import Admin from '../components/layout/admin/Admin';

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
  const [subtotalInfo, setSubtotalInfo] = useState({});
  const [selectedYear, setSelectedYear] = useState(0);
  const [totalGeneral, setTotalGeneral] = useState({});

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
    years.forEach(year => {
      totalGeneralLocal[year] = 0;
      excelData.forEach(sheet => {
        sheet.data.forEach(row => {
          if (row.CATEGORIA.toLowerCase().includes('subtotal')) {
            totalGeneralLocal[year] += row[year];
          }
        });
      });
    });

    setTotalGeneral(totalGeneralLocal); // Guardar totalGeneral en el estado

    let subtotalInfoObject = {};

    years.forEach(year => {
      const subtotalInfoArray = [];
      excelData.forEach(sheet => {
        let previousCATEGORIA = null;
        let previousYear = null;
        let currentSubtotal = null;
        let subtotalValue = null;
        let dataBeforeSubtotal = [];
  
        for (let i = sheet.data.length - 1; i >= 0; i--) {
          const row = sheet.data[i];
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
            previousCATEGORIA = row.CATEGORIA;
            previousYear = row[year];
            if (previousCATEGORIA && previousYear) {
              dataBeforeSubtotal.push({
                CATEGORIA: previousCATEGORIA,
                dato: previousYear,
              });
            }
          }
        }
  
        if (currentSubtotal && previousCATEGORIA && previousYear) {
          const infoObject = {
            dataBeforeSubtotal: dataBeforeSubtotal.filter(item => item.CATEGORIA && item.dato),
            subtotalCATEGORIA: `Subtotal ${subtotalValue}`,
            subtotalValue: subtotalValue,
          };
          subtotalInfoArray.push(infoObject);
        }
      });
  
      subtotalInfoArray.reverse();
      subtotalInfoArray.forEach(item => {
        item.dataBeforeSubtotal.reverse();
      });
  
      subtotalInfoObject[year] = subtotalInfoArray;
    });

    console.log('Información antes de cada subtotal por año (invertida):', subtotalInfoObject);
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
            <TableContainer key={yearIndex} component={Paper} style={{ width: '100%', marginTop: '20px' }}>
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
                    if (row.CATEGORIA.toLowerCase().includes('total') || row.CATEGORIA.toLowerCase().includes('subtotal')) {
                      return null; // No renderizar las filas de "Total" o "Subtotal" en el mapeo principal
                    }
                    
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
                        <TableCell align="center">{row[year]}</TableCell>
                        <TableCell align="center">{avVertical.toFixed(2)}</TableCell>
                        <TableCell align="center">{subcuentasPercentage}</TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow style={{ backgroundColor: blueGrey[100], fontWeight: 'bold' }}>
                    <StyledTableCell align="center">Total</StyledTableCell>
                    <StyledTableCell align="center">
                      {totalGeneral[year]}
                    </StyledTableCell>
                    <StyledTableCell align="center">100.00</StyledTableCell>
                    <StyledTableCell align="center">100.00</StyledTableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )
        ))}
      </div>
    );
  };
  
  return (
    <Admin>
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <h1>Análisis Vertical por Año</h1>
        {renderTables()}
      </main>
    </Admin>
  );
}
