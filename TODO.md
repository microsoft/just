```
$ npm run upgrade
# updates deps [just-task, just-task-preset, upgrades according to latest stack]
# - upgrades stack package.json deps & devDeps
# - apply codemod

$ npm start
# starts a "main" package (first one in rush.json?)

$ npm start package
# runs start for a sub package
```

Next Action:

- move / copy / refactor downloadPackage to just-scripts
- add monorepo tasks there
