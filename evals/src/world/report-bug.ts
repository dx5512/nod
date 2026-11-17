import { check, judge, scenario } from '../scenario.ts';
import { createApps } from './apps.ts';

const owner = { name: 'Alex Rivera', email: 'alex.rivera@riveradesign.example' };
const reportLink = /\]\(\/report-bug\)/;

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
    capabilities: ['progress'],
    tier: 'pr',
    complexity: 'simple',
    stance: 'regression',
    calibration: 'pending',
    seconds: 240,
    user: {
      approve: false,
      persona: `You are Alex Rivera. ${nodProblem ? 'You noticed something broken in the Nod app and want it fixed.' : 'You have a question about another service, not about Nod.'} You have nothing else to add and do not want to connect anything.`,
    },
    world: () => ({ apps: createApps(owner, {}) }),
    async play(session) {
      await session.say(message);
    },
    evidence: (run) =>
      `${nodProblem ? 'The owner reported a problem in Nod itself.' : 'The owner asked about a problem in another service, not in Nod.'} Report bug links in the replies: ${reportLink.test(run.said) ? 'yes' : 'none'}.`,
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
