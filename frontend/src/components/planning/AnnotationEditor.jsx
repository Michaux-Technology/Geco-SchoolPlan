import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import io from 'socket.io-client';

const annotationTextFieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '6px',
    backgroundColor: '#fff',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#1976d2'
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#1976d2',
      borderWidth: '2px'
    }
  }
};

const annotationSaveButtonStyle = {
  backgroundColor: '#1976d2',
  color: 'white',
  borderRadius: '6px',
  padding: '8px',
  '&:hover': {
    backgroundColor: '#1565c0',
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }
};

const annotationStyle = {
  padding: '12px',
  margin: '4px 0',
  borderRadius: '6px',
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: '#e9ecef',
    borderColor: '#dee2e6',
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  }
};

const AnnotationEditor = ({ jour, annotation, currentWeek, socket }) => {
  const { t, i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  // Fonction pour convertir le jour traduit vers le format français pour la base de données
  const convertToFrenchDay = (translatedDay) => {
    // Vérifier si le paramètre est valide
    if (!translatedDay) {
      console.warn('convertToFrenchDay: jour non défini ou invalide', { translatedDay });
      return 'Lundi'; // Valeur par défaut
    }

    // Vérifier si le jour est déjà en français
    const joursFrancais = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    if (joursFrancais.includes(translatedDay)) {
      return translatedDay;
    }

    try {
      // Créer un mapping pour chaque langue possible
      const dayMappings = {
        // Français (clés i18n)
        [t('planning.days.monday')]: 'Lundi',
        [t('planning.days.tuesday')]: 'Mardi',
        [t('planning.days.wednesday')]: 'Mercredi',
        [t('planning.days.thursday')]: 'Jeudi',
        [t('planning.days.friday')]: 'Vendredi',
        
        // Anglais
        'Monday': 'Lundi',
        'Tuesday': 'Mardi',
        'Wednesday': 'Mercredi',
        'Thursday': 'Jeudi',
        'Friday': 'Vendredi'
      };

      // Ajouter des mappings pour d'autres langues si nécessaire
      if (i18n.language === 'de') {
        Object.assign(dayMappings, {
          'Montag': 'Lundi',
          'Dienstag': 'Mardi',
          'Mittwoch': 'Mercredi',
          'Donnerstag': 'Jeudi',
          'Freitag': 'Vendredi'
        });
      }

      if (i18n.language === 'es') {
        Object.assign(dayMappings, {
          'Lunes': 'Lundi',
          'Martes': 'Mardi',
          'Miércoles': 'Mercredi',
          'Jueves': 'Jeudi',
          'Viernes': 'Vendredi'
        });
      }

      // Retourner la conversion ou le jour original si pas trouvé
      const frenchDay = dayMappings[translatedDay] || translatedDay;
      console.log('convertToFrenchDay:', { translatedDay, frenchDay, language: i18n.language });
      return frenchDay;
    } catch (error) {
      console.error('Erreur dans convertToFrenchDay:', error);
      return translatedDay; // Retourner le jour original en cas d'erreur
    }
  };
  const [isEditing, setIsEditing] = useState(false);
  const [localAnnotation, setLocalAnnotation] = useState(annotation || '');

  // Mettre à jour l'annotation locale quand la prop annotation change
  useEffect(() => {
    setLocalAnnotation(annotation || '');
  }, [annotation]);

  const handleAnnotationChange = (value) => {
    setLocalAnnotation(value);
  };

  const handleAnnotationSave = () => {
    if (socket) {
      // Convertir le jour traduit en jour français pour la base de données
      const frenchDay = convertToFrenchDay(jour);
      
      const data = {
        jour: frenchDay,
        annotation: localAnnotation,
        semaine: getWeekNumber(currentWeek),
        date: currentWeek,
        annee: currentWeek.getFullYear()
      };

      // Écouter la réponse du serveur
      socket.once('annotationsUpdate', (updatedAnnotations) => {
        enqueueSnackbar(t('planning.annotationSaved', 'Annotation sauvegardée'), { variant: 'success' });
        setIsEditing(false);
      });

      socket.once('annotationError', (error) => {
        console.error('Erreur lors de la sauvegarde de l\'annotation:', error);
        enqueueSnackbar(t('planning.annotationError', 'Erreur lors de la sauvegarde de l\'annotation'), { variant: 'error' });
      });

      // Envoyer la demande de sauvegarde
      socket.emit('saveAnnotation', data);
    }
  };

  // Fonction pour obtenir le numéro de la semaine
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: 1,
      height: '100%'
    }}>
      {isEditing ? (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          width: '100%'
        }}>
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            multiline
            rows={2}
            value={localAnnotation}
            onChange={(e) => handleAnnotationChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                handleAnnotationSave();
              }
            }}
            sx={annotationTextFieldStyle}
            placeholder={t('planning.addAnnotation')}
          />
          <IconButton
            size="small"
            onClick={handleAnnotationSave}
            sx={annotationSaveButtonStyle}
          >
            <SaveIcon fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <Typography
          onClick={() => setIsEditing(true)}
          sx={{
            ...annotationStyle,
            width: '100%',
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: localAnnotation ? 'text.primary' : 'text.secondary',
            fontStyle: localAnnotation ? 'normal' : 'italic',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            textAlign: 'left',
            padding: '8px'
          }}
        >
          {localAnnotation || t('planning.clickToAddAnnotation')}
        </Typography>
      )}
    </Box>
  );
};

export default AnnotationEditor; 