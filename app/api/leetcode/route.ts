const LEETCODE_QUERY = `
  query leetcodeNotebook($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        realName
        ranking
      }
      submitStats {
        acSubmissionNum {
          difficulty
          count
        }
      }
      userCalendar {
        submissionCalendar
        totalActiveDays
        streak
      }
    }
    userContestRanking(username: $username) {
      rating
      globalRanking
    }
    userContestRankingHistory(username: $username) {
      attended
      rating
      ranking
      contest {
        title
        startTime
      }
    }
  }
`;

export async function GET(request: Request) {
  const username = new URL(request.url).searchParams.get("username")?.trim();

  if (!username || !/^[a-zA-Z0-9_-]{1,32}$/.test(username)) {
    return Response.json({ error: "A valid LeetCode username is required." }, { status: 400 });
  }

  try {
    const response = await fetch("https://leetcode.com/graphql/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: `https://leetcode.com/u/${username}/`,
        "User-Agent": "Mozilla/5.0",
      },
      body: JSON.stringify({
        query: LEETCODE_QUERY,
        variables: { username },
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      return Response.json({ error: "LeetCode stats are temporarily unavailable." }, { status: 502 });
    }

    const result = await response.json();
    const user = result.data?.matchedUser;

    if (!user) {
      return Response.json({ error: "That LeetCode profile could not be found." }, { status: 404 });
    }

    let calendar: Record<string, number> = {};
    try {
      calendar = JSON.parse(user.userCalendar?.submissionCalendar ?? "{}");
    } catch {
      calendar = {};
    }

    const acceptedCounts = user.submitStats?.acSubmissionNum ?? [];
    const countFor = (difficulty: string) =>
      acceptedCounts.find((entry: { difficulty: string; count: number }) => entry.difficulty === difficulty)?.count ?? 0;

    const contestHistory = (result.data?.userContestRankingHistory ?? [])
      .filter((entry: { attended: boolean; rating: number; contest: { title: string; startTime: number } }) =>
        entry.attended && Number.isFinite(entry.rating) && entry.contest
      )
      .map((entry: { attended: boolean; rating: number; ranking: number; contest: { title: string; startTime: number } }) => ({
        rating: entry.rating,
        ranking: entry.ranking,
        title: entry.contest.title,
        startTime: entry.contest.startTime,
      }));

    return Response.json(
      {
        username: user.username,
        realName: user.profile?.realName || user.username,
        ranking: user.profile?.ranking ?? null,
        solved: {
          all: countFor("All"),
          easy: countFor("Easy"),
          medium: countFor("Medium"),
          hard: countFor("Hard"),
        },
        calendar,
        activeDays: user.userCalendar?.totalActiveDays ?? 0,
        streak: user.userCalendar?.streak ?? 0,
        contestRating: result.data?.userContestRanking?.rating ?? null,
        contestRanking: result.data?.userContestRanking?.globalRanking ?? null,
        contestHistory,
      },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
    );
  } catch {
    return Response.json({ error: "Could not load LeetCode stats right now." }, { status: 502 });
  }
}
