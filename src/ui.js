
/* UI State */

exports.clearActive = function () {
	// use updateUI() to get ui state
	var children = Array.prototype.slice.call(document.getElementsByClassName("active"));
	children.forEach(function(child){
		child.classList.remove("active");
	});
}
exports.updateUI = function () {
	exports.clearActive();
	// folders are done by setFolders()
	// filters
	document.getElementById("searchfilter").value = model.blacklist ? model.searchfilter.join("\n") : "";
	document.getElementById("blacklist").value = model.blacklist ? model.blacklist.join("\n") : "";
	document.getElementById("blockfilter").value = model.blockfilter ? model.blockfilter.join("\n") : "";
	util.autoGrowTextArea(document.getElementById("searchfilter"));
	util.autoGrowTextArea(document.getElementById("blockfilter"));
	util.autoGrowTextArea(document.getElementById("blacklist"));
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
	// free options
	document.querySelector("#free-settings .flip-h-r").checked = model.free.fliphr;
	document.querySelector("#free-settings .flip-v-r").checked = model.free.flipvr;
	document.querySelector("#free-settings .black-and-white").checked = model.free.grayscale;
	// class options
	let classes = document.querySelectorAll(".classselect");
	let classname = model.class.classtype;
	classname = util.makeId(classname);
	//console.log(classes);
	for (let i=0; i<classes.length; i++){
		let c = classes[i];
		//c.classList.remove('active');
		//console.log(c.id);
		//console.log(classname);
		// MAGIC ALERT. I have NO IDEA why I need trim the ID in order for it to match the classname. IDs aren't supposed to contain any spaces.
		if(c.id.trim() === classname){
			c.classList.add('active');
		}
		else {
			c.classList.remove('active')
		}
	}
	// structured options
	let table = document.querySelector("#structured-settings table");
	let rows = table.querySelectorAll(".repeatable");
	// remove old elements
	// resize table
	while (rows.length !== model.structured.events.length) {
		if(rows.length > model.structured.events.length){
			rows[rows.length-1].remove();
			rows = table.querySelectorAll(".repeatable");
		}
		else {
			table.appendChild(state.rowPrototype.cloneNode(true));
			rows = table.querySelectorAll(".repeatable");
		}
	}
	// apply events
	//console.log(model.structured.events)
	for (let i=0; i<model.structured.events.length; i++){
		let e = model.structured.events[i];
		let r = rows[i];
		// apply settings
		r.querySelector("td.number input").value = e.count;
		r.querySelector("td.time input").value = e.time / 60;
		r.querySelector("td.break input").checked = e.isbreak;
		r.querySelector("td.message input").value = e.breakmessage;
		r.querySelector("td.fliph input").checked = e.fliph;
		r.querySelector("td.flipv input").checked = e.flipv;
		r.querySelector("td.gray input").checked = e.grayscale;
	}
	// update Time
	document.querySelector("#fixed-settings .totaltime").innerHTML=util.secondsToTimeSpan(model.fixed.totaltime);
	//document.querySelector("#class-settings .totaltime").innerHTML=util.secondsToTimeSpan(model.class.totaltime);
	document.querySelector("#structured-settings .totaltime").innerHTML=util.secondsToTimeSpan(model.structured.totaltime);

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
	// hide log buttons
	if (appsettings.savelog) {
		document.getElementById("completionLog").style.display = "inline";
	}
	else {
		document.getElementById("completionLog").style.display = "none";
	}
	exports.updateStats();
	exports.updateStartButton();
}
exports.updateStartButton = function (){
	// disable start when zero
	//console.log(state.files.length);
	if (state.files.length){
		document.querySelector(".startbutton").disabled = false;
	}
	else {
		document.querySelector(".startbutton").disabled = true;
	}
}
exports.updateStats = function (){
	// construct stat string
	let as = appsettings.stats;
	let totals = as.seconds;
	totals += as.minutes * 60;
	totals += as.hours * 60 * 60;
	totals += as.days * 60 * 60 * 24;
	var tpd = totals / as.count;
	//var d = new Date(null);
	//d.setSeconds(tpd);
	//tpd = d//.toISOString().substr(11, 8);
	var ddt = totals / as.daysdrawn;
	//d.setSeconds(ddt);
	//ddt = d//.toISOString().substr(11, 8);
	let str = "<h3>Your Stats</h3><div><dl>";
	str += "<dt>Images Drawn</dt>";
	str += "<dd>" + as.count + "</dd>";
	str += "<dt>Time Drawn</dt>";
	str += "<dd>";
	str += util.secondsToTimeSpan(totals);
	str += "</dd>";
	str += "<dt>Average Time per Drawing</dt>";
	str += "<dd>" + util.secondsToTimeSpan(tpd) + "</dd>";
	str += "<dt>Days Drawn</dt>";
	str += "<dd>" + as.daysdrawn + "</dd>"
	str += "<dt>Average Time Spent per day Drawing</dt>";
	str += "<dd>" + util.secondsToTimeSpan(ddt) + "</dd>"
	str += "</div></dl>";
	// get all stat elements
	let statelements = document.getElementsByClassName('stats');
	//console.log(statelements);
	for (let i=0; i<statelements.length; i++){
		let elem = statelements[i];
		elem.innerHTML = str;
	}
}
