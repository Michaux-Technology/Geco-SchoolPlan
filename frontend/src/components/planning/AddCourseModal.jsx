import React, { useMemo } from 'react';
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
  Typography,
  Box
} from '@mui/material';
import { useTranslation } from 'react-i18next';

function convertToFrenchDay(translatedDay) {
  if (!translatedDay) return 'Lundi';
  const joursFrancais = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  if (joursFrancais.includes(translatedDay)) return translatedDay;
  const dayMappings = {
    Monday: 'Lundi',
    Tuesday: 'Mardi',
    Wednesday: 'Mercredi',
    Thursday: 'Jeudi',
    Friday: 'Vendredi',
    // Ajoute d'autres langues si besoin
  };
  return dayMappings[translatedDay] || translatedDay;
}

const AddCourseModal = ({
  open,
  onClose,
  onSubmit,
  formData,
  setFormData,
  error,
  classes,
  enseignants,
  matieres,
  salles,
  uhrs,
  selectedCell,
  cours,
  currentWeek
}) => {
  const { t } = useTranslation();

  // Filtrage des matières selon les enseignants sélectionnés
  const filteredMatieres = useMemo(() => {
    if (
      !formData.enseignants ||
      formData.enseignants.length === 0 ||
      formData.matiere === '__all__'
    ) {
      return matieres;
    }
    // Récupérer toutes les matières des enseignants sélectionnés
    const matieresSet = new Set();
    enseignants.forEach((ens) => {
      if (formData.enseignants.includes(ens.nom) && Array.isArray(ens.matieres)) {
        ens.matieres.forEach((m) => matieresSet.add(m));
      }
    });
    // Retourner les objets matière correspondants
    return matieres.filter((m) => matieresSet.has(m.nom));
  }, [formData.enseignants, formData.matiere, enseignants, matieres]);

  // Filtrage des salles disponibles pour le créneau sélectionné (version précédente)
  const sallesDisponibles = useMemo(() => {
    if (!selectedCell || !selectedCell.jour || !selectedCell.zeitslot || formData.salle === '__all__') {
      return salles;
    }
    if (!Array.isArray(cours)) {
      return salles;
    }
    const frenchDay = convertToFrenchDay(selectedCell.jour);
    const uhrId = selectedCell.zeitslot._id;
    const coursDuCreneau = cours.filter(c =>
      c.jour === frenchDay &&
      String(c.uhr) === String(uhrId) &&
      c.semaine === currentWeek &&
      !c.annule
    );
    const sallesUtilisees = coursDuCreneau.map(c => c.salle).filter(Boolean);
    return salles.filter(s => !sallesUtilisees.includes(s.nom));
  }, [selectedCell, salles, cours, currentWeek, formData.salle]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {selectedCell?.slot ? t('planning.editCourse') : t('planning.addCourse')}
        <Typography variant="subtitle2" color="text.secondary">
          {selectedCell?.jour} - {uhrs.find(u => u._id === selectedCell?.uhrId)?.zeitslot}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel>{t('planning.class')}</InputLabel>
          <Select
            value={formData.classe}
            onChange={(e) => setFormData({ ...formData, classe: e.target.value })}
            label={t('planning.class')}
          >
            {classes && classes.map((classe) => (
              <MenuItem key={classe._id} value={classe.nom}>
                {classe.nom} ({t('planning.numberOfStudents')}: {classe.nombreEleves || 0})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>{t('planning.teachers')}</InputLabel>
          <Select
            multiple
            value={formData.enseignants}
            onChange={(e) => setFormData({ ...formData, enseignants: e.target.value })}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Typography key={value}>{value}</Typography>
                ))}
              </Box>
            )}
            label={t('planning.teachers')}
          >
            {enseignants.map((enseignant) => (
              <MenuItem key={enseignant._id} value={enseignant.nom}>
                {enseignant.nom}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>{t('planning.subject')}</InputLabel>
          <Select
            value={formData.matiere}
            onChange={(e) => {
              setFormData({ ...formData, matiere: e.target.value });
            }}
            label={t('planning.subject')}
          >
            <MenuItem value="__all__">{t('planning.allSubjects')}</MenuItem>
            {/* Afficher toutes les matières filtrées + la matière sélectionnée si absente */}
            {[
              ...filteredMatieres,
              ...(
                formData.matiere &&
                formData.matiere !== '__all__' &&
                !filteredMatieres.some(m => m.nom === formData.matiere)
                  ? matieres.filter(m => m.nom === formData.matiere)
                  : []
              )
            ].map((matiere) => (
              <MenuItem key={matiere._id} value={matiere.nom}>
                {matiere.nom}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>{t('planning.room')}</InputLabel>
          <Select
            value={formData.salle}
            onChange={(e) => setFormData({ ...formData, salle: e.target.value })}
            label={t('planning.room')}
          >
            <MenuItem value="__all__">{t('planning.allRooms')}</MenuItem>
            {/* Afficher toutes les salles disponibles + la salle sélectionnée si absente */}
            {[
              ...sallesDisponibles,
              ...(
                formData.salle &&
                formData.salle !== '__all__' &&
                !sallesDisponibles.some(s => s.nom === formData.salle)
                  ? salles.filter(s => s.nom === formData.salle)
                  : []
              )
            ].map((salle) => (
              <MenuItem key={salle._id} value={salle.nom}>
                {salle.nom} ({t('planning.capacity')} : {salle.capacite || 0} {t('planning.students')})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          margin="normal"
          label={t('planning.comment', 'Commentaire')}
          value={formData.commentaire || ''}
          onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
          multiline
          rows={3}
          placeholder={t('planning.commentPlaceholder', 'Ajouter un commentaire optionnel...')}
        />

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button 
          variant="contained" 
          onClick={onSubmit}
          disabled={!formData.classe || !formData.enseignants.length || !formData.matiere || !formData.salle || formData.salle === '__all__' || formData.matiere === '__all__'}
        >
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCourseModal; 