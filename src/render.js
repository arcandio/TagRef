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
const classes = require("./classes.json");

// globals
const filefilter = [{name: 'json', extensions:['json']}];
let appsettings = {};
let model = {};
model.fixed = {};
model.class = {};
model.free = {};
model.structured = {};
model.mode = '';
let state = {};
state.files = [];
state.timers = [];
let bip = new Audio('assets/bip.wav');
let beep = new Audio('assets/beeem.wav');

class ev {
	constructor (time, count, istimed, image, fliph, flipv, grayscale, isbreak, breakmessage) {
		this.time = parseFloat(time);
		this.count = parseInt(count);
		this.istimed = istimed;
		this.image = image;
		this.fliph = fliph ? Math.round(Math.random()*2) - 1 : false;
		this.flipv = flipv ? Math.round(Math.random()*2) - 1 : false;
		this.grayscale = grayscale;
		this.isbreak = isbreak;
		this.breakmessage = breakmessage;
	}
}

// load app settings on reload
document.addEventListener("DOMContentLoaded", function(event) { 
	mode.setRowPrototype();
	mode.buildClassOptions();
	ui.clearActive();
	data.loadSettings();
	data.loadFile();
});
