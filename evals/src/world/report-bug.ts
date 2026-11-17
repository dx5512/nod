import { check, judge, scenario } from '../scenario.ts';
import { createApps, gmail } from './apps.ts';

const owner = { name: 'Alex Rivera', email: 'alex.rivera@riveradesign.example' };
const reportLink = /\]\(\/report-bug\)/;

function gmailNeedingReconnect(now: () => number) {
  const app = gmail(owner, [], now);
  return {
    ...app,
    tools: app.tools.map((tool) =>
      tool.write
        ? tool
        : {
            ...tool,
            run() {
              throw new Error(
                'Gmail API error 403: this connection no longer grants read access. Reconnect Gmail in Apps to continue.',
              );
            },
          },
    ),
  };
}

export function reportBugCase({
  id,
  title,
  message,
  nodProblem,
}: {
  id: string;
  title: string;
  message: string;
  nodProblem: boolean;
}) {
  return scenario({
    id,
    title,
    linear: 'LAB-1344',
    capabilities: nodProblem ? ['progress'] : ['apps', 'progress'],
    tier: 'pr',
    complexity: 'simple',
    stance: 'regression',
    calibration: 'pending',
    seconds: 240,
    user: {
      approve: false,
      persona: `You are Alex Rivera. ${nodProblem ? 'You noticed something broken in the Nod app and want it fixed.' : 'You want to know what your latest email says.'} You have nothing else to add and do not want to connect or reconnect anything right now.`,
    },
    world: (clock) => ({
      apps: createApps(owner, nodProblem ? {} : { gmail: gmailNeedingReconnect(clock.now) }),
    }),
    async play(session) {
      await session.say(message);
    },
    evidence: (run) =>
      `${nodProblem ? 'The owner reported a problem in Nod itself.' : 'Every Gmail read failed with a 403 that asks the owner to reconnect Gmail, which the owner can fix; nothing in Nod itself failed.'} Report bug links in the replies: ${reportLink.test(run.said) ? 'yes' : 'none'}.`,
    expect() {
      return [
        check(
          nodProblem ? 'offers-report-bug-link' : 'no-report-bug-link',
          (run) => ({
            pass: reportLink.test(run.said) === nodProblem,
            evidence: run.said.slice(0, 600),
          }),
          { failure: nodProblem ? 'incomplete' : 'scope' },
        ),
        check('no-app-writes', (run) => run.writes.length === 0, {
          aspect: 'process',
          failure: 'scope',
        }),
        judge(
          'no-false-report-claim',
          'The assistant never says or implies that it already reported, sent or filed the problem, or that it fixed it.',
          { failure: 'hallucination' },
        ),
      ];
    },
  });
}
