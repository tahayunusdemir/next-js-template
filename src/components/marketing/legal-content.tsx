import { Section } from '@/components/marketing/section';

// Presentational shell for legal pages (privacy, terms): a title, a "last updated" line,
// a lead paragraph, and a stack of headed sections. Content is passed in as plain strings
// so each page resolves its own translation namespace on the server.
export function LegalContent(props: {
  title: string;
  updated: string;
  intro: string;
  sections: { heading: string; body: string }[];
}) {
  return (
    <Section containerClassName="max-w-3xl">
      <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        {props.title}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">{props.updated}</p>
      <p className="mt-6 text-base text-pretty text-muted-foreground sm:text-lg">{props.intro}</p>

      <div className="mt-12 flex flex-col gap-10">
        {props.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-heading text-xl font-semibold tracking-tight">{section.heading}</h2>
            <p className="mt-3 text-pretty text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>
    </Section>
  );
}
