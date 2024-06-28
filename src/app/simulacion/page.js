'use client';
import React, { useState, useEffect } from 'react';
import { Typography, Button } from '@mui/material'; // Importar solo los componentes necesarios de Material-UI
import Admin from '../components/layout/admin/Admin'; // Importar el componente de diseño Admin

export default function Home() {
  const [excelData, setExcelData] = useState(null); // Estado para almacenar los datos de la API

  useEffect(() => {
    // Efecto de efecto secundario para cargar los datos de la API al montar el componente
    fetch('/api/finanza') // Llamar a la API de finanza
      .then(response => response.json()) // Parsear la respuesta a JSON
      .then(data => {
        console.log('Datos de la API cargados:', data); // Mostrar los datos en la consola
        setExcelData(data.data); // Establecer los datos de la API en el estado local
      })
      .catch(error => {
        console.error('Error al cargar datos de la API:', error); // Manejar errores si la API no responde correctamente
      });
  }, []);

  return (
    <Admin> {/* Renderizar el componente Admin para el diseño */}
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '20px' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Simulacion
          </Typography>
          
        </div>
        <div style={{ maxWidth: '80%', margin: '20px', overflowX: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Datos de la API:
          </Typography>
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(excelData, null, 2)} {/* Mostrar los datos de la API formateados en JSON */}
          </pre>
        </div>
      </main>
    </Admin>
  );
}
