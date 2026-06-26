// Quiet empty state for the community feeds and comment threads.
export function CommunityEmpty(props: { message: string }) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-dashed border-border px-4 py-16 text-center text-sm text-muted-foreground">
      {props.message}
    </div>
  );
}
