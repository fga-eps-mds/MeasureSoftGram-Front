import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { Alert, Box, Button, IconButton, Modal, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import React, { useState } from 'react';
import { toast } from 'react-toastify';


function CopyBadgeModal() {
  const { latestTSQMIBadgeUrl } = useRepositoryContext();

  const [openModal, setOpenModal] = useState<boolean>(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`![TSQMI Rating](${latestTSQMIBadgeUrl})`);
    handleCloseModal();
    toast.success('Copiado com sucesso!');
  }

  return (
    <>
      <IconButton onClick={handleOpenModal}>
        <ContentCopyIcon />
      </IconButton>

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
            Copiar Badge
          </Typography>
          {
            latestTSQMIBadgeUrl ?
              <>
                <Box
                  sx={{
                    backgroundColor: '#E9E9E9',
                    borderRadius: 1,
                    p: 2,
                    wordBreak: 'break-word',
                    marginBottom: '10px'
                  }}
                >
                  ![TSQMI Rating]({latestTSQMIBadgeUrl})
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
                    Cancelar
                  </Button>
                  <Button
                    variant='contained'
                    onClick={copyToClipboard}
                  >
                    <ContentCopyIcon />
                    Copiar
                  </Button>
                </Box>
              </>
              :
              <Alert sx={{ display: "flex", justifyContent: "center", textAlign: 'center' }} severity="error">
                Ocorreu um erro ao tentar carregar as informações.
              </Alert>
          }

        </Box>
      </Modal>
    </>
  );
}

export default CopyBadgeModal;
