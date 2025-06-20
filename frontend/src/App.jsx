import React, { Suspense, useEffect, useState } from 'react';
import { Box, Toolbar, CircularProgress, AppBar, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Typography, useTheme, alpha } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import RoomIcon from '@mui/icons-material/Room';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BookIcon from '@mui/icons-material/Book';
import LogoutIcon from '@mui/icons-material/Logout';
import BarChartIcon from '@mui/icons-material/BarChart';
import LanguageSwitcher from './components/LanguageSwitcher';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { Route, Routes, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Planning from './components/Planning';
import Menu from './components/Menu';
import Dashboard from './components/Dashboard';
import Enseignants from './components/Enseignants';
import Matieres from './components/Matieres';
import Classes from './components/Classes';
import Salles from './components/Salles';
import TranchesHoraires from './components/TranchesHoraires';
import ProtectedRoute from './components/ProtectedRoute';
import InitialSetup from './components/InitialSetup';
import Statistiques from './components/Statistiques';
import { useTranslation } from 'react-i18next';
import './App.css';

function App() {
  // Vérifier si l'utilisateur est authentifié (token présent)
  const isAuthenticated = !!localStorage.getItem('token');
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();
  
  // Vérifier si nous sommes sur une page qui ne nécessite pas l'affichage du menu
  const isLoginPage = location.pathname === '/login';
  const isInitialSetupPage = location.pathname === '/initial-setup';
  const shouldHideAppBar = isLoginPage || isInitialSetupPage;

  // Détermine le chemin actif pour le surlignage dans le menu
  const isActivePath = (path) => location.pathname === path;

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Style commun pour les éléments de menu
  const menuItemStyle = (path) => ({
    borderRadius: '8px',
    margin: '5px 10px',
    padding: '8px 12px',
    color: isActivePath(path) ? theme.palette.primary.main : theme.palette.text.primary,
    backgroundColor: isActivePath(path) ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
    '&:hover': {
      backgroundColor: isActivePath(path) 
        ? alpha(theme.palette.primary.main, 0.15) 
        : alpha(theme.palette.primary.main, 0.08),
      color: isActivePath(path) ? theme.palette.primary.main : theme.palette.primary.dark
    }
  });

  // Style pour les icônes du menu
  const menuIconStyle = (path) => ({
    color: isActivePath(path) ? theme.palette.primary.main : theme.palette.text.secondary,
    minWidth: '40px'
  });

  const drawer = (
    <Box sx={{ 
      width: 280,
      background: theme.palette.background.default,
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ 
        p: 3, 
        textAlign: 'center', 
        background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
        color: 'white',
        boxShadow: '0 3px 5px rgba(0,0,0,0.1)'
      }}>
        <Typography variant="h5" fontWeight="bold">Geco-SchoolPlan</Typography>
        <Typography variant="subtitle2" sx={{ opacity: 0.85 }}>{t('common.menuSubtitle', 'Gestion de planning scolaire')}</Typography>
      </Box>
      
      <Box sx={{ p: 2 }}>
        <Typography variant="overline" color="text.secondary" sx={{ px: 2, fontSize: '0.75rem', fontWeight: 'bold' }}>
          {t('navigation.mainMenu', 'Menu principal')}
        </Typography>
      </Box>
      
      <List sx={{ px: 1, flex: 1 }}>
        <ListItem 
          component={Link} 
          to="/planning" 
          sx={menuItemStyle('/planning')}
          onClick={() => setDrawerOpen(false)}
        >
          <ListItemIcon sx={menuIconStyle('/planning')}>
            <CalendarMonthIcon />
          </ListItemIcon>
          <ListItemText 
            primary={t('navigation.planning', 'Planning')} 
            primaryTypographyProps={{
              fontWeight: isActivePath('/planning') ? 'bold' : 'normal'
            }}
          />
        </ListItem>
        
        <ListItem 
          component={Link} 
          to="/enseignants" 
          sx={menuItemStyle('/enseignants')}
          onClick={() => setDrawerOpen(false)}
        >
          <ListItemIcon sx={menuIconStyle('/enseignants')}>
            <SchoolIcon />
          </ListItemIcon>
          <ListItemText 
            primary={t('navigation.teachers', 'Enseignants')} 
            primaryTypographyProps={{
              fontWeight: isActivePath('/enseignants') ? 'bold' : 'normal'
            }}
          />
        </ListItem>
        
        <ListItem 
          component={Link} 
          to="/matieres" 
          sx={menuItemStyle('/matieres')}
          onClick={() => setDrawerOpen(false)}
        >
          <ListItemIcon sx={menuIconStyle('/matieres')}>
            <BookIcon />
          </ListItemIcon>
          <ListItemText 
            primary={t('navigation.subjects', 'Matières')} 
            primaryTypographyProps={{
              fontWeight: isActivePath('/matieres') ? 'bold' : 'normal'
            }}
          />
        </ListItem>
        
        <ListItem 
          component={Link} 
          to="/classes" 
          sx={menuItemStyle('/classes')}
          onClick={() => setDrawerOpen(false)}
        >
          <ListItemIcon sx={menuIconStyle('/classes')}>
            <ClassIcon />
          </ListItemIcon>
          <ListItemText 
            primary={t('navigation.classes', 'Classes')} 
            primaryTypographyProps={{
              fontWeight: isActivePath('/classes') ? 'bold' : 'normal'
            }}
          />
        </ListItem>
        
        <ListItem 
          component={Link} 
          to="/salles" 
          sx={menuItemStyle('/salles')}
          onClick={() => setDrawerOpen(false)}
        >
          <ListItemIcon sx={menuIconStyle('/salles')}>
            <RoomIcon />
          </ListItemIcon>
          <ListItemText 
            primary={t('navigation.rooms', 'Salles')} 
            primaryTypographyProps={{
              fontWeight: isActivePath('/salles') ? 'bold' : 'normal'
            }}
          />
        </ListItem>
        
        <ListItem 
          component={Link} 
          to="/tranches-horaires" 
          sx={menuItemStyle('/tranches-horaires')}
          onClick={() => setDrawerOpen(false)}
        >
          <ListItemIcon sx={menuIconStyle('/tranches-horaires')}>
            <AccessTimeIcon />
          </ListItemIcon>
          <ListItemText 
            primary={t('navigation.timeSlots', 'Tranches horaires')} 
            primaryTypographyProps={{
              fontWeight: isActivePath('/tranches-horaires') ? 'bold' : 'normal'
            }}
          />
        </ListItem>
        
        <ListItem 
          component={Link} 
          to="/statistiques" 
          sx={menuItemStyle('/statistiques')}
          onClick={() => setDrawerOpen(false)}
        >
          <ListItemIcon sx={menuIconStyle('/statistiques')}>
            <BarChartIcon />
          </ListItemIcon>
          <ListItemText 
            primary={t('navigation.statistics', 'Statistiques')} 
            primaryTypographyProps={{
              fontWeight: isActivePath('/statistiques') ? 'bold' : 'normal'
            }}
          />
        </ListItem>
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      <List sx={{ px: 1, mb: 2 }}>
        <ListItem 
          onClick={handleLogout}
          sx={{
            ...menuItemStyle(''),
            color: theme.palette.error.main,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: alpha(theme.palette.error.main, 0.1)
            }
          }}
        >
          <ListItemIcon sx={{ color: theme.palette.error.main, minWidth: '40px' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary={t('navigation.logout', 'Déconnexion')} 
          />
        </ListItem>
      </List>
      
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          © 2023 Geco-SchoolPlan
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Suspense fallback={<Box display="flex" justifyContent="center" alignItems="center" height="100vh"><CircularProgress /></Box>}>
      <I18nextProvider i18n={i18n}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100vh',
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          {isAuthenticated && !shouldHideAppBar && (
            <>
              <AppBar position="static" elevation={1}>
                <Toolbar sx={{ 
                  borderBottom: 1, 
                  borderColor: 'divider', 
                  width: '100%',
                  padding: '0 16px'
                }}>
                  <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ mr: 2 }}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h1" fontWeight="bold">Geco-SchoolPlan</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LanguageSwitcher />
                  </Box>
                </Toolbar>
              </AppBar>
              <Drawer
                variant="temporary"
                open={drawerOpen}
                onClose={handleDrawerToggle}
                PaperProps={{
                  sx: {
                    width: 280,
                    borderRadius: '0 8px 8px 0',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }
                }}
                ModalProps={{
                  keepMounted: true // Meilleure performance sur mobile
                }}
              >
                {drawer}
              </Drawer>
            </>
          )}
          <Box sx={{ 
            flex: 1, 
            overflow: 'auto', 
            p: isAuthenticated && !shouldHideAppBar ? 2 : 0,
            width: '100%',
            maxWidth: '100%'
          }}>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/initial-setup" element={<InitialSetup />} />
              <Route path="/planning" element={
                <ProtectedRoute>
                  <Planning />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/enseignants" element={
                <ProtectedRoute>
                  <Enseignants />
                </ProtectedRoute>
              } />
              <Route path="/matieres" element={
                <ProtectedRoute>
                  <Matieres />
                </ProtectedRoute>
              } />
              <Route path="/classes" element={
                <ProtectedRoute>
                  <Classes />
                </ProtectedRoute>
              } />
              <Route path="/salles" element={
                <ProtectedRoute>
                  <Salles />
                </ProtectedRoute>
              } />
              <Route path="/tranches-horaires" element={
                <ProtectedRoute>
                  <TranchesHoraires />
                </ProtectedRoute>
              } />
              <Route path="/statistiques" element={
                <ProtectedRoute>
                  <Statistiques />
                </ProtectedRoute>
              } />
            </Routes>
          </Box>
        </Box>
      </I18nextProvider>
    </Suspense>
  );
}

export default App; 