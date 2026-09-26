import React from 'react';
import { Box, FormControlLabel, Grid, Switch, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Characteristic, PreConfigData } from '@customTypes/preConfig';
import { StyledSlider } from '@components/Equalizer/EqualizerSlider/styles';
import SectionTooltip from '../SectionTooltip/SectionTooltip';

interface CharacteristicsBalanceFormProps {
  dinamicBalance: boolean;
  setDinamicBalance: (value: boolean) => void;
  configPageData: PreConfigData;
  setConfigPageData: any;
  characteristicRelations: any;
}

export default function CharacteristicsBalanceForm({ 
  configPageData, 
  setConfigPageData, 
  dinamicBalance, 
  setDinamicBalance, 
  characteristicRelations 
}: CharacteristicsBalanceFormProps) {
  const { t } = useTranslation('plan_release');

  const activeCharacteristics = configPageData?.characteristics?.filter(c => c.active) || [];
  const totalItems = activeCharacteristics.length;

// Lógica de Grid Simétrico: Balanceia os itens de forma igual entre as linhas
  const maxColsScreen = 6; 
  const numRows = totalItems > 0 ? Math.ceil(totalItems / maxColsScreen) : 1;
  const optimalCols = totalItems > 0 ? Math.ceil(totalItems / numRows) : 1;

  function handleCharacteristicChange(event: any, characteristicKey: string) {
    const { value } = event.target;
    const newGoal = Number(value);

    setConfigPageData((prevData: { characteristics: Characteristic[] }) => {
      let relatedCharacteristics: string[] = [];
      
      if (!dinamicBalance) {
        relatedCharacteristics = characteristicRelations[characteristicKey]?.["+"] || [];
      }

      return {
        ...prevData,
        characteristics: prevData.characteristics.map((characteristic: Characteristic) => {
          if (characteristic.key === characteristicKey || relatedCharacteristics.includes(characteristic.key)) {
            return {
              ...characteristic,
              goal: newGoal,
            };
          }
          return characteristic;
        }),
      };
    });
  }

  return (
    <>
      <SectionTooltip text={t("balanceGoal")} tooltip={t("balanceGoalTooltip")} />
      <FormControlLabel
        sx={{ marginLeft: 0, marginBottom: 2 }}
        control={
          <Switch
            data-testid="allowBalanceGoal"
            checked={dinamicBalance}
            // eslint-disable-next-line react/jsx-no-bind
            onChange={() => setDinamicBalance(!dinamicBalance)}
            color="primary" 
          />
        }
        label={t("allowBalanceGoal")}
        labelPlacement="start"
      />
      
      {/* APLICANDO CSS GRID E LIMITANDO A ALTURA COM SCROLL */}
      <Box sx={{ 
        border: 1, 
        borderRadius: 3, 
        paddingX: 3, 
        paddingY: 6, 
        width: '100%',
      }}>
        <Box 
          display="grid" 
          gridTemplateColumns={`repeat(${optimalCols}, 1fr)`} // Cria no máximo 6 colunas
          gap={6} // Espaçamento fixo entre os sliders
          justifyItems="center" // Centraliza o slider na coluna
          alignItems="center" 
        >
          {activeCharacteristics.map(characteristic => (
            <Grid 
              container 
              key={`GridCharacteristicsBalance-${characteristic.key}`} 
              gap={2} 
              direction="column" 
              sx={{ width: '100%', maxWidth: '120px' }} // Mantém o slider fininho
            >
              <Grid item xs={9} display="flex" justifyContent="center">
                <StyledSlider
                  data-testid={`characteristic-${characteristic.key}`}
                  sx={{ minHeight: "15rem" }}
                  value={characteristic.goal}
                  // eslint-disable-next-line react/jsx-no-bind
                  onChange={(event: any) => handleCharacteristicChange(event, characteristic.key)}
                  orientation="vertical"
                  valueLabelDisplay="auto"
                />
              </Grid>
              <Grid item xs={2} display="flex" alignItems="center" justifyContent="center">
                <Typography fontSize="14px" align="center">
                  {t(`characteristics.${characteristic.key}`)}
                </Typography>
              </Grid>
            </Grid>
          ))}
        </Box>
      </Box>
    </>
  );
}