import { db } from './db';

export async function guildMembersWithTotalTime({
  skip,
  take,
  guild,
}: {
  skip?: number;
  take?: number;
  guild?: {
    id: string;
  };
}) {
  const members = await db.$queryRaw<
    {
      guild_member_id: string;
      total_time: number;
      id: string;
      guild_id: string;
      user_id: string;
      joined_at: Date;
      nickname: string;
    }[]
  >`
  SELECT "guild_member"."id" AS "guild_member_id",
    COALESCE(
      (
        SELECT SUM(EXTRACT(EPOCH FROM "end_time") - EXTRACT(EPOCH FROM "start_time")) * 1000
        FROM "connection"
        WHERE "guild_member_id" = "guild_member"."id"
      ), 0
    )
  AS "total_time", *

  FROM "guild_member"

  WHERE "guild_id" = ${guild?.id ?? 'NOT NULL'}  
  
  ORDER BY "total_time" DESC

  OFFSET ${skip ?? 0}
  LIMIT ${take ?? Infinity}
  `;

  return members.map((member) => ({
    id: member.id,
    nickname: member.nickname,
    guildId: member.guild_id,
    totalTime: member.total_time!,
    guildMemberId: member.guild_member_id,
    userId: member.user_id,
    joinedAt: member.joined_at,
  }));
}
