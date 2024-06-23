'use client'
import React, { useState, useEffect, useRef } from 'react';
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper, Typography, Button, List, ListItem, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';
import { blueGrey } from '@mui/material/colors';
import Admin from '../components/layout/admin/Admin';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const [liquidezData, setLiquidezData] = useState([]);
  const [endeudamientoData, setEndeudamientoData] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const tableRef = useRef(null); // Referencia al contenedor de la tabla para captura de imagen

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
      // Filtrar el dato de Activos Corrientes
      const activosCorrientesData = excelData[0].data.find(row => {
        const categoria = row.CATEGORIA.toLowerCase();
        return categoria.includes('activos corrientes');
      });

      // Filtrar el dato de Total Pasivos y Patrimonio
      const totalPasivosPatrimonioData = excelData[0].data.find(row => {
        return row.CATEGORIA.toLowerCase().includes('pasivos a corto plazo');
      });
      const totalPasivos = excelData[0].data.find(row => {
        return row.CATEGORIA.toLowerCase().includes('total pasivo');
      });
      const totalPatrimonio = excelData[0].data.find(row => {
        return row.CATEGORIA.toLowerCase().includes('subtotal patrimonio');
      });

      if (activosCorrientesData && totalPasivosPatrimonioData) {
        // Determinar los años disponibles dinámicamente
        const years = Object.keys(totalPasivosPatrimonioData).filter(key => key.startsWith('AÑO '));

        // Calcular el array de Ratio de Liquidez por cada año
        const liquidezCalculada = years.map(year => {
          const activosCorrientes = activosCorrientesData[year];
          const totalPasivosPatrimonio = totalPasivosPatrimonioData[year];
          const liquidez = activosCorrientes / totalPasivosPatrimonio;
          console.log(`Año ${year}: Activos Corrientes = ${activosCorrientes}, Total Pasivos y Patrimonio = ${totalPasivosPatrimonio}, Ratio de Liquidez = ${liquidez}`);
          return { year, value: liquidez };
        });

        setLiquidezData(liquidezCalculada);
        console.log('Ratio de Liquidez por Año:', liquidezCalculada);

        // Calcular el array de Ratio de Endeudamiento por cada año
        const endeudamientoCalculado = years.map(year => {
          const pasivoTotal = totalPasivos[year] - totalPatrimonio[year];
          const patrimonioNeto = totalPatrimonio[year];
          const endeudamiento = pasivoTotal / patrimonioNeto;
          console.log(`Año ${year}: Pasivo Total = ${pasivoTotal}, Patrimonio Neto = ${patrimonioNeto}, Ratio de Endeudamiento = ${endeudamiento}`);
          return { year, value: endeudamiento };
        });

        setEndeudamientoData(endeudamientoCalculado);
        console.log('Ratio de Endeudamiento por Año:', endeudamientoCalculado);
      }
    }
  }, [excelData]);

  const toggleExplanation = () => {
    setShowExplanation(!showExplanation);
  };

  const renderTable = () => {
    if (!excelData || !excelData[0] || !excelData[0].data) return null;

    const years = Object.keys(excelData[0].data[0]).filter(header => header.startsWith('AÑO '));

    return (
      <TableContainer component={Paper} style={{ width: '100%', marginTop: '20px' }}>
        <Table ref={tableRef}>
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
                <TableCell align="center">
                  {liquidezData.find(item => item.year === year)?.value.toFixed(2) ?? '-'}%
                </TableCell>
                <TableCell align="center">
                  {endeudamientoData.find(item => item.year === year)?.value.toFixed(2) ?? '-'}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const exportPDF = () => {
    if (!tableRef.current) return;

    const input = tableRef.current;

    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('analisis_horizontal.pdf');
    });
  };

  return (
    <Admin>
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '20px' }}>
          <Typography variant="h4" component="h1" gutterBottom>Ratios Financieros</Typography>
          <Button variant="contained" onClick={exportPDF}>
            Exportar PDF
          </Button>
        </div>
        {renderTable()}
        <Button onClick={toggleExplanation} style={{ marginTop: '20px' }}>
          {showExplanation ? 'Ocultar Nota' : 'Mostrar Nota'}
        </Button>
        {showExplanation && (
          <List style={{ marginTop: '10px', textAlign: 'left', paddingLeft: '10px' }}>
            <ListItem>
              <ListItemText>
                <strong>Ratio de Liquidez:</strong> Se calcula como Activos Corrientes dividido por Pasivos a Corto Plazo.
              </ListItemText>
            </ListItem>
            <ListItem>
              <ListItemText>
                <strong>Ratio de Endeudamiento:</strong> Se calcula como Pasivo Total dividido por Patrimonio Neto.
              </ListItemText>
            </ListItem>
            <Typography variant="body2" style={{ marginTop: '10px', textAlign: 'left', paddingLeft: '10px' }}>
              Ambos ratios proporcionan información sobre la salud financiera y la estructura de financiamiento de la empresa.
            </Typography>
          </List>
        )}
      </main>
    </Admin>
  );
}
