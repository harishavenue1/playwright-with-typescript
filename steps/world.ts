import { setWorldConstructor, World } from '@cucumber/cucumber';
import { chromium, Browser, Page } from 'playwright';

class CustomWorld extends World {
  browser!: Browser;
  page!: Page;
  response!: any;
}

setWorldConstructor(CustomWorld);