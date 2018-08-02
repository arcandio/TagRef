const {dialog} = require('electron').remote;
var shell = require('electron').shell;
var minimatch = require('minimatch');
var Glob = require('glob').Glob;
var fs = require('fs');
var timers = require('timers');
var dateformat = require('dateformat');
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

/* Page Switching */

function togglePage(page) {
	document.querySelectorAll(".page").forEach(function(elem){
		elem.classList.add("h");
	});
	document.querySelector("#" + page + "-page").classList.remove("h");
}

/* Folder Selection */
function selectFolder() {
	setFolders(dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']}));
	
}
function setFolders(folders) {
	if (folders){
		model.folders = cleanupFolderPaths(folders);
		saveSession();
		//console.log(folders);
		let folderlist = document.getElementById('root-folders');
		folderlist.innerHTML = '';
		for (let i=0; i<model.folders.length; i++){
			let item = document.createElement("li");
			item.innerHTML = model.folders[i];
			folderlist.appendChild(item);
		}
		doGlob();
	}
}

/* Base File List */

function doGlob() {
	// Get all files with extension in all folders and subfolders
	let extensions = ['*.jpg', '*.png', '*.tiff', '*.webp'];
	//let files = [];
	let pat = packMultiGlobF(model.folders) + "/**/" + packMultiGlobE(extensions);
	//console.log(pat);
	let g = new Glob(pat, globComplete)
	//console.log(g);
}
function globComplete(err, matches) {
	//console.log(matches.length);
	removeFiles(matches);
}
function removeFiles(files) {
	// concat the blacklist and block filter arrays
	let temp = [];
	let removalarray = cleanArray(model.blacklist.concat(blockfilter));
	//console.log(removalarray);
	for (let i=0; i<files.length; i++) {
		if (!containsAny(files[i], removalarray)) {
			temp.push(files[i]);
		}
	}
	state.files = temp;
	//console.log(state.files.length);
	//console.log(files);
}
function setFilters() {
	model.blacklist = [];
	model.blacklist = document.getElementById("blacklist").value.split("\n");
	model.blockfilter = [];
	model.blockfilter = document.getElementById("blockfilter").value.split("\n");
	saveSession();
	updateUI();
}

/* Mode Switching */
function setMode(m) {
	//console.log(mode);
	
    model.mode = m;
    saveSession();
    updateUI();
}

/* Mode Options */

function setLengthPerImage(element) {
	//clear other children
	var children = Array.prototype.slice.call(element.parentElement.children);
	children.forEach(function(child){
		child.classList.remove("active");
	});
	//element.classList.add("active");
	// figure out time in seconds
	let seconds = 0;
	let b = element.innerHTML;
	//console.log(b);
	if (b === "Custom") {
		seconds = parseFloat(document.getElementById("fixed-custom-time").value)*60;
	}
	else if (b.endsWith("s")) {
		seconds = parseFloat(b.replace("s",""));
	}
	else if (b.endsWith("m")) {
		seconds = parseFloat(b.replace("m", ""))*60;
	}
	console.log(seconds);
	model.fixed.seconds = seconds;
	model.fixed.iscustomtime = false;
	saveSession();
	updateUI();
}
function setCustomLength() {
	let seconds = parseFloat(document.getElementById("fixed-custom-time").value)*60;
	model.fixed.seconds = seconds;
	model.fixed.iscustomtime = true;
	//console.log(document.getElementById("fixed-custom-time").value);
	saveSession();
	updateUI();
}
function setFixedNumber(element){
	//console.log(element.value);
	model.fixed.number = element.value;
	saveSession();
	updateUI();
}
function setFixedOptions(){
	model.fixed.fliphr = document.getElementById("flip-h-r").checked;
	model.fixed.flipvr = document.getElementById("flip-v-r").checked;
	model.fixed.grayscale = document.getElementById("black-and-white").checked;
	saveSession();
	updateUI();
}

/* Display */

function startNewSession () {
	// setup log
	setUpLogStream();
	// setup event list
	buildEventList();
	// start display
	togglePage('display');
	doCountdown(5);
}
function doCountdown(length){
	state.countdownend = new Date().getTime() + length*1000;
	showCountdown();
	let ct = document.querySelector("#countdown .timer")
	ct.innerHTML = length;
	state.countdown = setInterval(function() {
		let now = new Date().getTime();
		let distance = state.countdownend - now;
		let t = Math.round(distance/1000);
		ct.innerHTML = t;
		soundTest(t);
		if (t<=0){
			doEvent();
			hideCountdown();
			clearInterval(state.countdown);
		}
	}, 1000)
}
function showCountdown(){
	document.getElementById("countdown").style.display = "block";	
}
function hideCountdown() {
	document.getElementById("countdown").style.display = "none";
}
function soundTest(t){
	if (t <= 3 && t > 0){
		//console.log("bip");
		bip.play();
	}
	else if (t == 0) {
		//console.log("BEEEEEP");
		beep.play();
	}
}
class ev {
	constructor (time, istimed, image, fliph, flipv, grayscale, isbreak, breakmessage) {
		this.time = time;
		this.istimed = istimed;
		this.image = image;
		this.fliph = fliph ? Math.round(Math.random()*2) - 1 : false;
		this.flipv = flipv ? Math.round(Math.random()*2) - 1 : false;
		this.grayscale = grayscale;
		this.isbreak = isbreak;
		this.breakmessage = breakmessage;
	}
}
function buildEventList() {
	state.events = [];
	state.unused = state.files.slice();
	//state.history = [];
	state.eventindex = -1;
	state.timerend = new Date().getTime();
	state.paused = false;
	//console.log(model.mode);
	switch(model.mode){
		case "fixed":
			for (let i=0; i<model.fixed.number; i++){
				let e = new ev(
					model.fixed.seconds,
					true,
					selectImage(),
					model.fixed.fliphr,
					model.fixed.flipvr,
					model.fixed.grayscale,
					false,
					""
					);
				state.events.push(e);
			}
			break;
		case "class":
			break;
		case "free":
			break;
		case "structured":
			break;
	}
	//console.log(state.events);
}
function selectImage() {
	// randomly pick an image from state.files
	// If we've used up all our files, refil our unused files
	if (state.unused.length < 1){
		state.unused = state.files;
	}
	// range
	let max = state.unused.length;
	// random
	let index = rantInt(max);
	// filename
	let filepath = state.unused[index];
	// add it to history
	//state.history.push(state.unused[index]);
	// remove it from unused
	state.unused.splice(index, 1);
	// hand it over
	return filepath;
}
function preloadImage(filepath) {
	// place a url on the preloader
	var pl = document.createElement('div');
	pl.style.backgroundimage = "url(" + filepath + ")";
	document.getElementById("preloader").appendChild(pl);
}
function showImage(e) {
	//console.log(filepath);
	document.getElementById("display").style.backgroundImage = "url(" + e.image + ")";
	// apply settings
	let d = document.getElementById("display");
	let cl = d.classList;
	e.grayscale ? cl.add('grayscale') : cl.remove('grayscale');
	e.flipv ? cl.add('flip-v') : cl.remove('flip-v');
	e.fliph ? cl.add('flip-h') : cl.remove('flip-h');
	//write to log
	writeLog(e);
}
function doEvent(reverse) {
	// pick the next event to show, whether it's forward or backward
	state.eventindex += reverse ? -1 : 1;
	//console.log(state.eventindex);
	// clamp the event index for safety
	// if it's less than 0, just clamp
	if (state.eventindex < 0) {
		state.eventindex = 0
	}
	// if it's greater than the max, the session is complete.
	else if (state.eventindex > state.events.length - 1) {
		console.log(state.eventindex);
		// session's complete. Show the completed screen
		document.getElementById("all-done").style.display = "block";
		clearInterval(state.timer);
		//state.timer = 0;
	}
	else {
		// hide the completed screen
		document.getElementById("all-done").style.display = "none";
		// get the event object from the index
		let e = state.events[state.eventindex];
		// display image
		showImage(e);
		// setup countdown
		if (e.istimed){
			startTimer(e.time);
		}
	}

}
function startTimer(remaining) {
	state.timerend = new Date().getTime() + remaining * 1000;
	//console.log(e)
	let it = document.getElementById('imagetimer');
	it.innerHTML = remaining;/*
	console.log(state.timer)
	if (state.timer) {
		clearInterval(state.timer);
		state.timer = null;
	}*/
	state.timer = setInterval(timerTick, 1000);
	console.log(state.timers);
}
function timerTick () {
	let now = new Date().getTime();
	let distance = state.timerend - now;
	state.t = Math.round(distance/1000);
	let it = document.getElementById('imagetimer');
	it.innerHTML = state.t;
	if (state.t <= 0) {
		// if we still have events to do, do one
		if (state.eventindex < state.events.length - 1){
			clearInterval(state.timer);
			doEvent();
			//state.timer = 0;
		}
		// if we DON'T have events left to do,
		// and if there's still an active timer,
		// turn it off
		else if (state.timer) {
			console.log("clearing timer #" + state.timer);
			clearInterval(state.timer);
		}
	}
	soundTest(state.t);
}
function pauseTimer() {
	state.paused = !state.paused;
	// if we're not paused, restart the timer
	if (!state.paused) {
		state.timer = setInterval(timerTick, 1000);
	}
	// if we're paused, set the remaining time so we can get it later
	else {
		let now = new Date().getTime();
		state.remaining = state.timerend - now;
		clearInterval(state.timer);
	}
}
function writeLog(){
	let f = document.getElementById("display").style.backgroundImage;
	f = f.slice(5,-2);
	let line = new Date();
	line = dateformat(line, 'longTime');
	line += " ";
	line += f;
	//console.log(line);
	if (state.logstream) {
		state.logstream.write('\n' + line);
	}
}

/* Toolbar */

function mute(){
	appsettings.muted = !appsettings.muted;
	saveSettings();
	updateUI()
}
function setVolume(elem){
	appsettings.volume = elem.value;
	saveSettings();
	updateUI();
}
function openLog(){
	shell.openItem(state.logstream.path);
}

/* UI State */

function clearActive() {
	// use updateUI() to get ui state
	var children = Array.prototype.slice.call(document.getElementsByClassName("active"));
	children.forEach(function(child){
		child.classList.remove("active");
	});
}
function updateUI() {
	clearActive();
	// folders are done by setFolders()
	// filters
	document.getElementById("blacklist").value = model.blacklist ? model.blacklist.join("\n") : "";
	document.getElementById("blockfilter").value = model.blockfilter ? model.blockfilter.join("\n") : "";
	autoGrowTextArea(document.getElementById("blockfilter"));
	autoGrowTextArea(document.getElementById("blacklist"));
	// mode
    document.getElementById(model.mode + "-settings").classList.add('active');
    document.querySelector("#mode-tabs ." + model.mode).classList.add('active');
	// time per image
	let t = model.fixed.seconds;
	if (t && !model.fixed.iscustomtime) {
		let b = document.querySelector('[data-time="' + t + '"]');
		b.classList.add('active');
	}
	else if (model.fixed.iscustomtime) {
		let b = document.querySelector('[data-time="custom"]');
		b.classList.add('active');
		let mt = document.getElementById("fixed-custom-time");
		mt.classList.add('active');
		mt.value = model.fixed.seconds/60;
	}
	// number of images
	document.getElementById("fixed-number").value = model.fixed.number;
	// fixed options
	document.getElementById("flip-h-r").checked = model.fixed.fliphr;
	document.getElementById("flip-v-r").checked = model.fixed.flipvr;
	document.getElementById("black-and-white").checked = model.fixed.grayscale;
	// Toolbars
	// volume
	if(!appsettings.volume){
		appsettings.volume = .5;
	}
	bip.volume = appsettings.volume;
	beep.volume = appsettings.volume;
	document.getElementById("vtb").value = appsettings.volume;
	document.getElementById("vsetting").value = appsettings.volume;
	// Muting
	bip.muted = appsettings.muted;
	beep.muted = appsettings.muted;
	if (appsettings.muted) {
		document.getElementById("mutetb").classList.add("active")
		document.getElementById("mutest").classList.add("active")
	}
	else {
		document.getElementById("mutetb").classList.remove("active")
		document.getElementById("mutest").classList.remove("active")
	}
	// pause
	if (state.paused) {
		document.getElementById("pause").classList.add("active");
	}
	else{
		document.getElementById("pause").classList.remove("active");
	}
}

/* Utility */

function packMultiGlobF(array) {
	if (array.length == 1) {
		return replaceBackslash(array[0]);
	}
	else {
		return replaceBackslash("{" + array.join(",") + "}");
	}
}
function packMultiGlobE(array) {
	if (array.length == 1) {
		return replaceBackslash(array[0]);
	}
	else {
		return replaceBackslash("+(" + array.join("|") + ")");
	}
}
function replaceBackslash(string){
	return string.split("\\").join("/");
}
function cleanupFolderPaths(array){
	let t = [];
	for (let i=0; i<array.length; i++){
		t.push(replaceBackslash(array[i]));
	}
	return t;
}
function containsAny(str, substrings){
	for (let i=0; i<substrings.length; i++){
		let substring = substrings[i];
		if (str.indexOf(substring) != -1){
			return true;
		}
	}
	return false;
}
function autoGrowTextArea(element){
	element.style.height = "5px";
	element.style.height = (element.scrollHeight)+"px";
}
function cleanArray(oldArray) {
  var newArray = new Array();
  for (var i = 0; i < oldArray.length; i++) {
    if (oldArray[i]) {
      newArray.push(oldArray[i]);
    }
  }
  return newArray;
}
function rantInt(max){
	return Math.floor(Math.random() * Math.floor(max));
}
function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}
// reference https://stackoverflow.com/questions/8126466/how-do-i-reset-the-setinterval-timer
function Timer(fn, t) {
	var timerObj = setInterval(fn, t);
	this.stop = function() {
		if(timerObj){
			clearInterval(timerObj);
			timerObj = null;
		}
		return this;
	}
	this.start = function () {
		if(!timerObj) {
			this.stop();
			timerObj = setInterval(fn, t);
		}
		return this;
	}
	this.reset = function(newT) {
		t = newT;
		return this.stop().start();
	}

}

