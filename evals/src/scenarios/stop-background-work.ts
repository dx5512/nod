import { check, scenario } from '../scenario.ts';
import { createApps } from '../world/apps.ts';

const owner = { name: 'Alex Rivera', email: 'alex.rivera@riveradesign.example' };

export default scenario({
  id: 'stop-background-work',
  title: 'Stop all background work',
  linear: 'LAB-1156',
  capabilities: ['schedules'],
  tier: 'release',
  calibration: 'pending',
  complexity: 'simple',
  stance: 'regression',
  seconds: 300,
  user: {
    approve: true,
    persona:
      'You are Alex Rivera. Nod keeps spending credits in the background and you want all of it to stop until you turn it back on yourself.',
  },
  world() {
    return { apps: createApps(owner, {}), state: { paused: undefined as boolean | undefined } };
  },
  async play(session, world) {
    await session.say('Stop all background work, it keeps using credits.');
    world.state.paused = (await session.api('GET', '/api/preferences')).body.proactivePaused;
  },
  expect(world) {
    return [
      check('automatic-preparation-paused', () => ({
        pass: world.state.paused === true,
        evidence: `proactivePaused at the end: ${String(world.state.paused)}`,
      })),
    ];
  },
});
