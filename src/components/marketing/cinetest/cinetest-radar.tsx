'use client';

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import { ChartContainer } from '@/components/ui/chart';

// A spider/radar plot of the eight trait axes. Each axis value is pre-mapped to 0–100
// (50 = balanced) on the server, so this stays a thin, presentational client island.
export function CineTestRadar(props: { label: string; data: { label: string; value: number }[] }) {
  const config = { value: { label: props.label, color: 'var(--primary)' } } satisfies ChartConfig;

  return (
    <ChartContainer
      config={config}
      className="mx-auto aspect-square w-full max-w-sm text-muted-foreground"
    >
      <RadarChart data={props.data} outerRadius="72%">
        <PolarGrid />
        <PolarAngleAxis dataKey="label" tick={{ fill: 'currentColor', fontSize: 11 }} />
        <Radar
          dataKey="value"
          fill="var(--color-value)"
          fillOpacity={0.3}
          stroke="var(--color-value)"
          strokeWidth={2}
        />
      </RadarChart>
    </ChartContainer>
  );
}
