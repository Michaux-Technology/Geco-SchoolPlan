import React from 'react';
import { Link } from 'react-router-dom';
import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

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
    </div>
  );
};

export default Menu; 