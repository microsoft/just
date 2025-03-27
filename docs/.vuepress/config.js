module.exports = {
  title: 'just ___',
  description: 'The task library that just works',
  base: '/just/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/tasks/composition' },
      { text: 'GitHub', link: 'https://github.com/microsoft/just' },
    ],
    sidebar: [
      {
        title: 'Home', // required
        path: '/', // optional, link of the title, which should be an absolute path and must exist
      },
      {
        title: 'Tasks',
        path: '/tasks',
        collapsable: false,
        sidebarDepth: 1,
        children: ['/tasks/composition', '/tasks/logging', '/tasks/args', '/tasks/condition', '/tasks/thunk'],
      },
      {
        title: 'Scripts',
        path: '/scripts',
        collapsable: false,
        sidebarDepth: 1,
        children: ['/scripts/typescript', '/scripts/webpack', '/scripts/lint', '/scripts/jest'],
      },
    ],
  },
};
