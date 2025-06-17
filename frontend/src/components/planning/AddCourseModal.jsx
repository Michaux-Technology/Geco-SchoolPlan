import React from 'react';
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
  selectedCell
}) => {
  const { t } = useTranslation();

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
                {classe.nom} (nombre d'élèves: {classe.nombreEleves || 0})
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
            onChange={(e) => setFormData({ ...formData, matiere: e.target.value })}
            label={t('planning.subject')}
          >
            {matieres.map((matiere) => (
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
            {salles.map((salle) => (
              <MenuItem key={salle._id} value={salle.nom}>
                {salle.nom}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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
          disabled={!formData.classe || !formData.enseignants.length || !formData.matiere || !formData.salle}
        >
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCourseModal; 