import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'TSpark — Modular TypeScript ECS Framework for Games',
  description:
    'TSpark’s TypeScript ECS lets you build responsive games and interactive simulations by composing behavior from small, reusable components. Define entities, attach components for data, and implement systems for input, physics, AI, and rendering, all decoupled and testable. Swap renderer backends (Canvas/WebGL), create multiple worlds and scenes, and scale complexity without tangled inheritance. The structured game loop provides deterministic fixed updates and smooth draw updates, while dynamic imports keep optional features lightweight. Use it to prototype quickly, iterate safely, and ship maintainable gameplay mechanics with clear APIs and straightforward extension points.',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/getting-started' },
      { text: 'Examples', link: '/examples/simple-scene' },
      { text: 'API', link: '/api/' },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/getting-started' },
          { text: 'Core Concepts', link: '/core-concepts' },
        ],
      },
      {
        text: 'Guide',
        items: [
          { text: 'World & Scenes', link: '/guide/world-and-scenes' },
          { text: 'Entities & Components', link: '/guide/entities-and-components' },
          { text: 'Systems', link: '/guide/systems' },
          { text: 'Rendering', link: '/guide/rendering' },
        ],
      },
      {
        text: 'Examples',
        items: [
          { text: 'Simple 3D Scene', link: '/examples/simple-scene' },
          { text: 'Camera Controls', link: '/examples/camera-controls' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'API Documentation', link: '/api/' },
          {
            text: 'Core Classes',
            items: [{ text: 'TSpark', link: '/api/classes/TSpark' }],
          },
          {
            text: 'Interfaces',
            items: [{ text: 'TSparkSetup', link: '/api/interfaces/TSparkSetup' }],
          },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/niklasderechte/tspark' }],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: `Copyright © ${new Date().getFullYear()} TSpark Contributors`,
    },
  },
});
