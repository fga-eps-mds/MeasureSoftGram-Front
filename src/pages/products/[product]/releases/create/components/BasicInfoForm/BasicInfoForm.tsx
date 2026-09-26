import React, { } from 'react';
import { Accordion, AccordionSummary, Box, Checkbox, FormControlLabel, hexToRgb, TextField, Typography } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { Timeline, TimelineSeparator, TimelineConnector, TimelineDot, TimelineItem, TimelineContent, timelineItemClasses } from '@mui/lab';
import { useTranslation } from 'react-i18next';
import { FieldErrors, UseFormRegister, UseFormTrigger, UseFormWatch } from 'react-hook-form';
import { PreConfigData, ReleaseInfoForm } from '@customTypes/preConfig';
import SectionTooltip from '../SectionTooltip/SectionTooltip';

interface BasicInfoFormProps {
  register: UseFormRegister<ReleaseInfoForm>;
  errors: FieldErrors<ReleaseInfoForm>;
  watch: UseFormWatch<ReleaseInfoForm>;
  trigger: UseFormTrigger<ReleaseInfoForm>;
  followLastConfig: boolean;
  setFollowLastConfig: any;
  configPageData: PreConfigData;
}

export default function BasicInfoForm({ configPageData, register, errors, followLastConfig, setFollowLastConfig, watch }: BasicInfoFormProps) {
  const { t } = useTranslation('plan_release');

  const renderCurrentConfig = () => (
    <Accordion defaultExpanded
      square
      sx={{
        boxShadow: 'inherit',
        border: 0.5,
        backgroundColor: "transparent",
        borderColor: "#00000040",
        borderRadius: 3,
        marginTop: 2
      }}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography>{t('generalCharacteristics')}</Typography>
      </AccordionSummary>
      <Timeline
        key="0"
        sx={{
          [`& .${timelineItemClasses.root}:before`]: {
            flex: 0,
            padding: 0,
          },
          marginTop: 0
        }}
      >
        {configPageData?.characteristics?.map((characteristic) => (
          <Accordion
            sx={{
              boxShadow: 'inherit',
              backgroundColor: "transparent",
            }}
            key={`ac-characteristic-${characteristic.key}`}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <TimelineItem key={`characteristic-${characteristic.key}`}>
                <TimelineSeparator>
                  <TimelineDot color="secondary" />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="h6" component="span" color="primary">
                    {t('characteristic')}: {t(`characteristics.${characteristic.key}`)}
                  </Typography>
                  <Typography>{t('weight')}: {characteristic.weight}</Typography>
                </TimelineContent>
              </TimelineItem>
            </AccordionSummary>
            <Timeline
              key="1"
              sx={{
                [`& .${timelineItemClasses.root}:before`]: {
                  flex: 0,
                  padding: 0,
                  marginLeft: 5,
                },
                marginTop: 0
              }}
            >
              {characteristic.subcharacteristics?.map((subcharacteristic) => (
                <TimelineItem key={`subcharacteristic-${characteristic.key}-${subcharacteristic.key}`}>
                  <TimelineSeparator>
                    <TimelineDot color="secondary" />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="h6" component="span" color={hexToRgb("#2484A5")}>
                      {t('subCharacteristic')}: {t(`subCharacteristics.${subcharacteristic.key}`)}
                    </Typography>
                    <Typography>{t('weight')}: {subcharacteristic.weight}</Typography>
                    <Timeline
                      key="2"
                      sx={{
                        [`& .${timelineItemClasses.root}:before`]: {
                          flex: 0,
                          padding: 0,
                        },
                        marginTop: 0
                      }}
                    >
                      {subcharacteristic.measures?.map((measure) => (
                        <TimelineItem key={`measure-${characteristic.key}-${subcharacteristic.key}-${measure.key}`}>
                          <TimelineSeparator>
                            <TimelineDot color="secondary" />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography variant="h6" component="span" color={hexToRgb("#5D698E")}>
                              {t('measure')}: {t(`measures.${measure.key}`)}
                            </Typography>
                            <Typography>{t('weight')}: {measure.weight}</Typography>
                            <Typography>
                              min = {measure.min_threshold} | max = {measure.max_threshold}
                            </Typography>

                            {/* <Timeline
                              key={"3"}
                              sx={{
                                [`& .${timelineItemClasses.root}:before`]: {
                                  flex: 0,
                                  padding: 0,
                                },
                                marginTop: 0
                              }}
                            >
                              {measure.metrics?.map((metric, indexMet) => (
                                <TimelineItem key={`metric-${measure.key}-${subcharacteristic.key}-${characteristic.key}-${indexMet}`}>
                                  <TimelineSeparator>
                                    <TimelineDot color="secondary" />
                                    <TimelineConnector />
                                  </TimelineSeparator>
                                  <TimelineContent>
                                    <Typography variant="h6" component="span" color={"primary"}>
                                      Métrica: {metric.key}
                                    </Typography>
                                    <Typography>Peso: {metric.weight ?? 0}</Typography>
                                  </TimelineContent>
                                </TimelineItem>
                              ))}
                            </Timeline> */}
                          </TimelineContent>
                        </TimelineItem>
                      ))}
                    </Timeline>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Accordion>
        ))}
      </Timeline>
    </Accordion>
  )

  return <>
    <SectionTooltip text={t('basicConfig')} tooltip={t('basicConfigTooltip')} />
    <TextField
      label={t('releaseName')}
      required
      style={{ marginBottom: '24px' }}
      autoFocus
      error={!!errors?.release_name}
      helperText={errors?.release_name?.message}
      {...register('release_name', {
        required: t('releaseNameError'),
      })}
      inputProps={{
        'data-testid': 'apelido-release'
      }}
      fullWidth
    />
    <TextField
      label={t('releaseDesc')}
      style={{ marginBottom: '24px' }}
      error={!!errors?.description}
      helperText={errors?.description?.message}
      {...register('description', {
        maxLength: 512,
      })}
      inputProps={{
        'data-testid': 'descricao-release'
      }}
      multiline
      minRows={3}
      maxRows={8}
      fullWidth
    />
    <Box display="flex">
      <TextField
        label={t('releaseIniDate')}
        required
        type="date"
        style={{ marginRight: '16px' }}
        error={!!errors?.start_at}
        helperText={errors?.start_at?.message}
        {...register('start_at', {
          required: t('releaseIniDateError'),
        })}
        inputProps={{
          'data-testid': 'inicio-release',
          max: watch("end_at")
        }}
        sx={{ flex: 1 }}
      />
      <TextField
        label={t('releaseFinDate')}
        required
        type="date"
        style={{ marginBottom: '24px' }}
        error={!!errors?.end_at}
        helperText={errors?.end_at?.message}
        {...register('end_at', {
          required: t('releaseFinDateError'),
        })}
        inputProps={{
          'data-testid': 'fim-release',
          min: watch("start_at")
        }}
        sx={{ flex: 1 }}
      />
    </Box>
    <FormControlLabel control={<Checkbox
      onClick={() => setFollowLastConfig(!followLastConfig)}
      checked={followLastConfig ?? false}
    />} label={t('followLastConfig')} />
    {renderCurrentConfig()}
  </>
}
