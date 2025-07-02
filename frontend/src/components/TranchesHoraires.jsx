import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Container,
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
  Typography,
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

function TranchesHoraires() {
  const { t } = useTranslation();
  const socket = useRef(null);
  const [uhrs, setUhrs] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedUhr, setSelectedUhr] = useState(null);
  const [formData, setFormData] = useState({
    nummer: '',
    start: '',
    ende: ''
  });
  const [error, setError] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [contextMenuUhr, setContextMenuUhr] = useState(null);

  useEffect(() => {
    socket.current = io('http://localhost:5000');

    socket.current.on('uhrsUpdate', (data) => {
      console.log('Mise à jour des tranches horaires reçue:', data);
      setUhrs(data);
    });

    socket.current.on('error', (error) => {
      console.error('Erreur WebSocket:', error);
      setError(error);
    });

    socket.current.emit('getUhrs');

    return () => {
      socket.current.disconnect();
    };
  }, []);

  const handleOpenModal = (uhr = null) => {
    if (uhr) {
      setSelectedUhr(uhr);
      setFormData({
        nummer: uhr.nummer,
        start: uhr.start,
        ende: uhr.ende
      });
    } else {
      setSelectedUhr(null);
      setFormData({
        nummer: '',
        start: '',
        ende: ''
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedUhr(null);
    setFormData({
      nummer: '',
      start: '',
      ende: ''
    });
    setError('');
  };

  const handleSubmit = () => {
    if (!formData.nummer || !formData.start || !formData.ende) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    // Vérifier le format de l'heure (HH:MM)
    const timeFormat = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeFormat.test(formData.start) || !timeFormat.test(formData.ende)) {
      setError('Format d\'heure invalide. Utilisez le format HH:MM');
      return;
    }

    if (selectedUhr) {
      console.log('Envoi de la mise à jour de la tranche horaire:', {
        _id: selectedUhr._id,
        ...formData
      });
      socket.current.emit('updateUhr', {
        _id: selectedUhr._id,
        ...formData
      });
    } else {
      console.log('Envoi de l\'ajout de la tranche horaire:', formData);
      socket.current.emit('addUhr', formData);
    }

    handleCloseModal();
  };

  const handleDelete = (uhrId) => {
    if (window.confirm(t('timeSlots.confirmDelete'))) {
      socket.current.emit('deleteUhr', uhrId);
    }
  };

  const handleContextMenu = (event, uhr) => {
    event.preventDefault();
    setContextMenuUhr(uhr);
    setContextMenu({
      x: event.clientX,
      y: event.clientY
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
    setContextMenuUhr(null);
  };

  const handleEditFromContextMenu = () => {
    if (contextMenuUhr) {
      handleOpenModal(contextMenuUhr);
      handleCloseContextMenu();
    }
  };

  const handleDeleteFromContextMenu = () => {
    if (contextMenuUhr) {
      handleDelete(contextMenuUhr._id);
      handleCloseContextMenu();
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('timeSlots.title')}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
          >
            {t('timeSlots.addTimeSlot')}
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
                }}>{t('timeSlots.number')}</TableCell>
                <TableCell sx={{
                  backgroundColor: '#1976d2 !important',
                  color: 'white !important',
                  fontWeight: 'bold !important',
                  padding: '12px !important',
                  textAlign: 'center !important',
                  borderRadius: '8px 8px 0 0 !important'
                }}>{t('timeSlots.time')}</TableCell>
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
              {uhrs.map((uhr) => (
                <TableRow
                  key={uhr._id}
                  onContextMenu={(e) => handleContextMenu(e, uhr)}
                >
                  <TableCell>{uhr.nummer}</TableCell>
                  <TableCell>{uhr.start} - {uhr.ende}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleOpenModal(uhr)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(uhr._id)}
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

        <Dialog open={openModal} onClose={handleCloseModal}>
          <DialogTitle>
            {selectedUhr ? t('timeSlots.editTimeSlot') : t('timeSlots.addTimeSlot')}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label={t('timeSlots.number')}
              type="number"
              value={formData.nummer}
              onChange={(e) => setFormData({ ...formData, nummer: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label={t('timeSlots.startTime')}
              value={formData.start}
              onChange={(e) => setFormData({ ...formData, start: e.target.value })}
              margin="normal"
              required
              placeholder={t('timeSlots.timeFormat')}
              helperText={t('timeSlots.timeFormat')}
            />
            <TextField
              fullWidth
              label={t('timeSlots.endTime')}
              value={formData.ende}
              onChange={(e) => setFormData({ ...formData, ende: e.target.value })}
              margin="normal"
              required
              placeholder={t('timeSlots.timeFormat')}
              helperText={t('timeSlots.timeFormat')}
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

export default TranchesHoraires; 