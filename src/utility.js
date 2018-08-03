/* Utility */

exports.packMultiGlobF = function (array) {
	if (array.length == 1) {
		return exports.replaceBackslash(array[0]);
	}
	else {
		return exports.replaceBackslash("{" + array.join(",") + "}");
	}
}
exports.packMultiGlobE = function (array) {
	if (array.length == 1) {
		return exports.replaceBackslash(array[0]);
	}
	else {
		return exports.replaceBackslash("+(" + array.join("|") + ")");
	}
}
exports.replaceBackslash = function (string){
	return string.split("\\").join("/");
}
exports.cleanupFolderPaths = function (array){
	let t = [];
	for (let i=0; i<array.length; i++){
		t.push(exports.replaceBackslash(array[i]));
	}
	return t;
}
exports.containsAny = function (str, substrings){
	for (let i=0; i<substrings.length; i++){
		let substring = substrings[i];
		if (str.indexOf(substring) != -1){
			return true;
		}
	}
	return false;
}
exports.autoGrowTextArea = function (element){
	element.style.height = "5px";
	element.style.height = (element.scrollHeight)+"px";
}
exports.cleanArray = function (oldArray) {
  var newArray = new Array();
  //console.log(oldArray);
  if (oldArray) {
	  for (var i = 0; i < oldArray.length; i++) {
	    if (oldArray[i]) {
	      newArray.push(oldArray[i]);
	    }
	  }
	}
  return newArray;
}
exports.randInt = function (max){
	return Math.floor(Math.random() * Math.floor(max));
}
exports.clamp = function (num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}
// reference https://stackoverflow.com/questions/8126466/how-do-i-reset-the-setinterval-timer
exports.Timer = function (fn, t) {
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
exports.todaysDate = function () {
	let d = new Date();
	d.setHours(0,0,0,0);
	return d;
}
exports.secondsToTimeSpan = function (seconds){
	as = {};
	//as.seconds += seconds;
	//as.seconds = Math.floor(Math.random() * 100000);
	as.seconds = Math.floor(seconds);
	// now. lets. MODULOOOOO
	as.minutes = Math.floor(as.seconds / 60);
	as.seconds = as.seconds % 60;
	as.hours = Math.floor(as.minutes / 60);
	as.minutes = as.minutes % 60;
	as.days = Math.floor(as.hours / 24);
	as.hours = as.hours % 24;

	let span = '';
	span += as.days ? as.days + " days, " : "";
	span += as.hours ? as.hours + " hours, " : "";
	span += as.minutes ? as.minutes + " minutes, " : "";
	span += as.seconds ? as.seconds + " seconds" : "";
	return span;
}