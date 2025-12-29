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
      { text: 'Examples', link: '/markdown-examples' },
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' },
          {
            text: 'API',
            items: [
              { text: 'Modules', link: '/api/modules' },
              { text: 'Classes', link: '/api/classes/TSpark.md' },
              { text: 'Interfaces', link: '/api/interfaces/TSparkSetup.md' },
            ],
          },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/vuejs/vitepress' }],
  },
});
