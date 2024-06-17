"use client"
import Admin from './components/layout/admin/Admin'; // Asegúrate de que la ruta sea correcta
import { useState, useEffect } from 'react';
import { Button, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper } from '@mui/material';
import { styled } from '@mui/material/styles'; // Importar styled para definir estilos
import { blueGrey } from '@mui/material/colors'; // Importar colores predefinidos de MUI
import * as XLSX from 'xlsx';
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: blueGrey[100], // Color de fondo azul grisáceo claro predefinido
  color: theme.palette.text.primary, // Color de texto primario del tema
  fontWeight: 'bold', // Texto en negrita
  fontSize: '1rem', // Tamaño de fuente
  padding: '8px 16px', // Relleno de celda
  textAlign: 'center', // Alineación de texto al centro
}));
export default function Home() {
  const [apiData, setApiData] = useState(null);
  const [excelData, setExcelData] = useState(null);
  // Función para descargar la plantilla de Excel
  const handleDownload = () => {
    const filePath = 'excel/plantilla.xlsx';
    const link = document.createElement('a');
    link.href = filePath;
    link.setAttribute('download', 'plantilla.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const sendDataToAPI = (data) => {
    // Aquí debes implementar la lógica para enviar 'data' a tu API
    // Ejemplo:
    fetch('http://localhost:3000/api/finanza', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Aquí puedes incluir otros headers necesarios
      },
      body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Respuesta de la API:', data);
      // Aquí puedes manejar la respuesta de la API como lo necesites
    })
    .catch(error => {
      console.error('Error al enviar datos a la API:', error);
      // Aquí puedes manejar los errores de la solicitud a la API
    });
  };
  // Función para subir el archivo Excel y procesar los datos
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const headers = jsonData[0];
      const rows = jsonData.slice(0);

      const excelDataObject = {};

      // Iterar sobre cada fila del Excel
      rows.forEach((row) => {
        const CATEGORIA = row[0]; // Suponiendo que la primera columna define la categoría
        for (let i = 1; i < headers.length; i++) {
          const header = headers[i];
          const value = row[i];

          if (!excelDataObject[CATEGORIA]) {
            excelDataObject[CATEGORIA] = {};
          }

          excelDataObject[CATEGORIA][header] = value;
        }
      });

      setExcelData(excelDataObject);
      // Aquí puedes llamar a tu función para enviar excelDataObject a tu API
      sendDataToAPI(excelDataObject);
    };

    reader.readAsArrayBuffer(file);
  };

  // Función para cargar los datos de la API al montar el componente
  useEffect(() => {
    fetch('http://localhost:3000/api/finanza')
      .then(response => response.json())
      .then(data => {
        console.log('Datos de la API cargados:', data);
        setApiData(data.data[0]); // Establecer los datos del primer elemento de `data`
      })
      .catch(error => {
        console.error('Error al cargar datos de la API:', error);
        // Aquí puedes manejar los errores de la solicitud a la API
      });
  }, []);

  // Función para renderizar la tabla
  const renderTable = () => {
    if (!apiData) return null;

    return (
      <TableContainer component={Paper} style={{ maxWidth: '800px', width: '100%', marginTop: '20px' }}>
        <Table>
          
          <TableBody>
            {Object.keys(apiData).map((CATEGORIA, index) => {
              // Excluir la fila '_id' si existe
              if (CATEGORIA === '_id' || CATEGORIA === '__v') return null;

              return (
                <TableRow key={index}>
                  <StyledTableCell component="th" scope="row">
                    {CATEGORIA === 'Activos' ? 'Activos personalizados' : CATEGORIA}
                  </StyledTableCell>
                  <TableCell align="right">{apiData[CATEGORIA]['Año 1']}</TableCell>
                  <TableCell align="right">{apiData[CATEGORIA]['Año 2']}</TableCell>
                  <TableCell align="right">{apiData[CATEGORIA]['Año 3']}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  return (
    <Admin>
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ marginBottom: '20px' }}>
        <Button variant="contained" onClick={handleDownload}>
          Descargar Plantilla
        </Button>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button variant="contained" component="span">
            Subir Excel
          </Button>
        </label>
      </div>
      {renderTable()}
    </main>
    </Admin>
  );
}
