type ProfileSectionProps = {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

export function ProfileSection(props: ProfileSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-tight">{props.title}</h2>
        {props.action}
      </div>
      {props.children}
    </section>
  );
}
