import { defineUserConfig } from 'vuepress';
import { viteBundler } from '@vuepress/bundler-vite';
import { defaultTheme, type SidebarItemOptions } from '@vuepress/theme-default';
import { searchPlugin } from '@vuepress/plugin-search';

export default defineUserConfig({
  bundler: viteBundler(),

  title: 'just ___',
  description: 'The task library that just works',
  base: '/just/',

  plugins: [searchPlugin()],

  theme: defaultTheme({
    repo: 'microsoft/just',
    editLink: false,
    contributors: false,
    navbar: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/tasks/' },
    ],
    sidebarDepth: 2,
    sidebar: [
      {
        text: 'Tasks',
        link: '/tasks/',
        collapsible: false,
        children: [
          { text: 'Getting started', link: '/tasks/' },
          '/tasks/composition',
          '/tasks/logging',
          '/tasks/args',
          { text: 'Conditionals', link: '/tasks/condition' },
          '/tasks/thunk',
        ],
      },
      {
        text: 'Scripts',
        link: '/scripts/',
        collapsible: false,
        children: [
          { text: 'Introduction', link: '/scripts/' },
          '/scripts/typescript',
          '/scripts/webpack',
          '/scripts/lint',
          '/scripts/jest',
        ],
      },
    ] satisfies SidebarItemOptions[],
  }),
});
