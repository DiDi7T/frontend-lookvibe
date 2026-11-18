export interface UsageReportDto {
  generadoEn: string;
  usuarios: number;
  negocios: number;
  negociosActivos: number;
  citas: number;
  resenas: number;
  citasPorMes: { periodo: string; citas: number }[];
}