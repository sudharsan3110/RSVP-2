import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import pagefind from "astro-pagefind";

export default defineConfig({
  build: {
    format: "directory",
  },
  markdown: {
    shikiConfig: {
      theme: "dracula",
    },
  },
  integrations: [mdx(), tailwind(), pagefind()],
});
