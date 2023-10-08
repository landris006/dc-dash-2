import { db } from '@/lib/db';
import Header from './Header';
import { redirect } from 'next/navigation';

export default async function ServerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { guildId: string };
}) {
  const guild = await db.guild.findUnique({
    where: {
      id: params.guildId,
    },
  });

  if (!guild) {
    redirect('/servers');
  }

  return (
    <>
      <Header guild={guild}>{children}</Header>
    </>
  );
}
