"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
class CustomWorld extends cucumber_1.World {
}
(0, cucumber_1.setWorldConstructor)(CustomWorld);
