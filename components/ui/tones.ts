// The background and text colour of each tone. Each key is also a badge variant.
export const toneClasses = {
  secondary: 'bg-chip text-muted-foreground',
  tint: 'bg-tint text-primary',
  accent: 'bg-accent-bg text-accent',
  success: 'bg-success-bg text-success',
  destructive: 'bg-destructive-bg text-destructive'
} as const;

export type Tone = keyof typeof toneClasses;
