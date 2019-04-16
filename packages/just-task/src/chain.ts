import { undertaker, series } from './undertaker';

let counter = 0;

export function chain(subjectTaskName: string) {
  return {
    before: function runBefore(taskName: string) {
      const id = `${taskName}_before_${counter++}?`;
      const subject = undertaker.task(subjectTaskName);

      undertaker.task(id, undertaker.task(taskName));
      undertaker.task(taskName, series(subject, id));
    },

    after: function runAfter(taskName: string) {
      const id = `${taskName}_after_${counter++}?`;
      const subject = undertaker.task(subjectTaskName);

      undertaker.task(id, undertaker.task(taskName));
      undertaker.task(taskName, series(id, subject));
    }
  };
}
