import { FixturesData } from '@/lib/definitions';
import { cn } from '@/lib/utils';

export type FormResult = 'W' | 'D' | 'L';

const FORM_LABELS: Record<FormResult, string> = {
  W: 'won',
  D: 'drew',
  L: 'lost'
};

const FORM_CLASSES: Record<FormResult, string> = {
  W: 'bg-success-bg text-success',
  D: 'bg-chip text-muted-foreground',
  L: 'bg-destructive-bg text-destructive'
};

// Oldest result first.
const FormChips = ({
  form,
  className
}: {
  form: FormResult[];
  className?: string;
}) =>
  form.length === 0 ? null : (
    <span className={cn('flex gap-1', className)}>
      <span className="sr-only">
        Form: {form.map((result) => FORM_LABELS[result]).join(', ')}
      </span>
      {form.map((result, idx) => (
        <span
          key={idx}
          aria-hidden="true"
          className={cn(
            'flex size-5 items-center justify-center rounded-md text-[0.625rem] font-extrabold',
            FORM_CLASSES[result]
          )}
        >
          {result}
        </span>
      ))}
    </span>
  );

const TeamForm = ({
  teamId,
  fixtures,
  selectedGw
}: {
  fixtures: FixturesData[] | 'The game is being updated';
  teamId: number;
  selectedGw: number;
}) => {
  const form = Array.isArray(fixtures)
    ? fixtures
        .filter(
          (fixture) =>
            fixture.event < selectedGw &&
            (fixture.finished || fixture.finished_provisional) &&
            (fixture.team_a === teamId || fixture.team_h === teamId)
        )
        .map((fixture): FormResult => {
          const [scored, conceded] =
            fixture.team_h === teamId
              ? [fixture.team_h_score, fixture.team_a_score]
              : [fixture.team_a_score, fixture.team_h_score];
          return scored > conceded ? 'W' : scored === conceded ? 'D' : 'L';
        })
        .slice(-5)
    : [];

  return <FormChips form={form} />;
};

export { FormChips, TeamForm };
