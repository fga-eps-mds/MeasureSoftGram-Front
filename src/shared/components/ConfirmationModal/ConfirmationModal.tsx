import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Modal,
  Typography,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useTranslation } from 'react-i18next';

type ConfirmationModalProps = {
  open: boolean;
  onClose: () => void;
  itemName: string;
  onConfirm: () => void;
  confirmationName: string;
  setConfirmationName: (name: string) => void;
  errorText: string;
  setErrorText: (name: string) => void;
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onClose,
  itemName,
  onConfirm,
  confirmationName,
  setConfirmationName,
  errorText,
  setErrorText
}) => {
  const { t } = useTranslation('repositories');
  const isButtonDisabled = confirmationName !== itemName;

  const handleConfirmationNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmationName(e.target.value);
    if (e.target.value !== itemName) {
      setErrorText(`O nome '${itemName}' está incorreto.`);
    } else {
      setErrorText('');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="confirmation-modal-title"
      aria-describedby="confirmation-modal-description"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: 600,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
      }}>
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h6"> {`${t('delete.title')} ${itemName}.`}</Typography>
        <Alert
          icon={<WarningAmberIcon style={{ color: '#df8e16' }} />}
          severity="warning"
          style={{
            backgroundColor: '#f8e6cb',
            color: '#DF8E16',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: '1px solid #df8e16',
            fontWeight: 'bolder'
          }}
          sx={{ mt: 2, mb: 3 }}
        >
          {`${t('delete.title')} ${itemName} ${t('delete.titleRest')}`}
        </Alert>
        {/* Restante do componente */}
        <input
          type="text"
          value={confirmationName}
          onChange={handleConfirmationNameChange}
          className="input-style"
          style={{ width: '100%', marginBottom: '10px' }}
        />
        <Typography variant="body2" color="error">
          {errorText}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={onConfirm}
          disabled={isButtonDisabled}
          sx={{ width: '100%', marginTop: '10px' }}
        >
          {t('delete.button')}
        </Button>
      </Box>
    </Modal>
  );
};

export default ConfirmationModal;
