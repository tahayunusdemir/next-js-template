import { currentUser } from '@clerk/nextjs/server';
import { setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import type {
  CineResultMovie,
  CineResultPerson,
} from '@/components/marketing/cinetest/cinetest-result';
import { CineTestResult } from '@/components/marketing/cinetest/cinetest-result';
import { recommendedGenres } from '@/data/cinetest-personas';
import { getCineTypeBySlug } from '@/data/cinetype';
import { getCineTestResult } from '@/libs/CineTest';
import { scoreAnswers } from '@/libs/CineTestScoring';
import { cinePersonByRole, cinePosterPicks } from '@/libs/CineTestSummary';
import { getMoviesByIds } from '@/libs/Films';
import { discoverByGenres, posterUrl } from '@/libs/Tmdb';
import type { CineAnswerMap, CineVector } from '@/types/CineTest';
import { getI18nPath } from '@/utils/Helpers';

type ResultPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

// Pulls the favorite director/actor (name + photo) out of the stored answers for display.
function personForRole(
  answers: CineAnswerMap,
  role: 'director' | 'actor',
): CineResultPerson | undefined {
  const pick = cinePersonByRole(answers, role);

  return pick ? { name: pick.name, profilePath: pick.profilePath } : undefined;
}

// Resolves a list of picked TMDB ids to poster + title cards, dropping any not in the
// catalogue and preserving pick order.
async function loadPickMovies(ids: number[]): Promise<CineResultMovie[]> {
  const movies = await getMoviesByIds({ ids });

  return movies.map((movie) => ({
    tmdbId: movie.tmdbId,
    title: movie.title,
    posterUrl: posterUrl(movie.posterPath, 'w342'),
  }));
}

async function loadRecommendations(props: {
  vector: CineVector;
  locale: string;
}): Promise<CineResultMovie[]> {
  try {
    const discovered = await discoverByGenres({
      genreIds: recommendedGenres({ vector: props.vector }),
      locale: props.locale,
    });

    return discovered.results.slice(0, 6).map((movie) => ({
      tmdbId: movie.id,
      title: movie.title,
      posterUrl: posterUrl(movie.poster_path, 'w342'),
    }));
  } catch {
    // TMDB unavailable → render the result without recommendations.
    return [];
  }
}

export default async function DashboardCineTestResultPage(props: ResultPageProps) {
  const { locale, id } = await props.params;
  setRequestLocale(locale);

  const user = await currentUser();

  if (!user) {
    redirect(getI18nPath('/sign-in', locale));
  }

  const row = await getCineTestResult(id);
  const type = row ? getCineTypeBySlug(row.cineType) : undefined;

  // Only the owner can view a saved result; legacy anonymous rows stay viewable.
  if (!row || !type || (row.userId && row.userId !== user.id)) {
    notFound();
  }

  const result = scoreAnswers(row.answers);
  const director = personForRole(row.answers, 'director');
  const actor = personForRole(row.answers, 'actor');
  const [recommendations, favorites, picks] = await Promise.all([
    loadRecommendations({ vector: result.vector, locale }),
    loadPickMovies(result.filmPicks.favorites),
    loadPickMovies(cinePosterPicks(row.answers)),
  ]);

  return (
    <CineTestResult
      type={type}
      result={result}
      director={director}
      actor={actor}
      favorites={favorites}
      picks={picks}
      recommendations={recommendations}
      signedIn
    />
  );
}
