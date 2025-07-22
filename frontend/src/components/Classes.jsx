import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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

const socket = io(import.meta.env.VITE_API_URL);

function Classes() {
  const { t } = useTranslation();
  const [classes, setClasses] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClasse, setSelectedClasse] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    niveau: '',
    description: '',
    nombreEleves: ''
  });
  const [error, setError] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [contextMenuClasse, setContextMenuClasse] = useState(null);

  const tableHeaderStyle = {
    backgroundColor: '#1976d2 !important',
    color: 'white !important',
    fontWeight: 'bold !important',
    padding: '12px !important',
    textAlign: 'center !important',
    borderRadius: '8px 8px 0 0 !important'
  };

  useEffect(() => {
    // Demander la liste des classes au chargement
    socket.emit('getClasses');

    // Écouter les mises à jour
    socket.on('classesUpdate', (data) => {
      setClasses(data);
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
      socket.off('classesUpdate');
      socket.off('error');
      socket.off('success');
    };
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      nom: '',
      niveau: '',
      description: '',
      nombreEleves: ''
    });
    setError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (classe) => {
    setSelectedClasse(classe);
    setFormData({
      nom: classe.nom,
      niveau: classe.niveau,
      description: classe.description || '',
      nombreEleves: classe.nombreEleves
    });
    setError('');
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedClasse(null);
    setError('');
  };

  const handleSubmit = () => {
    if (!formData.nom || !formData.niveau || !formData.nombreEleves) {
      setError('Le nom, le niveau et le nombre d\'élèves sont requis');
      return;
    }

    if (selectedClasse) {
      // Mise à jour
      socket.emit('updateClasse', {
        _id: selectedClasse._id,
        ...formData
      });
    } else {
      // Ajout
      socket.emit('addClasse', formData);
    }
  };

  const handleDelete = (classe) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) {
      socket.emit('deleteClasse', classe._id);
    }
  };

  const handleContextMenu = (event, classe) => {
    event.preventDefault();
    setContextMenuClasse(classe);
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
    setContextMenuClasse(null);
  };

  const handleEditFromContextMenu = () => {
    if (contextMenuClasse) {
      handleOpenEditModal(contextMenuClasse);
      handleCloseContextMenu();
    }
  };

  const handleDeleteFromContextMenu = () => {
    if (contextMenuClasse) {
      handleDelete(contextMenuClasse);
      handleCloseContextMenu();
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('classes.title')}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddModal}
          >
            {t('classes.addClass')}
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
                }}>{t('classes.name')}</TableCell>
                <TableCell sx={{
                  backgroundColor: '#1976d2 !important',
                  color: 'white !important',
                  fontWeight: 'bold !important',
                  padding: '12px !important',
                  textAlign: 'center !important',
                  borderRadius: '8px 8px 0 0 !important'
                }}>{t('classes.level')}</TableCell>
                <TableCell sx={{
                  backgroundColor: '#1976d2 !important',
                  color: 'white !important',
                  fontWeight: 'bold !important',
                  padding: '12px !important',
                  textAlign: 'center !important',
                  borderRadius: '8px 8px 0 0 !important'
                }}>{t('classes.numberOfStudents')}</TableCell>
                <TableCell sx={{
                  backgroundColor: '#1976d2 !important',
                  color: 'white !important',
                  fontWeight: 'bold !important',
                  padding: '12px !important',
                  textAlign: 'center !important',
                  borderRadius: '8px 8px 0 0 !important'
                }}>{t('classes.description')}</TableCell>
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
              {classes.map((classe) => (
                <TableRow
                  key={classe._id}
                  onContextMenu={(e) => handleContextMenu(e, classe)}
                >
                  <TableCell>{classe.nom}</TableCell>
                  <TableCell>{classe.niveau}</TableCell>
                  <TableCell>{classe.nombreEleves}</TableCell>
                  <TableCell>{classe.description}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleOpenEditModal(classe)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(classe)}
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
            {isAddModalOpen ? t('classes.addClass') : t('classes.editClass')}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label={t('classes.name')}
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label={t('classes.level')}
              value={formData.niveau}
              onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label={t('classes.numberOfStudents')}
              value={formData.nombreEleves}
              onChange={(e) => setFormData({ ...formData, nombreEleves: e.target.value })}
              margin="normal"
              type="number"
              required
            />
            <TextField
              fullWidth
              label={t('classes.description')}
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

export default Classes; 