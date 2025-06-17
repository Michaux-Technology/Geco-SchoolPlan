import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const DeleteCourseModal = ({
  open,
  onClose,
  onDelete,
  onCancel,
  onReplace,
  selectedCours
}) => {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          minWidth: '400px',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #e0e0e0',
        padding: '16px 24px',
        fontSize: '1.25rem',
        fontWeight: '500'
      }}>
        {t('planning.deleteCourse')}
      </DialogTitle>
      <DialogContent sx={{ padding: '24px' }}>
        <Typography sx={{ 
          fontSize: '1rem',
          color: '#333',
          marginBottom: '16px'
        }}>
          {t('planning.deleteCourseConfirm')}
        </Typography>
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <Button 
            onClick={() => {
              onDelete();
              onClose();
            }}
            variant="contained"
            color="error"
            sx={{
              width: '100%',
              textTransform: 'none',
              fontSize: '1rem',
              padding: '8px 16px'
            }}
          >
            {t('common.delete')}
          </Button>
          <Button 
            onClick={() => {
              onCancel();
              onClose();
            }}
            variant="contained"
            color="warning"
            sx={{
              width: '100%',
              textTransform: 'none',
              fontSize: '1rem',
              padding: '8px 16px'
            }}
          >
            {t('planning.cancelCourse')}
          </Button>
          <Button 
            onClick={() => {
              onReplace();
              onClose();
            }}
            variant="contained"
            color="success"
            sx={{
              width: '100%',
              textTransform: 'none',
              fontSize: '1rem',
              padding: '8px 16px'
            }}
          >
            {t('planning.replaceCourse')}
          </Button>
        </Box>
      </DialogContent>
      <DialogActions sx={{ 
        padding: '16px 24px',
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#f5f5f5'
      }}>
        <Button 
          onClick={onClose}
          sx={{
            textTransform: 'none',
            fontSize: '1rem'
          }}
        >
          {t('common.cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteCourseModal; 