import React from 'react';
import { Box, Button, Chip, List, ListItem, Typography } from '@mui/material';
import { AddCircle, CheckCircle } from '@mui/icons-material';
import type { ProviderTerms } from '@utils/providerTerminology';
import type { UnifiedRepoItem } from '../hooks/useImportRepos';

interface ImportRepoListProps {
  repos: UnifiedRepoItem[];
  terms: ProviderTerms;
  isImported: (repo: UnifiedRepoItem) => boolean;
  onImport: (repo: UnifiedRepoItem) => void;
  // enquanto não se sabe o que o produto já tem importado, importar poderia duplicar
  importDisabled?: boolean;
}

const itemSx = {
  padding: '1.5rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: '1px solid',
  borderColor: 'divider',
  '&:last-child': { borderBottom: 'none' },
  transition: 'background-color 0.2s',
  '&:hover': { backgroundColor: 'action.hover' }
};

const ImportRepoList = ({ repos, terms, isImported, onImport, importDisabled = false }: ImportRepoListProps) => {
  if (repos.length === 0) {
    return (
      <Box padding="3rem" textAlign="center">
        <Typography variant="body1" color="text.secondary">
          {`Nenhum ${terms.repository} associado a este produto foi encontrado.`}
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ padding: 0 }}>
      {repos.map((repo) => (
        <ListItem key={repo.url || repo.gitlab_project_id || repo.github_repo_id} sx={itemSx}>
          <Box display="flex" flexDirection="column" gap="0.5rem" flexGrow={1}>
            <Box display="flex" alignItems="center" gap="1rem">
              <Typography variant="subtitle1" fontWeight="bold">
                {repo.gitlab_path_with_namespace || repo.github_full_name || repo.name}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {repo.description}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap="1rem" marginLeft="2rem">
            {isImported(repo) ? (
              <Chip
                icon={<CheckCircle color="success" />}
                label="Importado"
                variant="outlined"
                color="success"
                sx={{ fontWeight: '500', minWidth: '110px' }}
              />
            ) : (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddCircle />}
                disabled={importDisabled}
                onClick={() => onImport(repo)}
                sx={{ textTransform: 'none', fontWeight: 'bold', minWidth: '110px', borderRadius: '8px' }}
              >
                Importar
              </Button>
            )}
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

export default ImportRepoList;
