'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { toHttpErrorMessage } from '../../../../shared/presentation/http-error-message';
import type { SaveBusinessScheduleInput } from '../../application/use-cases/save-business-schedule.use-case';
import type { UpdateBusinessInput } from '../../application/use-cases/update-business.use-case';
import { businessesContainer } from '../../di/businesses.container';
import type { Business } from '../../domain/entities/business';
import { BusinessNotFoundError } from '../../domain/errors/business-not-found-error';
import { InvalidBusinessError } from '../../domain/errors/invalid-business-error';
import type { BusinessDraftInput } from '../../domain/value-objects/business-draft';

interface BusinessesLoadingState {
  list: boolean;
  detail: boolean;
  action: boolean;
}

interface BusinessesContextValue {
  myBusinesses: Business[];
  selectedBusiness: Business | null;
  loading: BusinessesLoadingState;
  error: string | null;
  success: string | null;
  loadMyBusinesses: () => Promise<void>;
  loadMyBusiness: (id: string) => Promise<Business | null>;
  createBusiness: (input: BusinessDraftInput) => Promise<Business | null>;
  updateBusiness: (input: UpdateBusinessInput) => Promise<Business | null>;
  saveSchedule: (input: SaveBusinessScheduleInput) => Promise<boolean>;
  clearFeedback: () => void;
}

const BusinessesContext = createContext<BusinessesContextValue | null>(null);

export function BusinessesProvider({ children }: { children: ReactNode }) {
  const [myBusinesses, setMyBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState<BusinessesLoadingState>({ list: false, detail: false, action: false });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const begin = useCallback((key: keyof BusinessesLoadingState) => {
    setError(null);
    setSuccess(null);
    setLoading((current) => ({ ...current, [key]: true }));
  }, []);

  const finish = useCallback((key: keyof BusinessesLoadingState) => {
    setLoading((current) => ({ ...current, [key]: false }));
  }, []);

  const loadMyBusinesses = useCallback(async () => {
    begin('list');
    try {
      setMyBusinesses(await businessesContainer.getMyBusinesses.execute());
    } catch (reason: unknown) {
      setError(toUserMessage(reason));
    } finally {
      finish('list');
    }
  }, [begin, finish]);

  const loadMyBusiness = useCallback(async (id: string) => {
    begin('detail');
    try {
      const business = await businessesContainer.getMyBusiness.execute(id);
      setSelectedBusiness(business);
      return business;
    } catch (reason: unknown) {
      setSelectedBusiness(null);
      setError(toUserMessage(reason));
      return null;
    } finally {
      finish('detail');
    }
  }, [begin, finish]);

  const createBusiness = useCallback(async (input: BusinessDraftInput) => {
    begin('action');
    try {
      const business = await businessesContainer.createBusiness.execute(input);
      setMyBusinesses((current) => [...current, business]);
      setSuccess('El negocio se creó correctamente.');
      return business;
    } catch (reason: unknown) {
      setError(toUserMessage(reason));
      return null;
    } finally {
      finish('action');
    }
  }, [begin, finish]);

  const updateBusiness = useCallback(async (input: UpdateBusinessInput) => {
    begin('action');
    try {
      const business = await businessesContainer.updateBusiness.execute(input);
      setSelectedBusiness(business);
      setMyBusinesses((current) => current.map((item) => (item.id === business.id ? business : item)));
      setSuccess('Los datos del negocio se guardaron.');
      return business;
    } catch (reason: unknown) {
      setError(toUserMessage(reason));
      return null;
    } finally {
      finish('action');
    }
  }, [begin, finish]);

  const saveSchedule = useCallback(async (input: SaveBusinessScheduleInput) => {
    begin('action');
    try {
      await businessesContainer.saveBusinessSchedule.execute(input);
      setSuccess('El horario de atención se guardó.');
      return true;
    } catch (reason: unknown) {
      setError(toUserMessage(reason));
      return false;
    } finally {
      finish('action');
    }
  }, [begin, finish]);

  const clearFeedback = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const value = useMemo<BusinessesContextValue>(() => ({
    myBusinesses,
    selectedBusiness,
    loading,
    error,
    success,
    loadMyBusinesses,
    loadMyBusiness,
    createBusiness,
    updateBusiness,
    saveSchedule,
    clearFeedback,
  }), [
    myBusinesses,
    selectedBusiness,
    loading,
    error,
    success,
    loadMyBusinesses,
    loadMyBusiness,
    createBusiness,
    updateBusiness,
    saveSchedule,
    clearFeedback,
  ]);

  return <BusinessesContext.Provider value={value}>{children}</BusinessesContext.Provider>;
}

export function useBusinesses(): BusinessesContextValue {
  const context = useContext(BusinessesContext);
  if (!context) {
    throw new Error('useBusinesses debe usarse dentro de BusinessesProvider.');
  }
  return context;
}

function toUserMessage(reason: unknown): string {
  if (reason instanceof InvalidBusinessError || reason instanceof BusinessNotFoundError) return reason.message;
  return toHttpErrorMessage(reason, 'No se encontró el negocio solicitado.')
    ?? 'No se pudo completar la operación. Inténtalo nuevamente.';
}
