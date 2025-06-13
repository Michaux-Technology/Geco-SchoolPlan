import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Typography,
  IconButton,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Menu,
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

const socket = io('http://localhost:5000');

function Enseignants() {
  const { t } = useTranslation();
  const [enseignants, setEnseignants] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEnseignant, setSelectedEnseignant] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    matieres: [],
    email: '',
    telephone: ''
  });
  const [error, setError] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [contextMenuEnseignant, setContextMenuEnseignant] = useState(null);

  useEffect(() => {
    // Demander la liste des enseignants et des matières au chargement
    socket.emit('getEnseignants');
    socket.emit('getMatieres');

    // Écouter les mises à jour des enseignants
    socket.on('enseignantsUpdate', (data) => {
      setEnseignants(data);
    });

    // Écouter les mises à jour des matières
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
      socket.off('enseignantsUpdate');
      socket.off('matieresUpdate');
      socket.off('error');
      socket.off('success');
    };
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      nom: '',
      prenom: '',
      matieres: [],
      email: '',
      telephone: ''
    });
    setError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (enseignant) => {
    setSelectedEnseignant(enseignant);
    setFormData({
      nom: enseignant.nom,
      prenom: enseignant.prenom,
      matieres: enseignant.matieres || [],
      email: enseignant.email || '',
      telephone: enseignant.telephone || ''
    });
    setError('');
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedEnseignant(null);
    setError('');
  };

  const handleSubmit = () => {
    if (!formData.nom || !formData.prenom || formData.matieres.length === 0) {
      setError(t('validation.allFieldsRequired'));
      return;
    }

    if (selectedEnseignant) {
      // Mise à jour
      socket.emit('updateEnseignant', {
        _id: selectedEnseignant._id,
        ...formData
      });
    } else {
      // Ajout
      socket.emit('addEnseignant', formData);
    }
  };

  const handleDelete = (enseignant) => {
    if (window.confirm(t('teachers.deleteTeacher'))) {
      socket.emit('deleteEnseignant', enseignant._id);
    }
  };

  const handleContextMenu = (event, enseignant) => {
    event.preventDefault();
    setContextMenuEnseignant(enseignant);
    setContextMenu({
      x: event.clientX,
      y: event.clientY
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
    setContextMenuEnseignant(null);
  };

  const handleEditFromContextMenu = () => {
    if (contextMenuEnseignant) {
      handleOpenEditModal(contextMenuEnseignant);
      handleCloseContextMenu();
    }
  };

  const handleDeleteFromContextMenu = () => {
    if (contextMenuEnseignant) {
      handleDelete(contextMenuEnseignant);
      handleCloseContextMenu();
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('teachers.title')}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddModal}
          >
            {t('teachers.addTeacher')}
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
                  borderRadius: '8px 8px 0 0 !important',
                  width: '110px',
                  minWidth: '110px',
                  maxWidth: '110px'
                }} align="right">{t('teachers.lastName')}</TableCell>
                <TableCell sx={{
                  backgroundColor: '#1976d2 !important',
                  color: 'white !important',
                  fontWeight: 'bold !important',
                  padding: '12px !important',
                  textAlign: 'center !important',
                  borderRadius: '8px 8px 0 0 !important'
                }}>{t('teachers.firstName')}</TableCell>
                <TableCell sx={{
                  backgroundColor: '#1976d2 !important',
                  color: 'white !important',
                  fontWeight: 'bold !important',
                  padding: '12px !important',
                  textAlign: 'center !important',
                  borderRadius: '8px 8px 0 0 !important'
                }}>{t('teachers.email')}</TableCell>
                <TableCell sx={{
                  backgroundColor: '#1976d2 !important',
                  color: 'white !important',
                  fontWeight: 'bold !important',
                  padding: '12px !important',
                  textAlign: 'center !important',
                  borderRadius: '8px 8px 0 0 !important'
                }}>{t('teachers.phone')}</TableCell>
                <TableCell sx={{
                  backgroundColor: '#1976d2 !important',
                  color: 'white !important',
                  fontWeight: 'bold !important',
                  padding: '12px !important',
                  textAlign: 'center !important',
                  borderRadius: '8px 8px 0 0 !important'
                }}>{t('teachers.subjects')}</TableCell>
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
              {enseignants.map((enseignant) => (
                <TableRow
                  key={enseignant._id}
                  onContextMenu={(e) => handleContextMenu(e, enseignant)}
                >
                  <TableCell>{enseignant.nom}</TableCell>
                  <TableCell>{enseignant.prenom}</TableCell>
                  <TableCell>{enseignant.email}</TableCell>
                  <TableCell>{enseignant.telephone}</TableCell>
                  <TableCell>
                    {enseignant.matieres ? enseignant.matieres.join(', ') : ''}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleOpenEditModal(enseignant)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(enseignant)}
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
            {isAddModalOpen ? t('teachers.addTeacher') : t('teachers.editTeacher')}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label={t('teachers.lastName')}
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label={t('teachers.firstName')}
              value={formData.prenom}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label={t('teachers.email')}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
              type="email"
            />
            <TextField
              fullWidth
              label={t('teachers.phone')}
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>{t('teachers.subjects')}</InputLabel>
              <Select
                multiple
                value={formData.matieres}
                onChange={(e) => setFormData({ ...formData, matieres: e.target.value })}
                label={t('teachers.subjects')}
              >
                {matieres.map((matiere) => (
                  <MenuItem key={matiere._id} value={matiere.nom}>
                    {matiere.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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

export default Enseignants; 