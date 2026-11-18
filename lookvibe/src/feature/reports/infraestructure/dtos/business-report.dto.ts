export interface BusinessReportSeriesDto {
  periodo: string;
  total: number;
  pendientes: number;
  completadas: number;
  canceladas: number;
  noRealizadas: number;
}

export interface BusinessReportDto {
  negocio: { id: string; nombre: string };
  periodo: { desde: string; hasta: string; zonaHoraria: string };
  citas: {
    total: number;
    pendientes: number;
    completadas: number;
    canceladas: number;
    noRealizadas: number;
    semanal: BusinessReportSeriesDto[];
    mensual: BusinessReportSeriesDto[];
  };
  servicioMasSolicitado: { id: string; nombre: string; cantidad: number } | null;
  ingresosEstimados: number;
  calificacionPromedio: number | null;
  cantidadResenas: number;
}