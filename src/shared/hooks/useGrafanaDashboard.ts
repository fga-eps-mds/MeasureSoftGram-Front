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

  const productId = currentProduct?.id;
  const organizationId = currentOrganization?.id;

  useEffect(() => {
    if (fixedRepoId !== undefined) {
      setSelectedRepoId(fixedRepoId);
      return undefined;
    }
    if (!productId || !organizationId || !hasRepoSelector) return undefined;

    let cancelled = false;
    productQuery
      .getAllRepositories(organizationId, productId)
      .then((res) => {
        if (cancelled) return;
        const repos: Repositories[] = res.data.results;
        setRepositories(repos);
        if (repos.length > 0) setSelectedRepoId(repos[0].id);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [productId, organizationId, hasRepoSelector, fixedRepoId]);

  useEffect(() => {
    if (!productId) return undefined;
    if (hasRepoSelector && fixedRepoId === undefined && repositories.length > 0 && !selectedRepoId) return undefined;
    if (hasRepoSelector && fixedRepoId === undefined && repositories.length === 0) return undefined;

    let cancelled = false;
    setLoading(true);
    setError(false);

    grafanaService
      .getDashboardUrl(uid, Number(productId), selectedRepoId)
      .then((res) => {
        if (cancelled) return;
        setGrafanaUrl(res.data.grafana_url);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [uid, productId, selectedRepoId, hasRepoSelector, repositories.length, fixedRepoId]);

  return { grafanaUrl, loading, error, repositories, selectedRepoId, setSelectedRepoId };
}
