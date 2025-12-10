# Lint

As the amount of code grows, developers need a way to keep the code looking consistent. `eslint` is the de facto linter for JS and TS code.

```tsx
// just.config.js
import { eslintTask } from 'just-scripts';
task('eslint', eslintTask());
```
