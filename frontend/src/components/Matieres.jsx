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
  ListItemText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import io from 'socket.io-client';
import { useTranslation } from 'react-i18next';

const socket = io(import.meta.env.VITE_API_URL);

function Matieres() {
  const { t } = useTranslation();
  const [matieres, setMatieres] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMatiere, setSelectedMatiere] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [contextMenuMatiere, setContextMenuMatiere] = useState(null);

  useEffect(() => {
    // Demander la liste des matières au chargement
    socket.emit('getMatieres');

    // Écouter les mises à jour
    socket.on('matieresUpdate', (data) => {
      setMatieres(data);
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
      socket.off('matieresUpdate');
      socket.off('error');
      socket.off('success');
    };
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      nom: '',
      description: ''
    });
    setError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (matiere) => {
    setSelectedMatiere(matiere);
    setFormData({
      nom: matiere.nom,
      description: matiere.description || ''
    });
    setError('');
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedMatiere(null);
    setError('');
  };

  const handleSubmit = () => {
    if (!formData.nom) {
      setError('Le nom de la matière est requis');
      return;
    }

    if (selectedMatiere) {
      // Mise à jour
      socket.emit('updateMatiere', {
        _id: selectedMatiere._id,
        ...formData
      });
    } else {
      // Ajout
      socket.emit('addMatiere', formData);
    }
  };

  const handleDelete = (matiere) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) {
      socket.emit('deleteMatiere', matiere._id);
    }
  };

  const handleContextMenu = (event, matiere) => {
    event.preventDefault();
    setContextMenuMatiere(matiere);
    setContextMenu({
      x: event.clientX,
      y: event.clientY
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
    setContextMenuMatiere(null);
  };

  const handleEditFromContextMenu = () => {
    if (contextMenuMatiere) {
      handleOpenEditModal(contextMenuMatiere);
      handleCloseContextMenu();
    }
  };

  const handleDeleteFromContextMenu = () => {
    if (contextMenuMatiere) {
      handleDelete(contextMenuMatiere);
      handleCloseContextMenu();
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('subjects.title')}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddModal}
          >
            {t('subjects.addSubject')}
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
                }}>{t('subjects.name')}</TableCell>
                <TableCell sx={{
                  backgroundColor: '#1976d2 !important',
                  color: 'white !important',
                  fontWeight: 'bold !important',
                  padding: '12px !important',
                  textAlign: 'center !important',
                  borderRadius: '8px 8px 0 0 !important'
                }}>{t('subjects.description')}</TableCell>
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
              {matieres.map((matiere) => (
                <TableRow
                  key={matiere._id}
                  onContextMenu={(e) => handleContextMenu(e, matiere)}
                >
                  <TableCell>{matiere.nom}</TableCell>
                  <TableCell>{matiere.description}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleOpenEditModal(matiere)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(matiere)}
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
            {isAddModalOpen ? t('subjects.addSubject') : t('subjects.editSubject')}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label={t('subjects.name')}
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label={t('subjects.description')}
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

export default Matieres; 