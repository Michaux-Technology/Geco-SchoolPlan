import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import io from 'socket.io-client';
import { useTranslation } from 'react-i18next';

const socket = io(import.meta.env.VITE_API_URL);

const TYPES_SALLE = [
  'Bibliothèque',
  'Gymnase',
  'Laboratoire',
  'Salle d\'art',
  'Salle de classe',
  'Salle de langue Etrangère',
  'Salle de musique',
  'Salle de sport',
  'Salle informatique',
  'Autre'
];

function Salles() {
  const { t } = useTranslation();
  const [salles, setSalles] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSalle, setSelectedSalle] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    capacite: '',
    description: '',
    type: 'Salle de classe'
  });
  const [error, setError] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [contextMenuSalle, setContextMenuSalle] = useState(null);

  const tableHeaderStyle = {
    backgroundColor: '#1976d2 !important',
    color: 'white !important',
    fontWeight: 'bold !important',
    padding: '12px !important',
    textAlign: 'center !important',
    borderRadius: '8px 8px 0 0 !important'
  };

  useEffect(() => {
    // Demander la liste des salles au chargement
    socket.emit('getSalles');

    // Écouter les mises à jour
    socket.on('sallesUpdate', (data) => {
      setSalles(data);
    });

    // Écouter les erreurs
    socket.on('error', (error) => {
      setError(error);
    });

    // Écouter les succès
    socket.on('success', (message) => {
      handleCloseModal();
    });

    // Nettoyer les écouteurs
    return () => {
      socket.off('sallesUpdate');
      socket.off('error');
      socket.off('success');
    };
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      nom: '',
      capacite: '',
      description: '',
      type: 'Salle de classe'
    });
    setError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (salle) => {
    setSelectedSalle(salle);
    setFormData({
      nom: salle.nom,
      capacite: salle.capacite,
      description: salle.description || '',
      type: salle.type
    });
    setError('');
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedSalle(null);
    setError('');
  };

  const handleSubmit = () => {
    if (!formData.nom || !formData.capacite) {
      setError('Le nom et la capacité sont requis');
      return;
    }

    if (selectedSalle) {
      // Mise à jour
      socket.emit('updateSalle', {
        _id: selectedSalle._id,
        ...formData
      });
    } else {
      // Ajout
      socket.emit('addSalle', formData);
    }
  };

  const handleDelete = (salle) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) {
      socket.emit('deleteSalle', salle._id);
    }
  };

  const handleContextMenu = (event, salle) => {
    event.preventDefault();
    setContextMenuSalle(salle);
    setContextMenu({
      x: event.clientX,
      y: event.clientY
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
    setContextMenuSalle(null);
  };

  const handleEditFromContextMenu = () => {
    if (contextMenuSalle) {
      handleOpenEditModal(contextMenuSalle);
      handleCloseContextMenu();
    }
  };

  const handleDeleteFromContextMenu = () => {
    if (contextMenuSalle) {
      handleDelete(contextMenuSalle);
      handleCloseContextMenu();
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('rooms.title')}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddModal}
          >
            {t('rooms.addRoom')}
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{
                  backgroundColor: '#1976d2 !important',
                  color: 'white !important',
                  fontWeight: 'bold !important',
                  padding: '12px !important',
                  textAlign: 'center !important',
                  borderRadius: '8px 8px 0 0 !important'
                }}>{t('rooms.name')}</TableCell>
                <TableCell sx={{
                  backgroundColor: '#1976d2 !important',
                  color: 'white !important',
                  fontWeight: 'bold !important',
                  padding: '12px !important',
                  textAlign: 'center !important',
                  borderRadius: '8px 8px 0 0 !important'
                }}>{t('rooms.type')}</TableCell>
                <TableCell sx={{
                  backgroundColor: '#1976d2 !important',
                  color: 'white !important',
                  fontWeight: 'bold !important',
                  padding: '12px !important',
                  textAlign: 'center !important',
                  borderRadius: '8px 8px 0 0 !important'
                }}>{t('rooms.capacity')}</TableCell>
                <TableCell sx={{
                  backgroundColor: '#1976d2 !important',
                  color: 'white !important',
                  fontWeight: 'bold !important',
                  padding: '12px !important',
                  textAlign: 'center !important',
                  borderRadius: '8px 8px 0 0 !important'
                }}>{t('rooms.description')}</TableCell>
                <TableCell sx={{
                  backgroundColor: '#1976d2 !important',
                  color: 'white !important',
                  fontWeight: 'bold !important',
                  padding: '12px !important',
                  textAlign: 'center !important',
                  borderRadius: '8px 8px 0 0 !important',
                  width: '113px',
                  minWidth: '113px',
                  maxWidth: '113px'
                }} align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salles.map((salle) => (
                <TableRow
                  key={salle._id}
                  onContextMenu={(e) => handleContextMenu(e, salle)}
                >
                  <TableCell>{salle.nom}</TableCell>
                  <TableCell>{salle.type}</TableCell>
                  <TableCell>{salle.capacite}</TableCell>
                  <TableCell>{salle.description}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleOpenEditModal(salle)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(salle)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={isAddModalOpen || isEditModalOpen} onClose={handleCloseModal}>
          <DialogTitle>
            {isAddModalOpen ? t('rooms.addRoom') : t('rooms.editRoom')}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label={t('rooms.name')}
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>{t('rooms.type')}</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                label={t('rooms.type')}
              >
                {TYPES_SALLE.map((type) => (
                  <MenuItem key={type} value={type}>
                    {t(`rooms.types.${type.toLowerCase().replace(/\s+/g, '')}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label={t('rooms.capacity')}
              value={formData.capacite}
              onChange={(e) => setFormData({ ...formData, capacite: e.target.value })}
              margin="normal"
              type="number"
            />
            <TextField
              fullWidth
              label={t('rooms.description')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>{t('common.cancel')}</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {t('common.save')}
            </Button>
          </DialogActions>
        </Dialog>

        <Menu
          open={contextMenu !== null}
          onClose={handleCloseContextMenu}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
          <MenuItem onClick={handleEditFromContextMenu}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('common.edit')}</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDeleteFromContextMenu}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('common.delete')}</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </Container>
  );
}

export default Salles; 