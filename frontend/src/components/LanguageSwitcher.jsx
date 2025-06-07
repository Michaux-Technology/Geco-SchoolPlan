import React from 'react';
import { Box, Select, MenuItem, FormControl, InputLabel, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

function LanguageSwitcher() {
  const theme = useTheme();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isLoginPage = location.pathname === '/login';
  
  const changeLanguage = (event) => {
    const language = event.target.value;
    i18n.changeLanguage(language);
  };

  // Styles adaptés selon la page
  const labelColor = isLoginPage ? 'white' : 'white';
  const borderColor = isLoginPage ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.5)';
  const hoverBorderColor = isLoginPage ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.8)';
  const focusBorderColor = isLoginPage ? 'white' : 'white';
  const iconColor = isLoginPage ? 'white' : 'white';
  const textColor = isLoginPage ? 'white' : 'white';

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl size="small" fullWidth>
        <InputLabel 
          id="language-select-label"
          sx={{ 
            color: labelColor,
            '&.Mui-focused': {
              color: labelColor,
            }
          }}
        >
          {t('common.language')}
        </InputLabel>
        <Select
          labelId="language-select-label"
          id="language-select"
          value={i18n.language}
          label={t('common.language')}
          onChange={changeLanguage}
          sx={{
            color: textColor,
            '.MuiOutlinedInput-notchedOutline': {
              borderColor: borderColor,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: hoverBorderColor,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: focusBorderColor,
            },
            '.MuiSvgIcon-root': {
              color: iconColor,
            }
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                '& .MuiMenuItem-root:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                }
              }
            }
          }}
        >
          <MenuItem value="fr">Français</MenuItem>
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="de">Deutsch</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}

export default LanguageSwitcher;