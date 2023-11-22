import React from 'react';
import { useCreateReleaseContext } from '@modules/createRelease/context/useCreateRelease';
import { CREATE_RELEASE_STEP } from '@modules/createRelease/consts';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import TuneIcon from '@mui/icons-material/Tune';
import { Accordion, AccordionDetails, AccordionSummary, Box, Breadcrumbs, Container, Link, Paper, Stack, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import * as Styles from './styles';
import SelectorButton from '../SelectorButton';
import { Masonry, Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator } from '@mui/lab';
import { ExpandMore } from '@mui/icons-material';

interface ReleaseConfigSelectorProps {
  setActiveStep: (step: number) => void;
}

export default function ReleaseConfigSelector({ setActiveStep }: ReleaseConfigSelectorProps) {
  const { setUseLastConfig, configPageData } = useCreateReleaseContext();
  console.log(configPageData)
  const useLastConfig = () => {
    setActiveStep(CREATE_RELEASE_STEP.ReleaseGoalStep);
    setUseLastConfig(true);
  };

  const { enqueueSnackbar } = useSnackbar()

  const handleErrorSnack = () => {

    enqueueSnackbar("Você não pode ir para o balanceamento de características, antes de finalizar a definição da Configuração.", {
      variant: 'error'
    })
  }

  const renderCurrentConfig = () => (
    <Container sx={{ my: 10, display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      <Masonry columns={3} spacing={2}>
        <Stack key={1}>
          <Timeline key={"0"} position='right'>
            {
              configPageData?.characteristicData?.map((characteristic, index) => (
                <Accordion sx={{
                  backgroundColor: 'white',
                  boxShadow: 'inherit',
                  width: '400px',
                }} key={index}>
                  <AccordionSummary key={index} sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                  }} expandIcon={<ExpandMore />}>
                    <TimelineSeparator>
                      <TimelineConnector />
                      <TimelineDot color="secondary" />
                      <TimelineConnector />
                    </TimelineSeparator>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      width: '100%',
                    }}>
                      <Typography variant="h6" component="span" color={"green"}>
                        Característica: {characteristic.key}
                      </Typography>
                      <Typography>Peso: {characteristic.weight}</Typography>
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails key={index} sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    width: '100%',
                  }}>
                    <TimelineItem key={index} sx={{ mb: 2 }}>
                      <TimelineContent sx={{ py: '12px' }}>

                        <Masonry columns={2} spacing={2}>
                          <Stack>
                            {
                              characteristic.subcharacteristics?.map((subcharacteristic, indexSub) => (

                                <TimelineItem key={indexSub} sx={{ mb: 2 }}>
                                  <TimelineSeparator>
                                    <TimelineConnector />
                                    <TimelineDot color="secondary" />
                                    <TimelineConnector />
                                  </TimelineSeparator>
                                  <TimelineContent sx={{ py: '12px', px: 2 }}>
                                    <Typography variant="h6" component="span" color={"gray"}>
                                      Subcaracterística: {subcharacteristic.key}
                                    </Typography>
                                    <Typography>Peso: {subcharacteristic.weight}</Typography>

                                    <Masonry columns={2} spacing={2}>
                                      <Stack>
                                        {
                                          subcharacteristic.measures?.map((measure, indexMe) => (

                                            <TimelineItem key={indexMe}>
                                              <TimelineSeparator>
                                                <TimelineConnector />
                                                <TimelineDot color="secondary" />
                                                <TimelineConnector />
                                              </TimelineSeparator>
                                              <TimelineContent sx={{ py: '12px', px: 2 }}>
                                                <Typography variant="h6" component="span">
                                                  Medida: {measure.key}
                                                </Typography>
                                                <Typography>Peso: {measure.weight}</Typography>
                                                {
                                                  measure.min_threshold && measure.max_threshold && <Typography>
                                                    min = {measure.min_threshold} | max = {measure.max_threshold}
                                                  </Typography>
                                                }
                                                <Masonry columns={2} spacing={2}>
                                                  <Stack>
                                                    {
                                                      measure.metrics?.map((metric, indexMet) => (

                                                        <TimelineItem key={indexMet}>
                                                          <TimelineSeparator>
                                                            <TimelineConnector />
                                                            <TimelineDot color="secondary" />
                                                            <TimelineConnector />
                                                          </TimelineSeparator>
                                                          <TimelineContent sx={{ py: '12px', px: 2 }}>
                                                            <Typography variant="h6" component="span" color={"gray"}>
                                                              Métrica: {metric.key}
                                                            </Typography>
                                                            <Typography>Peso: {metric.weight ? metric.weight : 0}</Typography>
                                                          </TimelineContent>
                                                        </TimelineItem>
                                                      ))
                                                    }
                                                  </Stack>
                                                </Masonry>

                                              </TimelineContent>
                                            </TimelineItem>


                                          ))
                                        }
                                      </Stack>
                                    </Masonry>
                                  </TimelineContent>
                                </TimelineItem>

                              ))
                            }
                          </Stack>
                        </Masonry>
                      </TimelineContent>
                    </TimelineItem>
                  </AccordionDetails>
                </Accordion>
              ))
            }
          </Timeline>
        </Stack>
      </Masonry>

    </Container >
  )

  return (
    <>
      <Styles.Header>
        <h1 style={{ color: '#33568E', fontWeight: '500' }}>Planejamento de Release</h1>
        <h2 style={{ color: '#33568E', fontWeight: '500' }}>Definição de Configuração</h2>
        <Breadcrumbs separator={<Box
          component="span"
          sx={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            bgcolor: 'text.disabled',
          }}
        />} sx={{ fontSize: '14px' }}>


          <Link sx={{
            cursor: 'pointer',
            textDecoration: 'none',
          }} onClick={() => {
            setActiveStep(0);
          }} color="text.secondary">Criar Release</Link>

          <Link sx={{
            cursor: 'pointer',
            textDecoration: 'none',
            fontWeight: '800'
          }} onClick={() => {
            setActiveStep(1);
          }} color="text.primary">Definir configuração do modelo</Link>

          <Link sx={{
            cursor: 'pointer',
            textDecoration: 'none',
          }} onClick={() => {
            handleErrorSnack()
          }} color="text.secondary">Balancear Características</Link>

        </Breadcrumbs>
        <Box display="flex" flexDirection="row" alignItems="center" gap="1rem" sx={{
          mt: 5
        }}>
          <SelectorButton onClick={useLastConfig} label='Seguir última configuração' startIcon={<SkipNextIcon />} />
          <SelectorButton onClick={() => setActiveStep(CREATE_RELEASE_STEP.CharacteristicStep)} label='Alterar configuração' startIcon={<TuneIcon />} />
        </Box>
      </Styles.Header>
      <Styles.Body>
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 1.5,
            borderStyle: 'dashed',
            bgcolor: 'background.paper',
          }}
        >
          <Stack sx={{

            position: 'relative',

          }}>
            {renderCurrentConfig()}
          </Stack>
        </Paper>
      </Styles.Body>
    </>
  );
}
