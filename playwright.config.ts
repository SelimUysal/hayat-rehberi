import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir:'tests/cloud-e2e',
  fullyParallel:false,workers:1,timeout:90_000,
  expect:{timeout:15_000},
  outputDir:'test-results/cloud',
  reporter:[['list'],['html',{outputFolder:'playwright-report',open:'never'}]],
  use:{baseURL:'http://127.0.0.1:4175',trace:'retain-on-failure',screenshot:'only-on-failure',
    ...(process.env.PLAYWRIGHT_CHROME === '1' ? {channel:'chrome'} : {})},
  projects:[{name:'desktop',use:{...devices['Desktop Chrome']}},{name:'mobile',use:{...devices['Pixel 7']}}],
  webServer:{command:'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4175 --strictPort',url:'http://127.0.0.1:4175',
    reuseExistingServer:!process.env.CI,timeout:120_000,env:{VITE_FIREBASE_EMULATORS:'true'}},
});
