import { useState, useEffect } from 'react';
import { grafanaService } from '@services/grafana';
import { useProductContext } from '@contexts/ProductProvider';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { productQuery } from '@services/product';
import { Repositories } from '@customTypes/product';

interface Options {
  uid: string;
  hasRepoSelector?: boolean;
  repositoryId?: number;
}

export function useGrafanaDashboard({ uid, hasRepoSelector = false, repositoryId: fixedRepoId }: Options) {
  const { currentProduct } = useProductContext();
  const { currentOrganization } = useOrganizationContext();

  const [grafanaUrl, setGrafanaUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [repositories, setRepositories] = useState<Repositories[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<number | undefined>(fixedRepoId);

  useEffect(() => {
    if (fixedRepoId !== undefined) {
      setSelectedRepoId(fixedRepoId);
      return;
    }
    if (!currentProduct || !currentOrganization || !hasRepoSelector) return;

    productQuery
      .getAllRepositories(currentOrganization.id, currentProduct.id)
      .then((res) => {
        const repos: Repositories[] = res.data.results;
        setRepositories(repos);
        if (repos.length > 0) setSelectedRepoId(repos[0].id);
      })
      .catch(() => {});
  }, [currentProduct, currentOrganization, hasRepoSelector, fixedRepoId]);

  useEffect(() => {
    if (!currentProduct) return;
    if (hasRepoSelector && fixedRepoId === undefined && repositories.length > 0 && !selectedRepoId) return;
    if (hasRepoSelector && fixedRepoId === undefined && repositories.length === 0) return;

    setLoading(true);
    setError(false);

    grafanaService
      .getDashboardUrl(uid, Number(currentProduct.id), selectedRepoId)
      .then((res) => {
        setGrafanaUrl(res.data.grafana_url);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [uid, currentProduct, selectedRepoId, hasRepoSelector, repositories.length, fixedRepoId]);

  return { grafanaUrl, loading, error, repositories, selectedRepoId, setSelectedRepoId };
}
