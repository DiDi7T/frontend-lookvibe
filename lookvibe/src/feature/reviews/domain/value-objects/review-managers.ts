export interface ReviewManagersInput {
  userIds: readonly (string | null | undefined)[];
  businessId?: string | null;
}

export class ReviewManagers {
  private constructor(
    readonly userIds: readonly string[],
    readonly businessId: string | null,
  ) {}

  static create(input: ReviewManagersInput): ReviewManagers {
    const userIds = input.userIds.filter((id): id is string => Boolean(id?.trim()));
    return new ReviewManagers([...new Set(userIds)], input.businessId?.trim() || null);
  }

  includes(userId: string, ownedBusinessIds: readonly string[] = []): boolean {
    if (this.userIds.includes(userId)) return true;
    return this.businessId !== null && ownedBusinessIds.includes(this.businessId);
  }
}
