
/* Mode Switching */
exports.setMode = function (m) {
	//console.log(mode);
	
    model.mode = m;
    data.saveSession();
    ui.updateUI();
};

exports.showAbout = function () {
	display.togglePage("about");
};
exports.showData = function () {
	display.togglePage("data");
};

/* Mode Options */

exports.setLengthPerImage = function (seconds) {
	//console.log(seconds);
	model.fixed.seconds = seconds;
	model.fixed.iscustomtime = false;
	exports.calcFixedTime();
	data.saveSession();
	ui.updateUI();
};
exports.setCustomLength = function () {
	let seconds = parseFloat(document.getElementById("fixed-custom-time").value)*60;
	model.fixed.seconds = seconds;
	model.fixed.iscustomtime = true;
	//console.log(document.getElementById("fixed-custom-time").value);
	exports.calcFixedTime();
	data.saveSession();
	ui.updateUI();
};
exports.setFixedNumber = function (element){
	//console.log(element.value);
	model.fixed.number = parseInt(element.value);
	exports.calcFixedTime();
	data.saveSession();
	ui.updateUI();
};
exports.setFixedOptions = function (){
	model.fixed.fliphr = document.querySelector("#fixed-settings .flip-h-r").checked;
	model.fixed.flipvr = document.querySelector("#fixed-settings .flip-v-r").checked;
	model.fixed.grayscale = document.querySelector("#fixed-settings .grayscale").checked;
	exports.calcFixedTime();
	data.saveSession();
	ui.updateUI();
};
exports.calcFixedTime = function  () {
	model.fixed.totaltime = parseFloat(model.fixed.number) * parseFloat(model.fixed.seconds);
};

/* Class Mode */

exports.buildClassOptions = function () {
	// get the settings box
	let box = document.querySelector("#class-settings div");
	// object keys
	let keys = Object.keys(classes);
	//console.log(keys)
	// construct content
	let content = '';
	for(let i=0; i<keys.length; i++){
		let classname = keys[i];
		let co = classes[classname];
		//console.log(co);
		content += "<div class='classblock'>";
		content += "<button class='classselect' ";
		content += " onclick='mode.selectClass(this)' ";
		content += " id=' " + util.makeId(classname) + "' ";
		content += " >";
		content += classname;
		content += "</button>";
		content += "\n";
		content += "<p>" + co.description + "</p>";
		content += "<p>Drawings: ";
		content += util.sumKey(co.events, "count");
		content += ", Breaks: ";
		content += util.sumKey(co.events, "isbreak");
		content += "</p>";
		content += "</div>";
	}
	box.innerHTML = content;
};
exports.selectClass = function(elem){
	let classtype = elem.innerHTML;
	console.log();
	model.class.classtype = elem.innerHTML;
	data.saveSession();
	ui.updateUI();
};
/*
exports.calcClassTime = function () {

}
*/
/* Free mode */
exports.setFreeOptions = function (){
	model.free.fliphr = document.querySelector("#free-settings .flip-h-r").checked;
	model.free.flipvr = document.querySelector("#free-settings .flip-v-r").checked;
	model.free.grayscale = document.querySelector("#free-settings .grayscale").checked;
	data.saveSession();
	ui.updateUI();
};


/* Strucured Mode */

exports.setStructuredEvents = function () {
	console.log("sse");
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
		model.structured.events.push(e);
	}
	exports.calcStructuredTime();
	// update ui
	console.log(rows);
	eventListeners.attachRows();
	//save the model
	data.saveSession();
	ui.updateUI();
};
exports.calcStructuredTime = function () {
	//console.log("cst");
	model.structured.totaltime = 0;
	if (model.structured && model.structured.events){
		model.structured.events.forEach(function(e){
			model.structured.totaltime += parseFloat(e.time) * parseFloat(e.count);
		});
	}
};
exports.setRowPrototype = function  () {
	state.rowPrototype = document.querySelector("#structured-settings table tr:nth-child(2)").cloneNode(true);
	//console.log(state.rowPrototype);
	document.querySelector("#structured-settings table tr:nth-child(2)").remove();
};
exports.appendNewRow = function () {
	let newrow = 
	document.querySelector("#structured-settings table").appendChild(state.rowPrototype.cloneNode(true));
	exports.setStructuredEvents();
	//exports.calcStructuredTime();
	//data.saveSession();
};
exports.removeRow = function (event){
	console.log(event);
	let elem = event.path[0];
	let row = elem.parentElement.parentElement;
	let table = row.parentElement;
	//console.log(table);
	//console.log(row);
	table.removeChild(row);
	exports.setStructuredEvents();
	//exports.calcStructuredTime();
	//data.saveSession();
};