import { defaultTheme } from '@vuepress/theme-default';
import { defineUserConfig } from 'vuepress';
import { viteBundler } from '@vuepress/bundler-vite';

export default defineUserConfig({
  lang: 'en-US',
  title: 'just ___',
  description: 'The task library that just works',
  base: '/',

  bundler: viteBundler(),

  theme: defaultTheme({
    // Enable built-in dark mode toggle
    colorModeSwitch: true,

    navbar: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/tasks/composition' },
      { text: 'GitHub', link: 'https://github.com/microsoft/just' },
    ],

    sidebar: [
      {
        text: 'Home',
        link: '/',
      },
      {
        text: 'Tasks',
        link: '/tasks/',
        collapsible: false,
        children: ['/tasks/composition', '/tasks/logging', '/tasks/args', '/tasks/condition', '/tasks/thunk'],
      },
      {
        text: 'Scripts',
        link: '/scripts/',
        collapsible: false,
        children: ['/scripts/typescript', '/scripts/webpack', '/scripts/lint', '/scripts/jest'],
      },
    ],
  }),
});
