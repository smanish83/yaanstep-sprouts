import { useState } from 'react';
import { Button, Container, Group, Paper, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { useEffect } from 'react';
import { firebaseAuth } from './firebase';
import { AGE_BANDS, AVATARS, isValidNickname, type AgeBand, type Avatar, type ChildProfile } from './profile/types';
import { deviceStorage } from './storage/storage';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<ChildProfile[]>(() => deviceStorage.load());
  const [nickname, setNickname] = useState('');
  const [ageBand, setAgeBand] = useState<AgeBand>('5-6');
  const [avatar, setAvatar] = useState<Avatar>(AVATARS[0]);

  useEffect(() => onAuthStateChanged(firebaseAuth, setUser), []);

  const addProfile = () => {
    if (!isValidNickname(nickname)) return;
    const next = [...profiles, { id: crypto.randomUUID(), nickname: nickname.trim(), ageBand, avatar }];
    setProfiles(next);
    deviceStorage.save(next);
    setNickname('');
  };

  return (
    <Container size="sm" py="xl">
      <Stack>
        <Title order={1}>Yaanstep Sprouts</Title>
        <Text size="sm" c="dimmed">Working name. Early draft, not for children yet.</Text>

        {!user ? (
          <Paper withBorder p="md">
            <Text mb="sm">A parent signs in. Children never sign in.</Text>
            <Button onClick={() => signInWithPopup(firebaseAuth, new GoogleAuthProvider())}>
              Parent: sign in with Google
            </Button>
          </Paper>
        ) : (
          <>
            <Group justify="space-between">
              <Text>Signed in as a parent.</Text>
              <Button variant="default" onClick={() => signOut(firebaseAuth)}>Sign out</Button>
            </Group>

            <Paper withBorder p="md">
              <Title order={3} mb="sm">Add a child</Title>
              <Text size="xs" c="dimmed" mb="sm">
                Use a nickname only, not a real name. Saved on this device only.
              </Text>
              <Stack>
                <TextInput label="Nickname" value={nickname} onChange={(e) => setNickname(e.currentTarget.value)} maxLength={20} />
                <Select label="Age band" data={[...AGE_BANDS]} value={ageBand} onChange={(v) => v && setAgeBand(v as AgeBand)} allowDeselect={false} />
                <Group gap="xs" role="radiogroup" aria-label="Picture avatar">
                  {AVATARS.map((a) => (
                    <Button key={a} variant={a === avatar ? 'filled' : 'default'} onClick={() => setAvatar(a)} aria-label={`Avatar ${a}`} aria-checked={a === avatar} role="radio">
                      {a}
                    </Button>
                  ))}
                </Group>
                <Button onClick={addProfile} disabled={!isValidNickname(nickname)}>Add child</Button>
              </Stack>
            </Paper>

            {profiles.map((p) => (
              <Paper key={p.id} withBorder p="md">
                <Text>{p.avatar} {p.nickname} (ages {p.ageBand})</Text>
              </Paper>
            ))}
          </>
        )}
      </Stack>
    </Container>
  );
}
