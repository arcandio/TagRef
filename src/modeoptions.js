
/* Mode Switching */
exports.setMode = function (m) {
	//console.log(mode);
	
    model.mode = m;
    data.saveSession();
    ui.updateUI();
}

exports.showAbout = function () {
	display.togglePage("about");
}
exports.showData = function () {
	display.togglePage("data");
}

/* Mode Options */

exports.setLengthPerImage = function (element) {
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
		seconds = parseFloat(b.replace("s","")) * 1;
	}
	else if (b.endsWith("m")) {
		seconds = parseFloat(b.replace("m", "")) * 60;
	}
	//console.log(seconds);
	model.fixed.seconds = seconds;
	model.fixed.iscustomtime = false;
	exports.calcFixedTime();
	data.saveSession();
	ui.updateUI();
}
exports.setCustomLength = function () {
	let seconds = parseFloat(document.getElementById("fixed-custom-time").value)*60;
	model.fixed.seconds = seconds;
	model.fixed.iscustomtime = true;
	//console.log(document.getElementById("fixed-custom-time").value);
	exports.calcFixedTime();
	data.saveSession();
	ui.updateUI();
}
exports.setFixedNumber = function (element){
	//console.log(element.value);
	model.fixed.number = parseInt(element.value);
	exports.calcFixedTime();
	data.saveSession();
	ui.updateUI();
}
exports.setFixedOptions = function (){
	model.fixed.fliphr = document.getElementById("flip-h-r").checked;
	model.fixed.flipvr = document.getElementById("flip-v-r").checked;
	model.fixed.grayscale = document.getElementById("black-and-white").checked;
	exports.calcFixedTime();
	data.saveSession();
	ui.updateUI();
}
exports.calcFixedTime = function  () {
	model.fixed.totaltime = parseFloat(model.fixed.number) * parseFloat(model.fixed.seconds);
}
/* Class Mode */

exports.calcClassTime = function () {

}

/* Free mode */



/* Strucured Mode */

exports.setStructuredEvents = function () {
	// get the table
	let table = document.querySelector("#structured-settings table");
	// iterate through each row
	let rows = table.getElementsByTagName("tr");
	model.structured.events = [];
	for (let i=1; i<rows.length; i++){
		let row = rows[i];
		let e = new ev();
		// construct an EV object from the data
		e.count = row.querySelector("td.number input").value * 1;
		e.time = row.querySelector("td.time input").value * 60;
		e.isbreak = row.querySelector("td.break input").checked;
		e.breakmessage = row.querySelector("td.message input").value;
		e.fliph = row.querySelector("td.fliph input").checked;
		e.flipv = row.querySelector("td.flipv input").checked;
		e.grayscale = row.querySelector("td.gray input").checked;
		e.istimed = true;
		// add that EV object to the list
		model.structured.events.push(e)
	}
	exports.calcStructuredTime();
	//save the model
	data.saveSession();
	ui.updateUI();
}
exports.calcStructuredTime = function () {
	model.structured.totaltime = 0;
	model.structured.events.forEach(function(e){
		model.structured.totaltime += parseFloat(e.time);
	});
}
exports.setRowPrototype = function  () {
	state.rowPrototype = document.querySelector("#structured-settings table tr:nth-child(2)").cloneNode(true);
	//console.log(state.rowPrototype);
	document.querySelector("#structured-settings table tr:nth-child(2)").remove();
}
exports.appendNewRow = function () {
	let newrow = 
	document.querySelector("#structured-settings table").appendChild(state.rowPrototype.cloneNode(true));
}
exports.removeRow = function (elem){
	let row = elem.parentElement.parentElement;
	let table = row.parentElement;
	table.removeChild(row);
}