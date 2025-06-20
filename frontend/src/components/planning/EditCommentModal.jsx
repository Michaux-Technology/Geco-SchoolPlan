import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const EditCommentModal = ({
  open,
  onClose,
  onSubmit,
  comment,
  setComment,
  error,
  selectedCours
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
        {t('planning.editComment', 'Modifier le commentaire')}
        <Typography variant="subtitle2" color="text.secondary">
          {selectedCours?.classe} - {selectedCours?.matiere}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="normal"
          label={t('planning.comment', 'Commentaire')}
          value={comment || ''}
          onChange={(e) => setComment(e.target.value)}
          multiline
          rows={4}
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
        >
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCommentModal; 