/* Data */

function saveSession() {
	//console.log("saved")
	localStorage.setItem("session settings", JSON.stringify(model, null, 2));
	// save to file
	if(appsettings.lastsave){
		saveSessionFile();
	}

}
function saveFile() {
	if(!appsettings.lastsave){
		dialog.showSaveDialog({
			title:"Save Session",
			defaultpath: model.folders[0],
			filters:[{name: 'json', extensions:['json']}]
		}, function(path) {
			appsettings.lastsave = path;
			saveSettings();
			saveSessionFile();
			
		});
	}
	else {
		saveSessionFile();
	}
}
function saveSessionFile() {
	if (appsettings.lastsave) {
		fs.writeFile(appsettings.lastsave, JSON.stringify(model, null, 2), 'utf-8', (err) => {
			if(err) throw err;
			//console.log("saved");
		});
	}
}
function loadSession() {
	model = JSON.parse(localStorage.getItem("session settings"));
	setFolders(model.folders);
	updateUI();
}
function saveSettings() {
	localStorage.setItem("application settings", JSON.stringify(appsettings, null, 2));
}
function loadSettings() {
	appsettings = JSON.parse(localStorage.getItem("application settings"));
	// set UI
	document.getElementById("save-log").checked = appsettings.savelog;
}
function setSaveLog() {
	appsettings.savelog = document.getElementById("save-log").checked;
	saveSettings();
}
function setUpLogStream() {
	if(appsettings.savelog){
		// location
		let now = new Date();
		pd = dateformat(now, 'yy-mm-dd hh-MM');
		fd = dateformat(now, 'ddd mmm dd yyyy hh:MM:ss');
		let logfile = appsettings.lastsave.replace(".json", pd + ".log");
		console.log(logfile);
		// create stream
		state.logstream = fs.createWriteStream(logfile, {flags: 'a'});
		// create file
		state.logstream.write('TAGREF DRAWING LOG: \n' + fd + '\n');
		document.getElementById('open-log').style.display = "block";
	}
	else {
		document.getElementById('open-log').style.display = "none";
	}
}
// load app settings on reload
document.addEventListener("DOMContentLoaded", function(event) { 
	clearActive();
	loadSettings();
	loadSession();
});