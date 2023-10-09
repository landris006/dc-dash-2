import { db } from '@/lib/db';
import { guildMembersWithTotalTime } from '@/lib/queries';
import { cn, levelToColor, levelToTime, timeToLevel } from '@/lib/utils';
import {
  EnvelopeOpenIcon,
  Pencil2Icon,
  PersonIcon,
} from '@radix-ui/react-icons';
import { ClockIcon, CrownIcon, HourglassIcon, PhoneIcon } from 'lucide-react';
import Image from 'next/image';
import { redirect } from 'next/navigation';

export default async function Server({
  params,
}: {
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

  const membersWithTime = await guildMembersWithTotalTime({
    guild,
  });

  const top3 = await Promise.all(
    membersWithTime.slice(0, 3).map(async (m) => ({
      ...m,
      user: await db.user.findUnique({
        where: {
          id: m.userId,
        },
      }),
    })),
  );

  const activities = await db.activity.findMany({
    where: {
      user: {
        guildMembers: {
          some: {
            guildId: params.guildId,
          },
        },
      },
    },
  });

  const timeByActivity = [
    ...activities
      .reduce((acc, activity) => {
        if (activity.name === 'Custom Status') {
          return acc;
        }

        const time = acc.get(activity.name) ?? 0;
        const duration =
          (activity.endTime?.getTime() ?? new Date().getTime()) -
          activity.startTime.getTime();
        acc.set(activity.name, time + duration);
        return acc;
      }, new Map<string, number>())
      .entries(),
  ]
    .sort((a, b) => b[1] - a[1])
    .map(([name, time]) => ({ name, time }));

  const top3Activities = timeByActivity.slice(0, 3);

  return (
    <main className="grid w-full grid-cols-1 gap-3 p-3 lg:grid-cols-[auto_1fr] lg:items-start">
      <div className="flex flex-wrap gap-3 lg:flex-col">
        <div className="stats w-full shadow">
          <div className="stat">
            <div className="stat-title pb-1 text-xl text-yellow-500">
              <CrownIcon className="mr-1 inline-block" />
              Leaderboard (top 3)
            </div>
            <ul className="stat-value flex flex-col gap-1">
              {top3.map((member, i) => {
                const level = timeToLevel(member.totalTime);
                const nextLevelTime = levelToTime(level + 1);
                const progress = Math.round(
                  ((member.totalTime - levelToTime(level)) / nextLevelTime) *
                    100,
                );

                return (
                  <li
                    key={member.id}
                    className={cn('btn h-fit gap-1 py-1 normal-case', {
                      'text-4xl text-yellow-500/90': member.id === top3[0]?.id,
                      'text-3xl': member.id === top3[1]?.id,
                      'text-2xl': member.id === top3[2]?.id,
                    })}
                  >
                    <span className="inline-block min-w-[2rem]">{i + 1}.</span>{' '}
                    <Image
                      src={member.user?.avatarUrl ?? ''}
                      width={40}
                      height={40}
                      className="rounded-full"
                      alt="profile picture"
                    />
                    <span>{member.nickname}</span>
                    <div
                      className="radial-progress ml-auto text-[1rem]"
                      style={{
                        color: levelToColor(level),
                        // @ts-ignore
                        '--value': progress,
                        '--size': '3rem',
                      }}
                    >
                      {level}
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="stat-desc">Highest level members</div>
          </div>
        </div>
        <div className="stats w-full shadow">
          <div className="stat">
            <div className="stat-title pb-1 text-xl text-orange-500">
              <CrownIcon className="mr-1 inline-block" />
              Most common activities (top 3)
            </div>
            <ul className="stat-value flex flex-col gap-1">
              {top3Activities.map((activity, i) => {
                return (
                  <li
                    key={activity.name}
                    className={cn(
                      'btn h-fit justify-start gap-1 py-1 normal-case',
                      {
                        'text-4xl text-orange-500/90':
                          activity.name === top3Activities[0]?.name,
                        'text-3xl': activity.name === top3Activities[1]?.name,
                        'text-2xl': activity.name === top3Activities[2]?.name,
                      },
                    )}
                  >
                    <span className="inline-block min-w-[2rem]">{i + 1}.</span>{' '}
                    <span className="mr-1">{activity.name}</span>
                    <span className="ml-auto min-w-[90px] text-[1rem]">
                      <ClockIcon className="mr-1 inline h-6 w-6" />
                      {Math.round(activity.time / (1000 * 60 * 60))} hrs
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="stat-desc">Activities by highest time spent</div>
          </div>
        </div>
      </div>

      <div className="stats grid-flow-row grid-cols-[repeat(auto-fit,minmax(18rem,1fr))] overflow-hidden">
        <Stat
          title="Members"
          desc="Number of members"
          icon={<PersonIcon className="mr-1 inline-block h-5 w-5" />}
          value={membersWithTime.length}
          className="text-emerald-600"
        />
        <Stat
          title="Messages"
          desc="Number of messages sent"
          icon={<EnvelopeOpenIcon className="mr-1 inline-block h-5 w-5" />}
          value={membersWithTime.length}
          className="text-sky-600"
        />
        <Stat
          title="Total time spent"
          desc="Total time spent connected across all members"
          icon={<HourglassIcon className="mr-1 inline-block h-5 w-5" />}
          value={
            Math.round(
              membersWithTime.reduce(
                (acc, m) => acc + m.totalTime / (1000 * 60 * 60),
                0,
              ),
            ) + ' hrs'
          }
          className="text-yellow-600"
        />

        <Stat
          title="Connections"
          className="text-red-400/80"
          desc="Number of voice connections"
          icon={<PhoneIcon className="mr-1 inline-block h-5 w-5" />}
          value={await db.connection.count({
            where: {
              guildMember: {
                guildId: guild.id,
              },
            },
          })}
        />

        <Stat
          title="Created at"
          className="text-lime-400/80"
          desc="Server creation date"
          icon={<Pencil2Icon className="mr-1 inline-block h-5 w-5" />}
          value={guild.createdAt.toLocaleDateString()}
        />
      </div>
    </main>
  );
}

async function Stat({
  value,
  title,
  desc,
  icon,
  className: titleClass,
}: {
  value: string | number;
  title: string;
  desc: string;
  icon: React.ReactNode;
  className?: React.HtmlHTMLAttributes<HTMLParagraphElement>['className'];
}) {
  return (
    <div className="stat w-fit">
      <p className="stat-title text-xl">
        {icon}
        {title}
      </p>
      <p className={cn('stat-value', titleClass)}>{value}</p>
      <p className="stat-desc">{desc}</p>
    </div>
  );
}
