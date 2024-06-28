// Admin.jsx

import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import Link from 'next/link';
export const drawerWidth = 240; // Exporta drawerWidth aquí
import TableChartIcon from '@mui/icons-material/TableChart';
import SwapVerticalCircleIcon from '@mui/icons-material/SwapVerticalCircle';
import SwapHorizontalCircleIcon from '@mui/icons-material/SwapHorizontalCircle';
import GridGoldenratioIcon from '@mui/icons-material/GridGoldenratio';
const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

const Admin = ({ children }) => {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
  const menuItems = [
    { text: "Inicio", icon: <TableChartIcon />, href: "/" }, 
    { text: "Análisis Vertical", icon: <SwapVerticalCircleIcon />, href: "/vertical" }, 
    { text: "Análisis Horizontal", icon: <SwapHorizontalCircleIcon />, href: "/horizontal" }, 
    { text: "Análisis De Tendencias", icon: <BubbleChartIcon />, href: "/analisis" }, 
    { text: "Ratios Financieros", icon: <GridGoldenratioIcon />, href: "/ratios-financieros" }, 
  ];
  const menuItems2 = [
    { text: "Cargar Datos", icon: <InboxIcon />, href: "/datos" }, 
    
  ];
  const menuItems3 = [
    { text: "Simulacion", icon: <InboxIcon />, href: "/simulacion" }, 
    
  ];
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
          ANÁLISIS DE ESTADOS FINANCIEROS
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
    {menuItems.map((item, index) => (
      <Link key={index} href={item.href} passHref>
        <ListItem disablePadding>
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: 2.5,
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{/* Ajuste de ancho mínimo para alinear los iconos */}
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>
      </Link>
    ))}
    {/* Estilo para anular los estilos predeterminados de los enlaces */}
    <style jsx global>{`
      a {
        text-decoration: none; /* Quitar subrayado */
        color: inherit; /* Heredar color del texto */
        cursor: pointer; /* Cambiar cursor a puntero */
      }
    `}</style>
  </List>
      <Divider />
      <List>
    {menuItems2.map((item, index) => (
      <Link key={index} href={item.href} passHref>
        <ListItem disablePadding>
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: 2.5,
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{/* Ajuste de ancho mínimo para alinear los iconos */}
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>
      </Link>
    ))}
    
    {/* Estilo para anular los estilos predeterminados de los enlaces */}
    <style jsx global>{`
      a {
        text-decoration: none; /* Quitar subrayado */
        color: inherit; /* Heredar color del texto */
        cursor: pointer; /* Cambiar cursor a puntero */
      }
    `}</style>
  </List>
  <Divider />
  <List>
    {menuItems3.map((item, index) => (
      <Link key={index} href={item.href} passHref>
        <ListItem disablePadding>
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: 2.5,
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{/* Ajuste de ancho mínimo para alinear los iconos */}
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>
      </Link>
    ))}
    
    {/* Estilo para anular los estilos predeterminados de los enlaces */}
    <style jsx global>{`
      a {
        text-decoration: none; /* Quitar subrayado */
        color: inherit; /* Heredar color del texto */
        cursor: pointer; /* Cambiar cursor a puntero */
      }
    `}</style>
  </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 1 }}>
        <DrawerHeader />
        {children}
      </Box>
    </Box>
  );
}

export default Admin;
