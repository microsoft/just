/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

// List of projects/orgs using your project for the users page.
const users = [
  // {
  //   caption: 'User1',
  //   // You will need to prepend the image path with your baseUrl
  //   // if it is not '/', like: '/test-site/img/docusaurus.svg'.
  //   image: '/img/docusaurus.svg',
  //   infoLink: 'https://www.facebook.com',
  //   pinned: true
  // }
];

const siteConfig = {
  title: 'Build Rig', // Title for your website.
  tagline: 'Documentation on Build Rig',
  url: 'https://kenotron.github.io', // Your website URL
  baseUrl: '/build-rig/', // Base URL for your project */
  projectName: 'build-rig',
  organizationName: 'kenotron',

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [{ doc: 'doc-start', label: 'Documentation' }, { page: 'help', label: 'Help' }],

  // If you have users set above, you add it here:
  users,

  /* path to images for header/footer */
  headerIcon: null,
  footerIcon: null,
  favicon: 'img/favicon.png',

  /* Colors for website */
  colors: {
    primaryColor: '#2E8555',
    secondaryColor: '#205C3B'
  },

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()}`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: 'default'
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: ['https://buttons.github.io/buttons.js'],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: true,

  // Open Graph and Twitter card images.
  ogImage: null,
  twitterImage: null,

  // Show documentation's last contributor's name.
  // enableUpdateBy: true,

  // Show documentation's last update time.
  // enableUpdateTime: true,

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  editUrl: 'https://github.com/kenotron/build-rig/tree/master/packages/documentation/docs/'
};

module.exports = siteConfig;
