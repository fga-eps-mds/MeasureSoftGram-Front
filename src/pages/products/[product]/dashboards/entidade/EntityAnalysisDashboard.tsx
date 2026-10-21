import React, { useCallback, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';
import ReleaseSelect from '@components/ReleaseSelect';
import useRequireAuth from '@hooks/useRequireAuth';
import { usePreloadECharts } from '@components/ECharts';
import { useProviderTerms } from '@hooks/useProviderTerms';
import { getPathId } from '@utils/pathDestructer';
import { EntityAnalysisRepository, EntityLevel } from '@customTypes/product';
import { formatReferenceCaption, hasAnyValue, LEVEL_LABELS } from '@utils/formatEntityAnalysisChart';
import { useEntityAnalysis } from './useEntityAnalysis';
import EntityAnalysisChart from './EntityAnalysisChart';
import RepositoryDetailDialog from './RepositoryDetailDialog';

const TITLE = 'Análise por Entidade';
const LEVELS = Object.keys(LEVEL_LABELS) as EntityLevel[];

const EntityAnalysisDashboard: NextPageWithLayout = () => {
  useRequireAuth();
  usePreloadECharts();
  const { terms } = useProviderTerms();
  const router = useRouter();
  const [organizationId, productId] = getPathId(router.query?.product as string);

  const {
    releases,
    releaseId,
    currentReleaseId,
    setReleaseId,
    level,
    setLevel,
    entities,
    entityKey,
    setEntityKey,
    analysis,
    hasNoEntities,
    isLoadingReleases,
    isLoading,
    error,
    retry,
  } = useEntityAnalysis(organizationId, productId);

  const [showReference, setShowReference] = useState(true);
  const [selectedRepository, setSelectedRepository] = useState<EntityAnalysisRepository | null>(null);
  const closeDetail = useCallback(() => setSelectedRepository(null), []);

  const goToReleases = () => {
    void router.push(`/products/${router.query.product}/releases`);
  };

  const renderContent = () => {
    if (error) {
      return (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={retry}>
              Tentar novamente
            </Button>
          }
        >
          Não foi possível carregar a análise por entidade.
        </Alert>
      );
    }

    if (!isLoadingReleases && releases.length === 0) {
      return (
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={goToReleases}>
              Ir para releases
            </Button>
          }
        >
          Este produto ainda não tem releases. Crie uma release para comparar os {terms.repositories} em uma
          entidade do modelo.
        </Alert>
      );
    }

    if (hasNoEntities) {
      const releaseName = releases.find((release) => release.id === releaseId)?.release_name;
      // o Service só lista métricas com valor do projeto inteiro (qualifier TRK) na release
      if (level === 'metric') {
        return (
          <Alert severity="info">
            Nenhuma métrica da release {releaseName} tem valor por {terms.repository}. Os valores por arquivo
            ficam no dashboard 5. Distribuição das Métricas.
          </Alert>
        );
      }
      return (
        <Alert severity="info">
          A configuração da release {releaseName} não tem nenhuma entidade no nível {LEVEL_LABELS[level]}.
        </Alert>
      );
    }

    if (isLoading || !analysis) {
      return (
        <Box display="flex" justifyContent="center" padding={6}>
          <CircularProgress />
        </Box>
      );
    }

    if (!hasAnyValue(analysis)) {
      return (
        <Alert severity="info">
          A release {analysis.release.release_name} ainda não tem análise de {analysis.entity.name}. Os valores
          aparecem depois que a Action do MeasureSoftGram roda nos {terms.repositories} dentro do período da
          release.
        </Alert>
      );
    }

    const referenceCaption = showReference ? formatReferenceCaption(analysis) : null;

    return (
      <>
        {referenceCaption && (
          <Typography variant="body2" color="text.secondary" data-testid="entity-reference">
            {referenceCaption}
          </Typography>
        )}
        <EntityAnalysisChart
          analysis={analysis}
          showReference={showReference}
          onSelectRepository={setSelectedRepository}
        />
        <Typography variant="caption" color="text.secondary">
          Clique em uma barra para ver a decomposição de {analysis.entity.name} naquele{' '}
          {terms.repository}.
        </Typography>
        <RepositoryDetailDialog analysis={analysis} repository={selectedRepository} onClose={closeDetail} />
      </>
    );
  };

  return (
    <>
      <Head>
        <title>{TITLE}</title>
      </Head>

      <Container maxWidth="xl">
        <Box display="flex" flexDirection="column" gap={2} marginTop="40px">
          <Typography variant="h4" color="#33568E" fontWeight="500">
            {TITLE}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Compare os {terms.repositories} do produto em uma entidade do modelo, do pior para o melhor valor
            na release.
          </Typography>

          {releases.length > 0 && (
            <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
              <ReleaseSelect
                releases={releases}
                value={releaseId}
                currentReleaseId={currentReleaseId}
                onChange={setReleaseId}
                disabled={isLoadingReleases}
              />

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="entity-analysis-level">Nível</InputLabel>
                <Select
                  labelId="entity-analysis-level"
                  label="Nível"
                  value={level}
                  onChange={(event) => setLevel(event.target.value as EntityLevel)}
                >
                  {LEVELS.map((item) => (
                    <MenuItem key={item} value={item}>
                      {LEVEL_LABELS[item]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 260 }} disabled={entities.length === 0}>
                <InputLabel id="entity-analysis-entity">Entidade</InputLabel>
                <Select
                  labelId="entity-analysis-entity"
                  label="Entidade"
                  value={entityKey ?? ''}
                  onChange={(event) => setEntityKey(event.target.value)}
                >
                  {entities.map((entity) => (
                    <MenuItem key={entity.key} value={entity.key}>
                      {entity.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {(level === 'characteristic' || level === 'measure') && (
                <FormControlLabel
                  control={
                    <Checkbox checked={showReference} onChange={(event) => setShowReference(event.target.checked)} />
                  }
                  label="Mostrar meta e faixa de referência"
                />
              )}
            </Box>
          )}

          <Paper
            elevation={0}
            sx={{
              border: '1px solid #d0d7de',
              borderRadius: '8px',
              padding: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {renderContent()}
          </Paper>
        </Box>
      </Container>
    </>
  );
};

EntityAnalysisDashboard.getLayout = getLayout;

export default EntityAnalysisDashboard;
