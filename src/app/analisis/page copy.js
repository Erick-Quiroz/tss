'use client';
import Admin from '../components/layout/admin/Admin';
import { useState, useEffect } from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { blueGrey } from '@mui/material/colors';

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
  const [availableYears, setAvailableYears] = useState([]); // Array para almacenar los años disponibles
  const [selectedYear1, setSelectedYear1] = useState(''); // Año seleccionado para año 1
  const [selectedYear2, setSelectedYear2] = useState(''); // Año seleccionado para año 2

  useEffect(() => {
    fetch('/api/finanza')
      .then(response => response.json())
      .then(data => {
        console.log('Datos de la API cargados:', data);
        if (data && data.data && data.data.length > 0 && data.data[0].data && data.data[0].data.length > 0) {
          const years = Object.keys(data.data[0].data[0]).filter(key => key.startsWith('año'));
          setAvailableYears(years);
          setSelectedYear1(years[0]); // Establecer el primer año como seleccionado por defecto para año 1
          setSelectedYear2(years[1]); // Establecer el segundo año como seleccionado por defecto para año 2
          setExcelData(data.data);
        }
      })
      .catch(error => {
        console.error('Error al cargar datos de la API:', error);
      });
  }, []);

  const handleYear1Change = (event) => {
    setSelectedYear1(event.target.value);
  };

  const handleYear2Change = (event) => {
    setSelectedYear2(event.target.value);
  };

  const renderTable = () => {
    if (!excelData || !excelData[0] || !excelData[0].data) return null;

    const headers = ['CATEGORIA', selectedYear1, selectedYear2, 'Variación Absoluta $', 'Variación Relativa %']; // Encabezados dinámicos según los años seleccionados

    // Filtrar y calcular los datos correspondientes a los años seleccionados
    const filteredData = calculateHorizontalVariations(excelData[0].data);

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
            {filteredData.map((row, rowIndex) => (
              <TableRow key={rowIndex} style={{ backgroundColor: rowIndex % 2 === 0 ? blueGrey[50] : 'transparent' }}>
                {headers.map((header, headerIndex) => (
                  <TableCell key={headerIndex} align="center">
                    {header === 'Variación Relativa %' ? `${row[header]}%` : row[header]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const calculateHorizontalVariations = (data) => {
    // Verificar que los años seleccionados no estén vacíos
    if (!selectedYear1 || !selectedYear2) return data;

    return data.map(row => {
      const valueYear1 = parseInt(row[selectedYear1], 10);
      const valueYear2 = parseInt(row[selectedYear2], 10);
      const absoluteVariation = valueYear2 - valueYear1;
      const relativeVariation = valueYear1 !== 0 ? ((valueYear2 - valueYear1) / valueYear1) * 100 : 0; // Evita división por cero

      return {
        ...row,
        'Variación Absoluta $': absoluteVariation,
        'Variación Relativa %': relativeVariation.toFixed(2),
      };
    });
  };

  return (
    <Admin>
  <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
    <Grid container justifyContent="center" spacing={2} style={{ marginBottom: '20px' }}>
      <Typography variant="h6" style={{ marginRight: '10px', alignSelf: 'center' }}>Seleccione el rango de año:</Typography>
      <Grid item>
        <FormControl style={{ width: '100%' }}>
          <Select
            labelId="year1-select-label"
            id="year1-select"
            value={selectedYear1}
            onChange={handleYear1Change}
            fullWidth
          >
            {availableYears.map((year, index) => (
              <MenuItem key={index} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item>
        <FormControl style={{ width: '100%' }}>
          <Select
            labelId="year2-select-label"
            id="year2-select"
            value={selectedYear2}
            onChange={handleYear2Change}
            fullWidth
          >
            {availableYears.map((year, index) => (
              <MenuItem key={index} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
    {renderTable()}
  </main>
</Admin>

  );
}
