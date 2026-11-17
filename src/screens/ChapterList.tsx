import { Button, Group, Stack, Text, Title } from '@mantine/core';
import type { ChildProfile } from '../profile/types';
import type { MathsEngine } from '../maths/engine';

interface Props {
  child: ChildProfile;
  engine: MathsEngine;
  onBack: () => void;
}

// Shows the chapters for the child's age band. Opening a chapter is not built yet (needs the shared maths source).
export function ChapterList({ child, engine, onBack }: Props) {
  const chapters = engine.chaptersFor(child.ageBand);
  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>{child.avatar} {child.nickname}: maths chapters</Title>
        <Button variant="default" onClick={onBack}>Back</Button>
      </Group>
      <Text size="sm" c="dimmed">Ages {child.ageBand}. Draft screen with placeholder chapters, not for children yet.</Text>
      {chapters.map((c, i) => (
        <Button key={c.id} variant="light" size="lg" justify="flex-start" disabled aria-label={`Chapter ${i + 1}: ${c.title} (not open yet)`}>
          {i + 1}. {c.title}
        </Button>
      ))}
    </Stack>
  );
}
