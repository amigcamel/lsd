// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { remote } = require('electron');
const funcs = require('./funcs');


window.funcs = funcs
