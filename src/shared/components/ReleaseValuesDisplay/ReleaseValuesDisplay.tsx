import { Characteristic } from '@customTypes/product';
import { Divider, Grid, Paper, Stack, Tooltip, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";

export interface ReleaseValuesDisplayProps {
  planned: Characteristic[];
  accomplised: Characteristic[];
  normDiff?: number;
}

export default function ReleaseValuesDisplay({ planned, accomplised, normDiff }: ReleaseValuesDisplayProps) {
  const { t } = useTranslation('release');

  const [spacing, setSpacing] = useState(0);
  const [normDiffMarginLeft, setNormDiffMarginLeft] = useState(0);
  const [diff, setDiff] = useState<number[]>([]);

  useEffect(() => {
    const SPACING_BY_CHARACTERISTICS_LENGTH = [0, 0, 55, 33, 23, 16, 13, 10, 8]
    const MARGIN_LEFT_BY_CHARACTERISTICS_LENGTH = [30.5, 30.5, 0.5, 30.5, 16.5, 9.5, 4.5, 1.5, 12]

    setSpacing(SPACING_BY_CHARACTERISTICS_LENGTH[planned.length])
    setNormDiffMarginLeft(MARGIN_LEFT_BY_CHARACTERISTICS_LENGTH[planned.length])

  }, [planned])

  useEffect(() => {
    const diffAux: any = []

    planned.forEach((characteristic) => {
      const accomplishedCharacteristic = accomplised.find(el => el.name === characteristic.name)

      if (accomplishedCharacteristic) {
        diffAux.push(accomplishedCharacteristic.diff)
      }
    })

    setDiff(diffAux)

  }, [planned, accomplised])

  const renderPaper = (value: string, isNormDiff: boolean = false) => (
    <Paper elevation={2} sx={{
      height: 40,
      width: isNormDiff ? 60 : 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {value}
    </Paper>
  )

  const renderCharacteristicsValues = (name: string, characteristics: Characteristic[]) => (
    < Grid container>
      <Grid item xs={1.6}>
        <Typography p={2}>
          {name}
        </Typography>
      </Grid>
      <Grid item xs={10}>
        <Stack direction='row' spacing={spacing} display='flex' justifyContent='center'>
          {characteristics.map(characteristic => (
            renderPaper(characteristic.value.toFixed(2))
          ))}
        </Stack>
      </Grid>
    </Grid >
  )

  const renderDiffValues = (values: number[]) => (
    <Grid container>
      <Grid item xs={1.6}>
        <Typography p={2}>
          {t('diff')}
        </Typography>
      </Grid>
      <Grid item xs={10}>
        <Stack direction='row' spacing={spacing} display='flex' justifyContent='center'>
          {values.map(value => (
            renderPaper(value.toFixed(2))
          ))}
        </Stack>
      </Grid>
    </Grid>
  )

  const renderNormDiff = () => (
    normDiff ? (
      <>
        <Divider sx={{ m: 1 }} />
        <Grid container>
          <Grid item xs={3} display="flex" alignItems='center'>
            <Typography p={2} pr={1}>
              {t('norm-diff.title')}
            </Typography>
            <Tooltip title={t('norm-diff.tooltip')} >
              <InfoOutlinedIcon fontSize='small' />
            </Tooltip>
          </Grid>
          <Grid item xs={8} alignItems='center' display='flex'>
            <Stack direction='row' spacing={spacing} sx={{ ml: 4 }}>
              {renderPaper(normDiff.toFixed(2), true)}
            </Stack>
          </Grid>
        </Grid>
      </>) : null
  )


  return <Stack height='fit-content' sx={{ mt: 2 }}>

    {renderCharacteristicsValues(t('planned'), planned)}

    {renderCharacteristicsValues(t('accomplised'), accomplised)}

    {renderDiffValues(diff)}

    {renderNormDiff()}

  </Stack>;
}
