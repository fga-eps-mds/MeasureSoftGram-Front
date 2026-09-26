import { Box, Alert, Button, IconButton, Modal } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';
import { useTranslation } from "react-i18next";

interface ConfirmModalProps {
  text: string;
  btnConfirmText: string;
  btnDismissText: string;
  isModalOpen: boolean;
  setIsModalOpen: any;
  handleConfirmBtnClick: any;
  handleDismissBtnClick: any;
}

export default function ConfirmModal({ isModalOpen, btnConfirmText, btnDismissText, text, handleConfirmBtnClick, handleDismissBtnClick, setIsModalOpen }: ConfirmModalProps) {
  const { t } = useTranslation('translation');

  return <Modal
    open={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    aria-labelledby="modal-modal-title"
    aria-describedby="modal-modal-description"
  >
    <Box sx={{
      borderRadius: 2,
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 400,
      bgcolor: 'background.paper',
      boxShadow: 24,
      p: 2,
      paddingTop: 1
    }}>
      <>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3>{t('warning')}</h3>
          <IconButton data-testId="iconCloseDateModal" onClick={() => setIsModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Alert
          icon={<WarningIcon />}
          severity="warning"
          sx={{ margin: '10px 0' }}
        >
          {text}
        </Alert>
        <Box sx={{ width: '100%' }} />
        <Box
          sx={{
            display: 'flex',
            columnGap: 2,
            marginTop: 2
          }}
        >
          <Button
            variant="outlined"
            color="primary"
            data-testid="dismissBtnClick"
            onClick={() => handleDismissBtnClick()}
            sx={{ width: '100%' }}
          >
            {btnDismissText}
          </Button>
          <Button
            variant="contained"
            color="primary"
            data-testid="confirmBtnClick"
            onClick={() => handleConfirmBtnClick()}
            sx={{ width: '100%' }}
          >
            {btnConfirmText}
          </Button>
        </Box>
      </>

    </Box>
  </Modal>
}
