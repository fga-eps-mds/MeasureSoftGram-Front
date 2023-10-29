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
  Modal
} from '@mui/material/';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { FiArrowLeft, FiPlus } from 'react-icons/fi';
import LetterAvatar from '@components/LetterAvatar';
import { useRouter } from 'next/router';
import { useOrganizationQuery } from 'src/pages/organizations/hooks/useOrganizationQuery';

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

  const handleDelete = async () => {
    if (itemToDelete) {
      const result = await deleteOrganization(String(itemToDelete.id));
      if (result.type === "success") {
        console.log("Item deleted successfully:", itemToDelete.id);
      } else {
        console.error("Error deleting item:", result.error);
      }
      setItemToDelete(null);
      setShowConfirmationModal(false);
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
                await router.push("/organizations/");
              }}
            >
              Adicionar Organização
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
        onClose={() => setShowConfirmationModal(false)}
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
          <h3>Confirmar exclusão</h3>
          <p>Você tem certeza que deseja excluir o item '{itemToDelete?.name}'?</p>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" onClick={() => setShowConfirmationModal(false)}>Cancelar</Button>
            <Button variant="contained" color="primary" onClick={handleDelete}>Deletar</Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default SideList;
