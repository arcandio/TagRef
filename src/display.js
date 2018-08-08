/* Page Switching */

exports.togglePage = function (page) {
	document.querySelectorAll(".page").forEach(function (elem){
		elem.classList.add("h");
	});
	document.querySelector("#" + page + "-page").classList.remove("h");
}

/* Display */

exports.startNewSession = function  () {
	// setup log
	data.setUpLogStream();
	// setup event list
	buildEventList();
	// start display
	exports.togglePage('display');
	exports.doCountdown(5);
}
exports.doCountdown = function (length){
	state.countdownend = new Date().getTime() + length*1000;
	exports.showCountdown();
	let ct = document.querySelector("#countdown .timer")
	ct.innerHTML = length;
	state.countdown = setInterval(function() {
		let now = new Date().getTime();
		let distance = state.countdownend - now;
		let t = Math.round(distance/1000);
		ct.innerHTML = t;
		exports.soundTest(t);
		if (t<=0){
			exports.doEvent();
			exports.hideCountdown();
			clearInterval(state.countdown);
		}
	}, 1000)
}
exports.showCountdown = function (){
	document.getElementById("countdown").style.display = "block";	
}
exports.hideCountdown = function () {
	document.getElementById("countdown").style.display = "none";
}
exports.soundTest = function (t){
	if (t <= 3 && t > 0){
		//console.log("bip");
		bip.play();
	}
	else if (t == 0) {
		//console.log("BEEEEEP");
		beep.play();
	}
}
function buildEventList () {
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
					1,
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
			let co = classes[model.class.classtype];
			//console.log(co)
			for (let i=0; i<co.events.length; i++){
				let s = co.events[i];
				for (let n=0; n<s.count; n++){
					let e = new ev(
						s.time,
						1,
						true,
						selectImage(s.isbreak),
						s.fliphr,
						s.flipvr,
						s.grayscale,
						s.isbreak,
						s.breakmessage
						);
					state.events.push(e);
				}
			}
			break;
		case "free":
			for (let i=0; i<state.files.length; i++) {
				let e = new ev(
					0,
					1,
					false,
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
		case "structured":
			for (let i=0; i<model.structured.events.length; i++){
				let s = model.structured.events[i];
				for (let n=0; n<s.count; n++){
					let e = new ev(
						s.time,
						1,
						true,
						selectImage(s.isbreak),
						s.fliphr,
						s.flipvr,
						s.grayscale,
						s.isbreak,
						s.breakmessage
						);
					state.events.push(e);
				}
			}
			break;
	}
	//console.log(state.events);
}
function selectImage (skip) {
	if (skip){
		return "";
	}
	//console.log(state.files);
	// randomly pick an image from state.files
	// If we've used up all our files, refil our unused files
	if (state.unused.length < 1){
		state.unused = state.files.slice();
	}
	//console.log(state.unused);
	// range
	let max = state.unused.length;
	// random
	let index = util.randInt(max);
	// filename
	let filepath = state.unused[index];
	// add it to history
	//state.history.push(state.unused[index]);
	// remove it from unused
	state.unused.splice(index, 1);
	// hand it over
	//console.log(filepath);
	return filepath;
}
exports.preloadImage = function (filepath) {
	// place a url on the preloader
	var pl = document.createElement('div');
	pl.style.backgroundimage = "url( '" + filepath + "' )";
	document.getElementById("preloader").appendChild(pl);
}
exports.showImage = function (e) {
	// get the image
	//console.log(e.image);
	// grab the element
	let d = document.getElementById("display");
	//console.log(d)
	d.style.backgroundImage = "url( '" + e.image + "' )";
	// apply settings
	let cl = d.classList;
	e.grayscale ? cl.add('grayscale') : cl.remove('grayscale');
	e.flipv ? cl.add('flip-v') : cl.remove('flip-v');
	e.fliph ? cl.add('flip-h') : cl.remove('flip-h');
	//write to log
	exports.writeLog(e);
}
exports.doEvent = function (reverse) {
	// pick the next event to show, whether it's forward or backward
	state.eventindex += reverse ? -1 : 1;
	//console.log(state.eventindex);
	// clamp the event index for safety
	// if it's less than 0, just clamp
	if (state.eventindex < 0) {
		state.eventindex = 0
	}
	else {
		// hide the completed screen
		document.getElementById("all-done").style.display = "none";
		// get the event object from the index
		let e = state.events[state.eventindex];
		// display image
		exports.showImage(e);
		// Set the message
		document.getElementById("breakmessage").innerHTML = e.breakmessage;
		// show or hide break time
		if (e.isbreak) {
			document.getElementById("break").style.display = "block";
			document.getElementById("info").classList.add("breakcenter");
		}
		else {
			document.getElementById("break").style.display = "none";
			document.getElementById("info").classList.remove("breakcenter");
		}
		// setup countdown
		if (e.istimed){
			exports.startTimer(e.time);
			//console.log(e)
		}
	}
}
exports.startTimer = function (remaining) {
	state.timerend = new Date().getTime() + remaining * 1000;
	//console.log(e)
	let it = document.getElementById('imagetimer');
	it.innerHTML = remaining;
	clearInterval(state.timer);
	state.timer = setInterval(exports.timerTick, 1000);
}
exports.timerTick = function  () {
	let now = new Date().getTime();
	let distance = state.timerend - now;
	state.t = Math.round(distance/1000);
	let it = document.getElementById('imagetimer');
	it.innerHTML = state.t;
	if (state.t <= 0) {
		if(state.t === 0 ){
			exports.incrementCounters();
		}
		// if we still have events to do, do one
		if (state.eventindex < state.events.length - 1){
			clearInterval(state.timer);
			exports.doEvent();
			//state.timer = 0;
		}
		// if we DON'T have events left to do,
		// and if there's still an active timer,
		// turn it off
		else {
			// session's complete. Show the completed screen
			document.getElementById("all-done").style.display = "block";
			clearInterval(state.timer);
		}
	}
	exports.soundTest(state.t);
}
exports.incrementCounters = function (){
	if (state.events.length) {
		let e = state.events[state.eventindex];
		if (!e.isbreak){
			let as = appsettings.stats;
			as.count += 1;
			as.seconds += e.time;
			//as.seconds += Math.floor(Math.random() * 100000);
			as.seconds = Math.floor(as.seconds);
			// now. lets. MODULOOOOO
			as.minutes += Math.floor(as.seconds / 60);
			as.seconds = as.seconds % 60;
			as.hours += Math.floor(as.minutes / 60);
			as.minutes = as.minutes % 60;
			as.days += Math.floor(as.hours / 24);
			as.hours = as.hours % 24;
			// check to reset our daily session count
			let today = new Date();
			today.setHours(0,0,0,0);
			let lastday = new Date(as.lastday);
			lastday.setHours(0,0,0,0);
			//console.log(today);
			//console.log(lastday);
			if (today.valueOf() !== lastday.valueOf()) {
				as.drawntoday = false;
				as.lastday = util.todaysDate();
			}
			// Check if we've drawn today
			if (!as.drawntoday) {
				// we haven't recorded a session today
				as.daysdrawn += 1;
				as.drawntoday = true;
			}
			//console.log(as);
			data.saveSettings();
			ui.updateStats();
		}
	}
}
exports.pauseTimer = function () {
	state.paused = !state.paused;
	let now = new Date().getTime();
	// if we're not paused, restart the timer
	if (!state.paused) {
		state.timerend = now + state.remaining;
		state.timer = setInterval(exports.timerTick, 1000);
	}
	// if we're paused, set the remaining time so we can get it later
	else {
		state.remaining = state.timerend - now;
		clearInterval(state.timer);
	}
	ui.updateUI();
}
exports.writeLog = function (e){
	let f = e.image;
	f = f ? f : e.breakmessage;
	//f = f.slice(5,-2);
	let line = new Date();
	line = dateformat(line, 'longTime');
	line += " ";
	line += f;
	//console.log(line);
	if (state.logstream) {
		state.logstream.write('\n' + line);
	}
}
exports.exitSession = function () {
	// clear the timer
	clearInterval(state.timer);
	// clear the event list
	state.events = [];
	state.unused = []
	state.eventindex = -1;
	state.timerend = new Date().getTime();
	state.paused = false;
	// hide the completed screen
	document.getElementById("all-done").style.display = "none";
	// show the setup page
	exports.togglePage('setup');
}

/* Toolbar */

exports.mute = function(){
	appsettings.muted = !appsettings.muted;
	data.saveSettings();
	ui.updateUI()
}
exports.setVolume = function(elem){
	appsettings.volume = elem.value;
	data.saveSettings();
	ui.updateUI();
}
exports.openLog = function(){
	shell.openItem(state.logstream.path);
}
