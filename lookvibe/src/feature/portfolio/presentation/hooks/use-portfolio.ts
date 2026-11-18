'use client';

import { useCallback, useEffect, useState } from 'react';
import { toHttpErrorMessage } from '../../../../shared/presentation/http-error-message';
import type { PortfolioDraftInput } from '../../domain/value-objects/portfolio-draft';
import type { PortfolioOwnerKind } from '../../domain/value-objects/portfolio-owner';
import type { PortfolioItem } from '../../domain/entities/portfolio-item';
import { InvalidPortfolioError } from '../../domain/errors/invalid-portfolio-error';
import { portfolioContainer } from '../../di/portfolio.container';

interface PortfolioState {
  key: string;
  items: PortfolioItem[];
  loadError: string | null;
}

export function usePortfolio(ownerKind: PortfolioOwnerKind, ownerId: string) {
  const key = `${ownerKind}:${ownerId}`;
  const [state, setState] = useState<PortfolioState | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    portfolioContainer.getPortfolio
      .execute(ownerKind, ownerId)
      .then((items) => {
        if (active) setState({ key, items, loadError: null });
      })
      .catch((reason: unknown) => {
        if (active) setState({ key, items: [], loadError: toUserMessage(reason) });
      });
    return () => {
      active = false;
    };
  }, [key, ownerKind, ownerId]);

  const add = useCallback(async (input: PortfolioDraftInput) => {
    setAdding(true);
    setError(null);
    setSuccess(null);
    try {
      const item = await portfolioContainer.addPortfolioPhoto.execute({ ...input, ownerKind, ownerId });
      setState((current) => ({ key, items: [item, ...(current?.key === key ? current.items : [])], loadError: null }));
      setSuccess('La foto se agregó al portafolio.');
      return true;
    } catch (reason: unknown) {
      setError(toUserMessage(reason));
      return false;
    } finally {
      setAdding(false);
    }
  }, [key, ownerKind, ownerId]);

  const current = state?.key === key ? state : null;

  return {
    items: current?.items ?? [],
    loading: current === null,
    loadError: current?.loadError ?? null,
    adding,
    error,
    success,
    add,
  };
}

function toUserMessage(reason: unknown): string {
  if (reason instanceof InvalidPortfolioError) return reason.message;
  return toHttpErrorMessage(reason, 'El portafolio estará disponible cuando el perfil esté publicado.')
    ?? 'No se pudo completar la operación. Inténtalo nuevamente.';
}
