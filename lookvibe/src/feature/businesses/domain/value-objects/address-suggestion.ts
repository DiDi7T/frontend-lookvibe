import { InvalidBusinessError } from '../errors/invalid-business-error';
import { BusinessLocation } from './business-location';

export class AddressSuggestion {
  private constructor(
    readonly label: string,
    readonly detail: string,
    readonly location: BusinessLocation,
  ) {}

  static create(input: { label: string; detail: string; latitude: number; longitude: number }): AddressSuggestion {
    const label = input.label.trim();
    if (!label) throw new InvalidBusinessError('La dirección sugerida no tiene descripción.');
    return new AddressSuggestion(label, input.detail.trim(), BusinessLocation.create(input.latitude, input.longitude));
  }
}
