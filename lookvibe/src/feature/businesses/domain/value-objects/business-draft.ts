import { InvalidBusinessError } from '../errors/invalid-business-error';
import { BusinessLocation } from './business-location';

export interface BusinessDraftInput {
  name: string;
  description: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

export class BusinessDraft {
  private constructor(
    readonly name: string,
    readonly description: string | null,
    readonly address: string | null,
    readonly location: BusinessLocation | null,
  ) {}

  static create(input: BusinessDraftInput): BusinessDraft {
    const name = input.name.trim();
    if (!name) throw new InvalidBusinessError('El nombre del negocio es obligatorio.');
    if (name.length > 120) throw new InvalidBusinessError('El nombre no puede superar 120 caracteres.');

    const description = optionalText(input.description, 1000, 'La descripción');
    const address = optionalText(input.address, 255, 'La dirección');

    return new BusinessDraft(
      name,
      description,
      address,
      BusinessLocation.fromOptional(input.latitude, input.longitude),
    );
  }
}

function optionalText(value: string, maxLength: number, label: string): string | null {
  const text = value.trim();
  if (!text) return null;
  if (text.length > maxLength) {
    throw new InvalidBusinessError(`${label} no puede superar ${maxLength} caracteres.`);
  }
  return text;
}
