import type { Metadata } from 'next';
import { MyStylistProfile } from '../../../feature/stylists/presentation/components/my-stylist-profile';

export const metadata: Metadata = {
  title: 'Mi perfil de estilista | LookVibe',
  description: 'Crea o abre tu perfil profesional de estilista en LookVibe.',
};

interface MyStylistPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MyStylistPage({ searchParams }: MyStylistPageProps) {
  const { i } = await searchParams;
  const inviteToken = (Array.isArray(i) ? i[0] : i)?.trim() || null;
  return <MyStylistProfile inviteToken={inviteToken} />;
}
