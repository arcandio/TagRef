// requires
const {dialog} = require('electron').remote;
const shell = require('electron').shell;
const minimatch = require('minimatch');
const Glob = require('glob').Glob;
const fs = require('fs');
const timers = require('timers');
const dateformat = require('dateformat');

// component requires
const mode = require('./modeoptions.js');
const fl = require('./folderlisting.js');
const ui = require("./ui.js");
const display = require("./display.js");
const util = require("./utility.js");
const data = require("./data.js");

// globals
let appsettings = {};
let model = {};
model.fixed = {};
model.class = {};
model.free = {};
model.structured = {};
model.mode = '';
let state = {};
state.timers = [];
let bip = new Audio('assets/bip.wav');
let beep = new Audio('assets/beeem.wav');

// load app settings on reload
document.addEventListener("DOMContentLoaded", function(event) { 
	mode.setRowPrototype();
	ui.clearActive();
	data.loadSettings();
	data.loadSession();
});
