import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { Alert, Box, Button, IconButton, Modal, Typography } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import SettingsIcon from '@mui/icons-material/Settings';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { getPathId } from '@utils/pathDestructer';
import { useProductContext } from '@contexts/ProductProvider';
import ReactEcharts from 'echarts-for-react';
import { ProductFormData } from '@services/product';
import { toNumber } from 'lodash';
import { useProductQuery } from '@pages/products/hooks/useProductQuery';
import GaugeSlider from '../GaugeSlider';
import CopyBadgeModal from '../CopyBadgeModal';

function Header() {
  const { currentProduct, setCurrentProduct } = useProductContext();
  const { currentRepository } = useRepositoryContext();
  const { updateProduct } = useProductQuery();

  const [openModal, setOpenModal] = useState<boolean>(false);

  const initialValues = currentProduct && [currentProduct.gaugeRedLimit, currentProduct.gaugeYellowLimit];
  const [values, setValues] = useState(
    initialValues
  );

  const { query } = useRouter();

  useEffect(() => {
    if (initialValues && !values) {
      setValues(initialValues);
    }
  }, [initialValues]);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setValues(initialValues);
    setOpenModal(false);
  };

  const option = {
    series: {
      type: 'gauge',
      startAngle: 180,
      endAngle: 360,
      min: 0,
      max: 1,
      axisLine: {
        lineStyle: {
          width: 50,
          color: [
            [(values ? values[0] : 0.33), '#e74c3c'],
            [(values ? values[1] : 0.66), '#f1c40f'],
            [1, '#07bc0c']
          ]
        }
      },
      axisTick: {
        length: 0
      },
      splitLine: {
        length: 0
      },
      axisLabel: {
        distance: 0,
        rotate: 'tangential',
        formatter() {
          return '';
        }
      }
    }
  };

  const onSubmit = async () => {
    if (values && currentProduct) {
      const [organizationId, productId] = getPathId(query?.product as string);
      const productData: ProductFormData = {
        name: currentProduct.name,
        gaugeRedLimit: values[0],
        gaugeYellowLimit: values[1],
        organizationId: toNumber(organizationId)
      }

      const result = await updateProduct(productId, productData);
      if (result.type === 'success') {
        toast.success('Intervalos atualizados com sucesso!');
        setCurrentProduct(result.value);
      } else {
        toast.success('Erro ao atualizar intervalos!');
      }

      setOpenModal(false);
    }
  };

  return (
    <Box display="flex" flexDirection="row" justifyContent="space-between">
      <Box display="flex" flexDirection="column">
        <Box display="flex">
          <Typography variant="h4" marginRight="10px">
            Repositório
          </Typography>
          <Typography variant="h4" fontWeight="500" color="#33568E">
            {currentRepository?.name}
          </Typography>
        </Box>
        <Typography variant="caption" color="gray">
          {currentRepository?.description}
        </Typography>
      </Box>
      <Box>
        <IconButton onClick={handleOpenModal}>
          <SettingsIcon />
        </IconButton>
        <CopyBadgeModal />
      </Box>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
      >
        <Box
          sx={{
            width: 550,
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
            Editar Intervalos
          </Typography>
          {values ?
            <>
              <Box
                style={{
                  height: '180px',
                }}
              >
                <ReactEcharts option={option} />
              </Box>
              <Box>
                <GaugeSlider
                  step={0.01}
                  initialValues={values}
                  min={0}
                  max={1}
                  values={values}
                  setValues={setValues}
                />
              </Box>
              <Box
                display="flex"
                flexDirection="row"
                justifyContent="center"
                gap="20px"
                marginBottom='10px'
              >
                <Button
                  onClick={handleCloseModal}
                  variant='outlined'
                >
                  Cancelar
                </Button>
                <Button
                  variant='contained'
                  onClick={onSubmit}
                >
                  Salvar
                </Button>
              </Box>
              <Alert icon={<WarningIcon />} sx={{ display: "flex", justifyContent: "center", textAlign: 'center' }} severity="warning">
                Atenção: Essa configuração será aplicada a todos os repositórios do produto.
              </Alert>
            </>
            :
            <Alert sx={{ display: "flex", justifyContent: "center", textAlign: 'center' }} severity="error">
              Ocorreu um erro ao tentar carregar as informações.
            </Alert>
          }
        </Box>
      </Modal>
    </Box>
  );
}

export default Header;
