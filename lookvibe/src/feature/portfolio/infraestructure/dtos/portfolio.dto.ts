export interface PortfolioItemDto {
  id: string;
  fotoUrl: string;
  descripcion: string | null;
  createdAt: string;
}

export interface PortfolioRequestDto {
  fotoUrl: string;
  descripcion?: string;
}
