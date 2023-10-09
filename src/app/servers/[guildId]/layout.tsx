import { db } from '@/lib/db';
import Header from './Header';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

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
    include: {
      guildMembers: {
        include: {
          user: true,
        },
      },
    },
  });

  const session = await getServerSession();

  if (!guild || !session) {
    return redirect('/servers');
  }

  const isMember = guild.guildMembers.some(
    (member) => member.userId === session.user.id,
  );
  if (!isMember) {
    return redirect('/servers');
  }

  return (
    <>
      <Header guild={guild}>{children}</Header>
    </>
  );
}
