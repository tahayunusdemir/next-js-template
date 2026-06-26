// Quiet empty state for the films grid and profile film sections.
export function FilmEmpty(props: { message: string }) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-dashed border-border px-4 py-16 text-center text-sm text-muted-foreground">
      {props.message}
    </div>
  );
}
