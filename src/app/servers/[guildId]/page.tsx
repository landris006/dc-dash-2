import { db } from '@/lib/db';
import { guildMembersWithTotalTime } from '@/lib/queries';
import { cn, levelToColor, levelToTime, timeToLevel } from '@/lib/utils';
import {
  EnvelopeOpenIcon,
  FaceIcon,
  MixIcon,
  Pencil2Icon,
  PersonIcon,
} from '@radix-ui/react-icons';
import { ClockIcon, CrownIcon, HourglassIcon, PhoneIcon } from 'lucide-react';
import Image from 'next/image';

export default async function Server({
  params,
}: {
  params: { guildId: string };
}) {
  const guildId = params.guildId;
  const guild = await db.guild.findUnique({
    where: {
      id: guildId,
    },
  });

  const membersWithTime = await guildMembersWithTotalTime({
    guildId,
  });

  const highestLevelMembers = await Promise.all(
    membersWithTime.slice(0, 5).map(async (m) => ({
      ...m,
      user: await db.user.findUnique({
        where: {
          id: m.userId,
        },
      }),
    })),
  );

  const newestMember = [...membersWithTime].sort(
    (a, b) => b.joinedAt.getTime() - a.joinedAt.getTime(),
  )[0];

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

  const topVoiceChannels = await db.voiceChannel.findMany({
    where: {
      guildId: params.guildId,
    },
    include: {
      _count: {
        select: {
          connections: true,
        },
      },
    },
    orderBy: {
      connections: {
        _count: 'desc',
      },
    },
    take: 5,
  });

  const topActivities = timeByActivity.slice(0, 5);
  const totalTimeSpentOnActivities = timeByActivity.reduce((sum, activity) => {
    return sum + activity.time;
  }, 0);

  return (
    <main className="flex w-full flex-col gap-3 p-3">
      <div className="stats flex-1 grid-flow-row grid-cols-[repeat(auto-fit,minmax(18rem,1fr))] overflow-hidden">
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
                guildId: guildId,
              },
            },
          })}
        />
        <Stat
          title="Created at"
          className="text-lime-400/80"
          desc="Server creation date"
          icon={<Pencil2Icon className="mr-1 inline-block h-5 w-5" />}
          value={guild!.createdAt.toLocaleDateString()}
        />
        <Stat
          title="Time spent on activities"
          className="text-teal-400/80"
          desc="Total time spent on activities"
          icon={<MixIcon className="mr-1 inline-block h-5 w-5" />}
          value={
            Math.round(totalTimeSpentOnActivities / (1000 * 60 * 60)) + ' hrs'
          }
        />
        <Stat
          title="Newest member"
          className="text-cyan-400/80"
          desc={`Newest member to join (at ${newestMember.joinedAt.toLocaleDateString()})`}
          icon={<FaceIcon className="mr-1 inline-block h-5 w-5" />}
          value={newestMember.nickname}
        />
      </div>

      <div className="grid grid-flow-row grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-3 sm:grid-cols-[repeat(auto-fit,minmax(30rem,1fr))]">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title flex items-center pb-1 text-xl text-yellow-500">
              <CrownIcon className="mr-1 inline-block h-5 w-5" />
              Leaderboard
            </div>
            <ul className="stat-value flex flex-col gap-1 overflow-x-hidden">
              {highestLevelMembers.map((member, i) => {
                const level = timeToLevel(member.totalTime);
                const nextLevelTime = levelToTime(level + 1);
                const progress = Math.round(
                  ((member.totalTime - levelToTime(level)) / nextLevelTime) *
                    100,
                );

                return (
                  <li
                    key={member.id}
                    className={cn(
                      'btn h-fit flex-nowrap gap-1 py-1 normal-case',
                      {
                        'text-4xl text-yellow-500/90': i === 0,
                        'text-3xl': i === 1,
                        'text-2xl': i === 2,
                      },
                    )}
                  >
                    <span className="inline-block min-w-[2rem]">{i + 1}.</span>{' '}
                    <Image
                      src={member.user?.avatarUrl ?? ''}
                      width={40}
                      height={40}
                      className="rounded-full"
                      alt="profile picture"
                    />
                    <span className="overflow-hidden text-ellipsis">
                      {member.nickname}
                    </span>
                    <div
                      className="radial-progress ml-auto text-[1rem]"
                      style={{
                        color: levelToColor(level),
                        // @ts-ignore
                        '--value': progress,
                        '--size': '2.5rem',
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

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title flex items-center pb-1 text-xl text-teal-400/80">
              <MixIcon className="mr-1 inline-block h-5 w-5" />
              Most common activities
            </div>
            <ul className="stat-value flex flex-col gap-1 overflow-x-hidden">
              {topActivities.map((activity, i) => {
                return (
                  <li
                    key={activity.name}
                    className={cn(
                      'btn h-fit flex-nowrap gap-1 py-1 normal-case',
                      {
                        'text-4xl text-teal-400/80':
                          activity.name === topActivities[0]?.name,
                        'text-3xl': activity.name === topActivities[1]?.name,
                        'text-2xl': activity.name === topActivities[2]?.name,
                      },
                    )}
                  >
                    <span className="inline-block min-w-[2rem]">{i + 1}.</span>{' '}
                    <span className="overflow-hidden text-ellipsis">
                      {activity.name}
                    </span>
                    <span className="ml-auto min-w-[90px] text-[1rem] text-default">
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

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title flex items-center pb-1 text-xl text-red-400/80">
              <PhoneIcon className="mr-1 inline-block h-5 w-5" />
              Favourite voice channels
            </div>
            <ul className="stat-value flex flex-col gap-1 overflow-x-hidden">
              {topVoiceChannels.map((channel, i) => {
                return (
                  <li
                    key={channel.name}
                    className={cn(
                      'btn h-fit flex-nowrap gap-1 py-1 normal-case',
                      {
                        'text-4xl text-red-400/80':
                          channel.name === topVoiceChannels[0]?.name,
                        'text-3xl': channel.name === topVoiceChannels[1]?.name,
                        'text-2xl': channel.name === topVoiceChannels[2]?.name,
                      },
                    )}
                  >
                    <span className="inline-block min-w-[2rem]">{i + 1}.</span>{' '}
                    <span className="overflow-hidden text-ellipsis">
                      {channel.name}
                    </span>
                    <span className="ml-auto min-w-[90px] text-[1rem] text-default">
                      <PhoneIcon className="mr-1 inline h-5 w-5" />
                      {channel._count.connections}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="stat-desc">
              Voice channels with the most connections
            </div>
          </div>
        </div>
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
    <div className="stat">
      <p className="stat-title text-xl">
        {icon}
        {title}
      </p>
      <p className={cn('stat-value', titleClass)}>{value}</p>
      <p className="stat-desc">{desc}</p>
    </div>
  );
}
