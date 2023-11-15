import React, { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Modal,
} from '@mui/material/';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import WarningIcon from '@mui/icons-material/Warning';
import { FiArrowLeft, FiPlus } from 'react-icons/fi';
import LetterAvatar from '@components/LetterAvatar';
import { useRouter } from 'next/router';
import { useOrganizationQuery } from '../../../../../pages/organizations/hooks/useOrganizationQuery';
import { toast } from 'react-toastify';

type ItemWithBasicProps = {
  id: number;
  name: string;
};

type Props<T extends ItemWithBasicProps> = {
  values: Array<T>;
  open: boolean;
  onClose: () => void;
  onClickItem?: (_value: T) => void;
  seeMorePath: string;
  showActions?: boolean;
  itemType?: "organization" | "product";
};

const SideList = <T extends ItemWithBasicProps>({
  values,
  open,
  onClose,
  onClickItem,
  seeMorePath,
  showActions = true,
  itemType
}: Props<T>) => {
  const { deleteOrganization } = useOrganizationQuery();
  const maxItems = 10;
  const filteredValues = values.slice(0, maxItems);
  const router = useRouter();

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const [confirmationStep, setConfirmationStep] = useState(0);
  const [confirmationName, setConfirmationName] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const handleConfirmationNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setConfirmationName(newName);

    if (newName === itemToDelete?.name) {
      setIsButtonDisabled(false);
      setErrorText("");
    } else {
      setIsButtonDisabled(true);
      setErrorText("O nome da organização está incorreto.");
    }
  };

  const handleDelete = async () => {
    if (confirmationStep === 0) {
      setShowConfirmationModal(true);
    } else if (confirmationStep === 1) {
      if (itemToDelete && itemToDelete.name === confirmationName) {
        const result = await deleteOrganization(String(itemToDelete.id));
        if (result.type === "success") {
          toast.success('Organização excluída com sucesso!');
          console.log("Item deleted successfully:", itemToDelete.id);
        } else {
          console.error("Error deleting item:", result.error);
        }
        setItemToDelete(null);
        setShowConfirmationModal(false);
        setConfirmationStep(0);
        setConfirmationName("");
        setErrorText("");
        setIsButtonDisabled(true);
      } else {
        setErrorText("O nome da organização está incorreto.");
      }
    }
  };

  return (
    <>
      <Drawer anchor="left" open={open} onClose={onClose}>
        <Box sx={{ width: '500px', bgcolor: 'background.paper' }}>
          <Box
            sx={{ p: 2, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <IconButton onClick={onClose}>
              <FiArrowLeft fontSize={30} />
            </IconButton>
            <Button
              variant="contained"
              startIcon={<FiPlus />}
              onClick={async () => {
                if (itemType === "organization") {
                  await router.push(`/organizations/`);
                } else {
                  await router.push(`/products/create/`);
                }
              }}
            >
              {itemType === "organization" ? "Adicionar Organização" : "Adicionar Produto"}
            </Button>
          </Box>
          <List>
            {filteredValues.map((value) => (
              <Box key={value.id} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                <Divider sx={{ width: 'calc(100% - 10px)', border: '1px solid rgba(0, 0, 0, 0.20)' }} />
                <ListItem
                  disablePadding
                  key={value.id}
                  onClick={() => {
                    console.log('onClickItem function:', onClickItem);
                    if (typeof onClickItem === 'function') {
                      onClickItem(value);
                    } else {
                      console.error('onClickItem is not a function', onClickItem);
                    }
                    onClose();
                  }}
                >
                  <ListItemButton>
                    <ListItemIcon>
                      <LetterAvatar name={value.name} />
                    </ListItemIcon>
                    <ListItemText primary={value.name} />
                    {showActions && (
                      <>
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={async (e) => {
                            e.stopPropagation();
                            await router.push(`/organizations?edit=${value.id}`);
                          }}
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            setItemToDelete(value);
                            setShowConfirmationModal(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </ListItemButton>
                </ListItem>
              </Box>
            ))}
            <Button
              sx={{ marginTop: '5px', minHeight: '10vh', width: 'calc(100% - 10px)' }}
              onClick={async () => {
                await router.push(seeMorePath);
              }}
              variant="text"
            >
              VER MAIS...
            </Button>
          </List>
        </Box>
      </Drawer>

      <Modal
        open={showConfirmationModal}
        onClose={() => {
          setShowConfirmationModal(false);
          setConfirmationStep(0);
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
        }}>
          {confirmationStep === 0 ? (
            <>
              <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
                <IconButton onClick={() => setShowConfirmationModal(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <h3>Confirmar exclusão</h3>
              <Alert
                icon={<WarningIcon />}
                severity="warning"
                sx={{ margin: '10px 0' }}
              >
                Coisas inesperadas podem acontecer se você não ler isso!
              </Alert>
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" sx={{ textAlign: 'justify' }}>
                  Isso irá deletar permanentemente a organização '{itemToDelete?.name}', assim como seus produtos e todos os membros associados.
                </Typography>
              </Box>
              <Box display="flex" justifyContent="center" mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setConfirmationStep(1)}
                  sx={{ width: '100%' }}
                >
                  Eu li e entendo os efeitos
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
                <IconButton onClick={() => {
                  setShowConfirmationModal(false);
                  setConfirmationStep(0);
                }}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <h3>Confirmação adicional</h3>
              <Alert
                icon={<WarningIcon />}
                severity="warning"
                sx={{ margin: '10px 0' }}
              >
                Para confirmar, digite '{itemToDelete?.name}' abaixo:
              </Alert>
              <input
                type="text"
                value={confirmationName}
                onChange={handleConfirmationNameChange}
                className="input-style"
                style={{ width: '100%' }}
              />
              <Typography variant="body2" sx={{ color: 'error.main', mt: 2 }}>
                {errorText}
              </Typography>
              <Box display="flex" justifyContent="center" mt={2}>
                <Button variant="contained" color="primary" onClick={handleDelete} sx={{ width: '100%' }} disabled={isButtonDisabled} >
                  Deletar esta organização
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default SideList;
