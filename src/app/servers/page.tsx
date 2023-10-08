import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { RedirectType, redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default async function Servers() {
  const session = await getServerSession();
  if (!session) {
    return redirect('/', RedirectType.replace);
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

  if (guilds.length === 1) {
    return redirect(`/servers/${guilds[0].id}`, RedirectType.replace);
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="card card-bordered bg-neutral-700/20">
        <ul className="card-body">
          {guilds.length === 0 && (
            <p>None of the servers you are part of has the bot. :(</p>
          )}
          {guilds.map((guild) => (
            <li key={guild.id}>
              <Link href={`/servers/${guild.id}`} className="btn btn-neutral">
                <Image
                  className="rounded-full"
                  src={guild.iconUrl ?? ''}
                  alt="profile picture"
                  width={30}
                  height={30}
                />
                {guild.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
