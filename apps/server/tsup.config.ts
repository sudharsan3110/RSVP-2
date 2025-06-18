import { defineConfig, type Options } from 'tsup';

export default defineConfig((options: Options) => ({
  entryPoints: ['src/app.ts', 'src/scripts/eventNotificationScript.ts'],
  clean: true,
  format: ['cjs'],
  ...options,
}));
