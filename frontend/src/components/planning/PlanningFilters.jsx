import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const PlanningFilters = ({
  selectedClasse,
  setSelectedClasse,
  selectedEnseignant,
  setSelectedEnseignant,
  classes,
  enseignants
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 2, 
      mb: 2,
      flexWrap: 'wrap'
    }}>
      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel>{t('planning.class')}</InputLabel>
        <Select
          value={selectedClasse}
          onChange={(e) => setSelectedClasse(e.target.value)}
          label={t('planning.class')}
        >
          <MenuItem value="">
            <em>{t('planning.all')}</em>
          </MenuItem>
          {classes.map((classe) => (
            <MenuItem key={classe._id} value={classe.nom}>
              {classe.nom}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel>{t('planning.teacher')}</InputLabel>
        <Select
          value={selectedEnseignant}
          onChange={(e) => setSelectedEnseignant(e.target.value)}
          label={t('planning.teacher')}
        >
          <MenuItem value="">
            <em>{t('planning.all')}</em>
          </MenuItem>
          {enseignants.map((enseignant) => (
            <MenuItem key={enseignant._id} value={enseignant._id}>
              {enseignant.nom}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default PlanningFilters; 