export function ProfileEmpty(props: { message: string }) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
      {props.message}
    </div>
  );
}
