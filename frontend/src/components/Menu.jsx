import React from 'react';
import { Link } from 'react-router-dom';
import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import QrCodeIcon from '@mui/icons-material/QrCode';

const Menu = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <MenuItem component={Link} to="/planning">
        <ListItemIcon>
          <CalendarMonthIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>{t('navigation.planning')}</ListItemText>
      </MenuItem>
      <MenuItem component={Link} to="/tranches-horaires">
        <ListItemIcon>
          <AccessTimeIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>{t('navigation.timeSlots')}</ListItemText>
      </MenuItem>
      <MenuItem component={Link} to="/qr-code">
        <ListItemIcon>
          <QrCodeIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>{t('qr.title')}</ListItemText>
      </MenuItem>
    </div>
  );
};

export default Menu; 