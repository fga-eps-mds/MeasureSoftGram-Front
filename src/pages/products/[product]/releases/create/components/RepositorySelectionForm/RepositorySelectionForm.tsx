import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Checkbox, CircularProgress } from '@mui/material';
import { UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { ReleaseInfoForm } from '@customTypes/preConfig';
import { productQuery } from '@services/product';

interface Props {
  organizationId: string;
  productId: string;
  watch: UseFormWatch<ReleaseInfoForm>;
  setValue: UseFormSetValue<ReleaseInfoForm>;
}

export default function RepositorySelectionForm({ organizationId, productId, watch, setValue }: Props) {
  const [repositories, setRepositories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedIds = watch('repositories_ids') || [];

  useEffect(() => {
    if (organizationId && productId) {
      productQuery.getAllRepositories(organizationId, productId)
        .then(res => {
          const repoList = res?.data?.results || res?.data || [];
          setRepositories(repoList);
          // Optional: pre-select all if not set
          if (!selectedIds.length && repoList.length > 0) {
            setValue('repositories_ids', repoList.map((r: any) => r.id));
          }
          setLoading(false);
        })
        .catch(() => {
          // error handling is done via toast
          setLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, productId, setValue]);

  const handleToggle = (id: number) => {
    const currentIndex = selectedIds.indexOf(id);
    const newChecked = [...selectedIds];

    if (currentIndex === -1) {
      newChecked.push(id);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setValue('repositories_ids', newChecked, { shouldValidate: true });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box mt={2}>
      <Typography variant="h5" color="text.primary" gutterBottom>
        Selecionar Repositórios da Release
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Selecione quais repositórios deste produto farão parte desta release. O modelo matemático e os cálculos de qualidade serão restritos aos repositórios selecionados.
      </Typography>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" mb={2}>
          Repositórios Disponíveis
        </Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          {repositories.map(repo => {
            const isSelected = selectedIds.includes(repo.id);
            return (
              <Paper
                key={repo.id}
                variant="outlined"
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  borderColor: isSelected ? '#1976d2' : 'divider',
                  bgcolor: isSelected ? '#f5f9ff' : 'background.paper',
                  cursor: 'pointer'
                }}
                onClick={() => handleToggle(repo.id)}
              >
                <Checkbox
                  checked={isSelected}
                  onChange={() => {}} // dummy onChange because onClick is handled by Paper
                  color="primary"
                  sx={{ pointerEvents: 'none' }} // click goes to the Paper
                />
                <Box ml={1}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {repo.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {repo.description || "Nenhuma descrição"}
                  </Typography>
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
}
