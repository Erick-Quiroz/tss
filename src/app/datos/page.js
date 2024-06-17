'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { blue } from '@mui/material/colors';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import Admin from '../components/layout/admin/Admin';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import GetAppIcon from '@material-ui/icons/GetApp';
import EditIcon from '@material-ui/icons/Edit';
import SaveAltIcon from '@material-ui/icons/SaveAlt';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: blue[500],
  color: theme.palette.common.white,
  fontWeight: 'bold',
  fontSize: '1rem',
  padding: '8px 16px',
  textAlign: 'center',
}));

const StyledTableRow = styled(TableRow)(({ theme, index }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: index % 2 === 0 ? theme.palette.action.hover : 'transparent',
  },
}));

const Home = () => {
  const [excelData, setExcelData] = useState(null);
  const [existingData, setExistingData] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editButtonText, setEditButtonText] = useState('Editar');
  const router = useRouter();

  useEffect(() => {
    // Check if there is existing data
    fetch('/api/finanza')
      .then(response => response.json())
      .then(data => {
        if (data && data.data.length > 0) {
          setExistingData(true);
        }
      })
      .catch(error => {
        console.error('Error al cargar datos existentes:', error);
      });
  }, []);

  const handleDownload = () => {
    const filePath = 'excel/plantilla.xlsx';
    const link = document.createElement('a');
    link.href = filePath;
    link.setAttribute('download', 'plantilla.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  
    // Mostrar mensaje de recomendación con formato mejorado
    Swal.fire({
      icon: 'info',
      title: 'Recomendación de Formato',
      html: `
        <p>Antes de subir o guardar el archivo Excel:</p>
        <ul style="text-align: left;">
          <li>Asegúrate de que la primera fila esté en mayúsculas.</li>
          <li>Verifica que los subtotales y totales también estén en mayúsculas.</li>
        </ul>
      `,
      confirmButtonText: 'Entendido',
      footer: '<p style="font-size: 0.8rem;">Este mensaje te ayuda a mantener un formato consistente.</p>'
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Filtrar filas vacías
      const filteredRows = jsonData.filter(row => row.some(cell => !!cell));

      if (filteredRows.length === 0) {
        // Mostrar mensaje de error o indicar que no hay datos válidos
        Swal.fire({
          title: 'Error',
          text: 'No se encontraron datos válidos en el archivo Excel.',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
        return;
      }

      const headers = filteredRows[0];
      const dataRows = filteredRows.slice(1);

      const excelDataObject = {};

      dataRows.forEach((row) => {
        const CATEGORIA = row[0];
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
      setEditing(false);
      setEditButtonText('Editar');
    };

    reader.readAsArrayBuffer(file);
  };

  const toggleEditTable = () => {
    setEditing(!editing);
    setEditButtonText(editing ? 'Editar' : 'Cancelar edición');
  };

  const handleCellChange = (CATEGORIA, header, value) => {
    setExcelData(prevData => ({
      ...prevData,
      [CATEGORIA]: {
        ...prevData[CATEGORIA],
        [header]: value
      }
    }));
  };

  const renderTable = () => {
    if (!excelData) return null;

    return (
      <TableContainer component={Paper} style={{ width: '100%', marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>CATEGORIA</StyledTableCell>
              {Object.keys(excelData[Object.keys(excelData)[0]]).map((header, index) => (
                <StyledTableCell key={index} align="right">{header}</StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(excelData).map((CATEGORIA, index) => (
              <StyledTableRow key={CATEGORIA} index={index}>
                <StyledTableCell component="th" scope="row">
                  {CATEGORIA}
                </StyledTableCell>
                {Object.keys(excelData[CATEGORIA]).map((header, index) => (
                  <TableCell key={index} align="right">
                    {editing ? (
                      <TextField
                        value={excelData[CATEGORIA][header]}
                        onChange={(e) => handleCellChange(CATEGORIA, header, e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      excelData[CATEGORIA][header]
                    )}
                  </TableCell>
                ))}
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const saveDataToDB = () => {
    if (!excelData) return;

    fetch('/api/finanza', {
      method: 'DELETE'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return fetch('/api/finanza', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: Object.entries(excelData).map(([CATEGORIA, values]) => ({
              CATEGORIA,
              ...values,
            }))
          }),
        });
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Datos guardados correctamente',
          icon: 'success',
          confirmButtonText: 'Ok'
        }).then(() => {
          router.push('/');
        });
      })
      .catch(error => {
        console.error('Error al guardar datos:', error);
        Swal.fire({
          title: 'Error',
          text: 'Hubo un error al guardar los datos',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
      });
  };

  const saveChanges = () => {
    if (existingData) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'Existen datos cargados. ¿Estás seguro de que deseas borrar los datos existentes y cargar nuevos?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'No, cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          saveDataToDB();
          setEditing(false);
          setEditButtonText('Editar');
        }
      });
    } else {
      saveDataToDB();
      setEditing(false);
      setEditButtonText('Editar');
    }
  };

  return (
    <Admin>
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: '800px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Button variant="contained" 
            color="secondary" 
            style={{ marginRight: '10px' , background:'#864640' }}
            startIcon={<GetAppIcon />}
            onClick={handleDownload} 
            >
              Descargar Plantilla
            </Button>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button 
              variant="contained" 
              component="span" 
              color="primary"
              startIcon={<CloudUploadIcon />}
              style={{ marginRight: '10px' , background:'#673265' }}
              >
                Subir Excel
              </Button>
            </label>
          </div>
          {excelData && (
            <div>
              <Button variant="contained" startIcon={<EditIcon />} onClick={toggleEditTable} style={{ marginRight: '10px' , background:'#fca61d' }}>
                {editButtonText}
              </Button>
              <Button 
              variant="contained" 
              startIcon={<SaveAltIcon />}
              onClick={saveChanges} 
              style={{ marginRight: '10px' , background:'#267e1b' }}>
                Guardar Datos
              </Button>
            </div>
            
          )}
        </div>
        {renderTable()}
      </main>
    </Admin>
  );
};

export default Home;
