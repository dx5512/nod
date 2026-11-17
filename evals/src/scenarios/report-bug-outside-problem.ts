import { reportBugCase } from '../world/report-bug.ts';

export default reportBugCase({
  id: 'report-bug-outside-problem',
  title: 'No bug report offer for a problem outside Nod',
  message:
    'The Gmail app on my phone keeps saying my storage is almost full. What usually takes up the space?',
  nodProblem: false,
});
