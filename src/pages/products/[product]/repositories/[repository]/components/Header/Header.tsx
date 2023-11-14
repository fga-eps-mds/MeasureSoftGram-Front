import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { Alert, Box, Button, IconButton, Modal, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

import React, { useState } from 'react';
import GaugeSlider from '../GaugeSlider';
import { useProductContext } from '@contexts/ProductProvider';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import ReactEcharts from 'echarts-for-react';

function Header() {
  const { currentRepository } = useRepositoryContext();
  const { currentProduct } = useProductContext();
  const { currentOrganization } = useOrganizationContext();

  const [openModal, setOpenModal] = useState<boolean>(false);
  const initialValues = [0.33, 0.66];
  const [values, setValues] = useState(
    initialValues
  );

  const gaugeOptionWithoutPointer = {
    type: 'gauge',
    startAngle: 180,
    endAngle: 360,
    min: 0,
    max: 1,
    axisLine: {
      lineStyle: {
        width: 50,
        color: [
          [values[0], '#e74c3c'],
          [values[1], '#f1c40f'],
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
      formatter: function () {
        return '';
      }
    },
  };

  const option = {
    series: [gaugeOptionWithoutPointer]
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const onSubmit = () => {
    const data = {
      name: currentProduct?.name,
      redGaugeLimit: values[0],
      yellowGaugeLimit: values[1]
    }
    console.log(data)
    handleCloseModal();
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
          <Box
            style={{
              height: '180px',
            }}
          >
            <ReactEcharts option={option} />
          </Box>
          <Box
          >
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
          <Alert sx={{ display: "flex", justifyContent: "center", textAlign: 'center' }} severity="warning">Atenção: Essa configuração será aplicada a todos os repositórios do produto.</Alert>
        </Box>
      </Modal>
    </Box>
  );
}

export default Header;
