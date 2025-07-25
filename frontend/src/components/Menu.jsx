import React from 'react';
import { Link } from 'react-router-dom';
import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import QrCodeIcon from '@mui/icons-material/QrCode';

const Menu = () => {
  return (
    <div>
      <MenuItem component={Link} to="/planning">
        <ListItemIcon>
          <CalendarMonthIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Planning</ListItemText>
      </MenuItem>
      <MenuItem component={Link} to="/tranches-horaires">
        <ListItemIcon>
          <AccessTimeIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Tranches horaires</ListItemText>
      </MenuItem>
      <MenuItem component={Link} to="/qr-code">
        <ListItemIcon>
          <QrCodeIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>QR Code Connexion</ListItemText>
      </MenuItem>
    </div>
  );
};

export default Menu; 