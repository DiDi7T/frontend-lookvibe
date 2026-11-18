'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { toHttpErrorMessage } from '../../../../shared/presentation/http-error-message';
import type { CreateServiceInput } from '../../application/use-cases/create-service.use-case';
import type { DeleteServiceInput } from '../../application/use-cases/delete-service.use-case';
import type { UpdateServiceInput } from '../../application/use-cases/update-service.use-case';
import { servicesContainer } from '../../di/services.container';
import type { Service } from '../../domain/entities/service';
import { InvalidServiceError } from '../../domain/errors/invalid-service-error';

interface ServicesLoadingState {
  list: boolean;
  action: boolean;
}

interface ServicesContextValue {
  services: Service[];
  loading: ServicesLoadingState;
  error: string | null;
  success: string | null;
  loadManagedServices: (businessId: string) => Promise<void>;
  createService: (input: CreateServiceInput) => Promise<boolean>;
  updateService: (input: UpdateServiceInput) => Promise<boolean>;
  deleteService: (input: DeleteServiceInput) => Promise<boolean>;
}

const ServicesContext = createContext<ServicesContextValue | null>(null);

export function ServicesProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<ServicesLoadingState>({ list: false, action: false });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const begin = useCallback((key: keyof ServicesLoadingState) => {
    setError(null);
    setSuccess(null);
    setLoading((current) => ({ ...current, [key]: true }));
  }, []);

  const finish = useCallback((key: keyof ServicesLoadingState) => {
    setLoading((current) => ({ ...current, [key]: false }));
  }, []);

  const loadManagedServices = useCallback(async (businessId: string) => {
    begin('list');
    try {
      setServices(await servicesContainer.getManagedServices.execute(businessId));
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

  const createService = useCallback((input: CreateServiceInput) => runAction(async () => {
    const service = await servicesContainer.createService.execute(input);
    setServices((current) => [...current, service]);
  }, 'El servicio se agregó.'), [runAction]);

  const updateService = useCallback((input: UpdateServiceInput) => runAction(async () => {
    const service = await servicesContainer.updateService.execute(input);
    setServices((current) => current.map((item) => (item.id === service.id ? service : item)));
  }, 'El servicio se actualizó.'), [runAction]);

  const deleteService = useCallback((input: DeleteServiceInput) => runAction(async () => {
    await servicesContainer.deleteService.execute(input);
    setServices((current) => current.filter((item) => item.id !== input.serviceId));
  }, 'El servicio se eliminó.'), [runAction]);

  const value = useMemo<ServicesContextValue>(() => ({
    services,
    loading,
    error,
    success,
    loadManagedServices,
    createService,
    updateService,
    deleteService,
  }), [services, loading, error, success, loadManagedServices, createService, updateService, deleteService]);

  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>;
}

export function useServices(): ServicesContextValue {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error('useServices debe usarse dentro de ServicesProvider.');
  }
  return context;
}

function toUserMessage(reason: unknown): string {
  if (reason instanceof InvalidServiceError) return reason.message;
  return toHttpErrorMessage(reason, 'No se encontró el servicio.')
    ?? 'No se pudo completar la operación. Inténtalo nuevamente.';
}
