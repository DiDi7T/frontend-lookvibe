import type { StylistProfileRegistry } from '../repositories/stylist-profile-registry';

export class GetMyStylistProfileIdUseCase {
  constructor(private readonly registry: StylistProfileRegistry) {}

  execute(userId: string): string | null {
    const id = userId.trim();
    return id ? this.registry.findProfileId(id) : null;
  }
}
