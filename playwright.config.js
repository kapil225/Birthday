import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
const localBrave='/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
const browser=process.env.BIRTHDAY_BROWSER || (existsSync(localBrave)?localBrave:undefined);
export default defineConfig({testDir:'./tests',timeout:90000,fullyParallel:false,workers:1,use:{baseURL:'http://127.0.0.1:4173',reducedMotion:'reduce',launchOptions:{...(browser?{executablePath:browser}:{})}},webServer:{command:'npm run dev -- --port 4173',url:'http://127.0.0.1:4173',reuseExistingServer:true},reporter:'list'});
