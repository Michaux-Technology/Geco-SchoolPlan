import React from 'react';
import {
  Box,
  Typography,
  IconButton
} from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useTranslation } from 'react-i18next';

const WeekSelector = ({ currentWeek, navigateWeek, getWeekNumber }) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      gap: 1,
      ml: 'auto'
    }}>
      <IconButton onClick={() => navigateWeek(-1)} size="small">
        <ArrowBackIosIcon />
      </IconButton>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ color: 'primary.main' }}>
          {currentWeek.toLocaleDateString('fr-FR', { year: 'numeric' })}
        </Typography>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          {t('planning.week')} {getWeekNumber(currentWeek)}
        </Typography>
      </Box>
      <IconButton onClick={() => navigateWeek(1)} size="small">
        <ArrowForwardIosIcon />
      </IconButton>
    </Box>
  );
};

export default WeekSelector; 