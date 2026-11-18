export interface StylistProfileRegistry {
  findProfileId(userId: string): string | null;
  rememberProfileId(userId: string, stylistId: string): void;
}
