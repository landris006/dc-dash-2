import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getServerSession();
  if (!session) {
    return redirect('/');
  }

  const guilds = await db.guild.findMany({
    where: {
      guildMembers: {
        some: {
          user: {
            username: session.user.name,
          },
        },
      },
    },
  });

  return (
    <main>
      <h1>Servers</h1>
      <ul>
        {guilds.map((guild) => (
          <li key={guild.id}>{guild.name}</li>
        ))}
      </ul>
    </main>
  );
}
