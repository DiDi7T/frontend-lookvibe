'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { toHttpErrorMessage } from '../../../../shared/presentation/http-error-message';
import type { AcceptAffiliationInput } from '../../application/use-cases/accept-affiliation.use-case';
import type { CreateStylistInput } from '../../application/use-cases/create-stylist.use-case';
import type { UpdateStylistInput } from '../../application/use-cases/update-stylist.use-case';
import { stylistsContainer } from '../../di/stylists.container';
import type { Stylist } from '../../domain/entities/stylist';
import { AffiliationError } from '../../domain/errors/affiliation-error';
import { InvalidStylistError } from '../../domain/errors/invalid-stylist-error';

interface StylistsLoadingState {
  list: boolean;
  action: boolean;
}

interface StylistsContextValue {
  stylists: Stylist[];
  loading: StylistsLoadingState;
  error: string | null;
  success: string | null;
  loadManagedStylists: (businessId: string) => Promise<void>;
  createStylist: (input: CreateStylistInput) => Promise<boolean>;
  updateStylist: (input: UpdateStylistInput) => Promise<boolean>;
  deleteStylist: (stylistId: string) => Promise<boolean>;
  acceptAffiliation: (input: AcceptAffiliationInput) => Promise<boolean>;
}

const StylistsContext = createContext<StylistsContextValue | null>(null);

export function StylistsProvider({ children }: { children: ReactNode }) {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState<StylistsLoadingState>({ list: false, action: false });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const begin = useCallback((key: keyof StylistsLoadingState) => {
    setError(null);
    setSuccess(null);
    setLoading((current) => ({ ...current, [key]: true }));
  }, []);

  const finish = useCallback((key: keyof StylistsLoadingState) => {
    setLoading((current) => ({ ...current, [key]: false }));
  }, []);

  const loadManagedStylists = useCallback(async (businessId: string) => {
    begin('list');
    try {
      setStylists(await stylistsContainer.getManagedStylists.execute(businessId));
    } catch (reason: unknown) {
      setError(toUserMessage(reason));
    } finally {
      finish('list');
    }
  }, [begin, finish]);

  const runAction = useCallback(async (action: () => Promise<void>, message: string) => {
    begin('action');
    try {
      await action();
      setSuccess(message);
      return true;
    } catch (reason: unknown) {
      setError(toUserMessage(reason));
      return false;
    } finally {
      finish('action');
    }
  }, [begin, finish]);

  const createStylist = useCallback((input: CreateStylistInput) => runAction(async () => {
    const stylist = await stylistsContainer.createStylist.execute(input);
    setStylists((current) => [...current, stylist]);
  }, 'El estilista se agregó al equipo.'), [runAction]);

  const updateStylist = useCallback((input: UpdateStylistInput) => runAction(async () => {
    const stylist = await stylistsContainer.updateStylist.execute(input);
    setStylists((current) => current.map((item) => (item.id === stylist.id ? stylist : item)));
  }, 'El estilista se actualizó.'), [runAction]);

  const deleteStylist = useCallback((stylistId: string) => runAction(async () => {
    await stylistsContainer.deleteStylist.execute(stylistId);
    setStylists((current) => current.filter((item) => item.id !== stylistId));
  }, 'El estilista se retiró del equipo.'), [runAction]);

  const acceptAffiliation = useCallback((input: AcceptAffiliationInput) => runAction(async () => {
    const stylist = await stylistsContainer.acceptAffiliation.execute(input);
    setStylists((current) => [...current.filter((item) => item.id !== stylist.id), stylist]);
  }, 'El estilista ya hace parte de tu equipo.'), [runAction]);

  const value = useMemo<StylistsContextValue>(() => ({
    stylists,
    loading,
    error,
    success,
    loadManagedStylists,
    createStylist,
    updateStylist,
    deleteStylist,
    acceptAffiliation,
  }), [stylists, loading, error, success, loadManagedStylists, createStylist, updateStylist, deleteStylist, acceptAffiliation]);

  return <StylistsContext.Provider value={value}>{children}</StylistsContext.Provider>;
}

export function useStylists(): StylistsContextValue {
  const context = useContext(StylistsContext);
  if (!context) {
    throw new Error('useStylists debe usarse dentro de StylistsProvider.');
  }
  return context;
}

function toUserMessage(reason: unknown): string {
  if (reason instanceof InvalidStylistError || reason instanceof AffiliationError) return reason.message;
  return toHttpErrorMessage(reason, 'No se encontró el estilista.')
    ?? 'No se pudo completar la operación. Inténtalo nuevamente.';
}
