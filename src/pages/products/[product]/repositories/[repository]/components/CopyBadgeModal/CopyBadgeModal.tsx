import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { Alert, Box, Button, IconButton, Modal, Tooltip, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

interface CopyBadgeModalProps {
  badgeUrl?: string;
  badgeLabel?: string;
}

function CopyBadgeModal({ badgeUrl, badgeLabel = 'MeasureSoftGram' }: CopyBadgeModalProps) {
  const { latestTSQMIBadgeUrl } = useRepositoryContext();
  const { t } = useTranslation('repositories');

  const [openModal, setOpenModal] = useState<boolean>(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const resolvedBadgeUrl = badgeUrl || latestTSQMIBadgeUrl;
  const badgeMarkdown = `![${badgeLabel}](${resolvedBadgeUrl})`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(badgeMarkdown)
      .then(() => {
        handleCloseModal();
        toast.success(t('repository.badge-copied', 'Badge copiada com sucesso!'));
      })
      .catch(() => {
        toast.error(t('repository.badge-copy-error', 'Falha ao copiar para a área de transferência.'));
      });
  }

  return (
    <>
      <Tooltip title={t('repository.copy-badge', 'Copiar Badge')} placement="top">
        <IconButton onClick={handleOpenModal} size="small">
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
      >
        <Box
          sx={{
            width: 600,
            p: 2,
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 1,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {t('repository.copy-badge', 'Copiar Badge')}
          </Typography>
          {
            resolvedBadgeUrl ?
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {t('repository.badge-instructions', 'Cole o código abaixo no README do seu repositório:')}
                </Typography>
                <Box
                  sx={{
                    backgroundColor: '#E9E9E9',
                    borderRadius: 1,
                    p: 2,
                    wordBreak: 'break-word',
                    marginBottom: '10px',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                  }}
                >
                  {badgeMarkdown}
                </Box>
                <Box display="flex" justifyContent="center" mb={2}>
                  <img src={resolvedBadgeUrl} alt="Badge Preview" style={{ height: '20px' }} />
                </Box>
                <Box
                  display="flex"
                  flexDirection="row"
                  justifyContent="center"
                  gap="20px"
                >
                  <Button
                    onClick={handleCloseModal}
                    variant='outlined'
                  >
                    {t('repository.badge-cancel', 'Cancelar')}
                  </Button>
                  <Button
                    variant='contained'
                    onClick={copyToClipboard}
                    startIcon={<ContentCopyIcon />}
                  >
                    {t('repository.badge-copy-btn', 'Copiar')}
                  </Button>
                </Box>
              </>
              :
              <Alert sx={{ display: "flex", justifyContent: "center", textAlign: 'center' }} severity="error">
                {t('repository.badge-error', 'Ocorreu um erro ao tentar carregar as informações.')}
              </Alert>
          }

        </Box>
      </Modal>
    </>
  );
}

export default CopyBadgeModal;
