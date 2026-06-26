// Narrow TMDB API shapes — only the fields we render. See docs/cinepersona-docs/TMDB.md.

/** A movie as returned by list endpoints (`/discover`, `/search`, `/movie/popular`). */
export type TmdbMovieListItem = {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  original_language: string;
  adult: boolean;
};

/** A person as returned by `/search/person`. */
export type TmdbPersonListItem = {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  known_for: { id: number; title?: string; name?: string; media_type: string }[];
};

/** A paged list response. */
export type TmdbPagedResponse<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};

type TmdbGenre = {
  id: number;
  name: string;
};

type TmdbCastMember = {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
};

type TmdbCrewMember = {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
};

type TmdbCredits = {
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
};

type TmdbReleaseDate = {
  certification: string;
  release_date: string;
  type: number;
};

type TmdbReleaseDatesResult = {
  iso_3166_1: string;
  release_dates: TmdbReleaseDate[];
};

/** A movie detail response with `append_to_response=credits,release_dates`. */
export type TmdbMovieDetails = TmdbMovieListItem & {
  tagline: string | null;
  runtime: number | null;
  status: string;
  homepage: string | null;
  imdb_id: string | null;
  genres: TmdbGenre[];
  credits?: TmdbCredits;
  release_dates?: { results: TmdbReleaseDatesResult[] };
};
