import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import io from 'socket.io-client';

const AddSurveillanceModal = ({
  open,
  onClose,
  enseignants,
  currentWeek,
  socket,
  selectedJour,
  selectedZeitslot,
  selectedPosition,
  existingSurveillance
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [newSurveillance, setNewSurveillance] = useState({
    enseignant: '',
    lieu: '',
    jour: selectedJour || '',
    position: selectedPosition || -1,
    zeitslot: selectedZeitslot || null
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingSurveillance) {
      setNewSurveillance({
        enseignant: existingSurveillance.enseignant,
        lieu: existingSurveillance.lieu,
        jour: selectedJour,
        position: existingSurveillance.position,
        zeitslot: selectedZeitslot
      });
    } else {
      // Pour une nouvelle surveillance, mettre à jour avec les données sélectionnées
      setNewSurveillance(prev => ({
        ...prev,
        jour: selectedJour || prev.jour,
        position: selectedPosition || prev.position,
        zeitslot: selectedZeitslot || prev.zeitslot
      }));
    }
  }, [existingSurveillance, selectedJour, selectedZeitslot, selectedPosition]);

  const handleAddSurveillance = () => {
    if (!socket) {
      console.error('Socket non initialisé');
      enqueueSnackbar(t('planning.surveillance.addError'), { variant: 'error' });
      return;
    }

    const currentYear = new Date().getFullYear();
    const weekNumber = getWeekNumber(currentWeek);
    const frenchDay = convertToFrenchDay(selectedJour || newSurveillance.jour);

    console.log('Debug - Données pour surveillance:', {
      selectedJour,
      newSurveillanceJour: newSurveillance.jour,
      frenchDay,
      currentYear,
      weekNumber,
      newSurveillance
    });

    const surveillanceData = {
      enseignant: newSurveillance.enseignant,
      lieu: newSurveillance.lieu,
      jour: frenchDay,
      position: newSurveillance.position,
      uhr: newSurveillance.zeitslot?._id || newSurveillance.zeitslot,
      semaine: weekNumber,
      annee: currentYear,
      type: 'entre_creneaux',
      duree: 1
    };

    console.log('Debug - surveillanceData envoyé:', surveillanceData);

    // Validation des champs requis
    if (!surveillanceData.enseignant) {
      enqueueSnackbar('L\'enseignant est requis', { variant: 'error' });
      return;
    }

    if (!surveillanceData.lieu) {
      enqueueSnackbar('Le lieu est requis', { variant: 'error' });
      return;
    }

    if (!surveillanceData.jour) {
      enqueueSnackbar('Le jour est requis', { variant: 'error' });
      return;
    }

    if (!surveillanceData.uhr) {
      enqueueSnackbar('Le créneau horaire est requis', { variant: 'error' });
      return;
    }

    if (!surveillanceData.semaine) {
      enqueueSnackbar('La semaine est requise', { variant: 'error' });
      return;
    }

    if (!surveillanceData.annee) {
      enqueueSnackbar('L\'année est requise', { variant: 'error' });
      return;
    }

    if (existingSurveillance) {
      // Mise à jour d'une surveillance existante
      socket.emit('updateSurveillance', {
        ...surveillanceData,
        _id: existingSurveillance._id
      });

      socket.once('surveillanceUpdated', () => {
        enqueueSnackbar(t('planning.surveillance.updated'), { variant: 'success' });
        onClose();
      });
    } else {
      // Ajout d'une nouvelle surveillance
      socket.emit('addSurveillance', surveillanceData);

      socket.once('surveillanceAdded', (surveillance) => {
        enqueueSnackbar(t('planning.surveillance.added'), { variant: 'success' });
        onClose();
      });
    }

    socket.once('surveillanceError', (error) => {
      console.error('Erreur lors de l\'opération sur la surveillance:', error);
      enqueueSnackbar(t('planning.surveillance.addError'), { variant: 'error' });
    });
  };

  const handleDeleteSurveillance = () => {
    if (!socket || !existingSurveillance) {
      console.error('Socket non initialisé ou surveillance non sélectionnée');
      enqueueSnackbar(t('planning.surveillance.deleteError'), { variant: 'error' });
      return;
    }

    if (window.confirm(t('planning.surveillance.confirmDelete'))) {
      socket.emit('deleteSurveillance', existingSurveillance._id);
      
      socket.once('surveillanceDeleted', () => {
        enqueueSnackbar(t('planning.surveillance.deleted'), { variant: 'success' });
        onClose();
      });

      socket.once('surveillanceError', (error) => {
        console.error('Erreur lors de la suppression de la surveillance:', error);
        enqueueSnackbar(t('planning.surveillance.deleteError'), { variant: 'error' });
      });
    }
  };

  const handleClose = () => {
    setNewSurveillance({
      enseignant: '',
      lieu: '',
      jour: '',
      position: -1,
      zeitslot: null
    });
    setError('');
    onClose();
  };

  // Fonction pour obtenir le numéro de la semaine
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  // Fonction pour convertir le jour traduit vers le format français
  const convertToFrenchDay = (translatedDay) => {
    if (!translatedDay) {
      console.warn('convertToFrenchDay: jour non défini ou invalide', { translatedDay });
      return 'Lundi';
    }

    const joursFrancais = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    if (joursFrancais.includes(translatedDay)) {
      return translatedDay;
    }

    const dayMappings = {
      [t('planning.days.monday')]: 'Lundi',
      [t('planning.days.tuesday')]: 'Mardi',
      [t('planning.days.wednesday')]: 'Mercredi',
      [t('planning.days.thursday')]: 'Jeudi',
      [t('planning.days.friday')]: 'Vendredi',
      'Monday': 'Lundi',
      'Tuesday': 'Mardi',
      'Wednesday': 'Mercredi',
      'Thursday': 'Jeudi',
      'Friday': 'Vendredi'
    };

    return dayMappings[translatedDay] || 'Lundi';
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
    >
      <DialogTitle>
        {existingSurveillance ? t('planning.surveillance.edit') : t('planning.surveillance.add')}
      </DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel>{t('planning.surveillance.teacher')}</InputLabel>
          <Select
            value={newSurveillance.enseignant}
            onChange={(e) => setNewSurveillance({ ...newSurveillance, enseignant: e.target.value })}
            label={t('planning.surveillance.teacher')}
          >
            {enseignants.map((enseignant) => (
              <MenuItem key={enseignant._id} value={enseignant.nom}>
                {enseignant.nom}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          margin="normal"
          label={t('planning.surveillance.location')}
          value={newSurveillance.lieu}
          onChange={(e) => setNewSurveillance({ ...newSurveillance, lieu: e.target.value })}
        />
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        {existingSurveillance && (
          <Button 
            onClick={handleDeleteSurveillance} 
            color="error"
          >
            {t('common.delete')}
          </Button>
        )}
        <Button onClick={handleClose}>
          {t('common.cancel')}
        </Button>
        <Button 
          onClick={handleAddSurveillance} 
          variant="contained" 
          color="primary"
        >
          {existingSurveillance ? t('common.save') : t('common.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSurveillanceModal; 