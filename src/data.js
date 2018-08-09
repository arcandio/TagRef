/* Data */

exports.saveSession = function () {
	//console.log("saved")
	localStorage.setItem("session settings", JSON.stringify(model, null, 2));
	// save to file
	if(appsettings.lastsave){
		exports.saveSessionFile();
	}

};
exports.saveFile = function () {
	if(!appsettings.lastsave){
		saveAs();
	}
	else {
		exports.saveSessionFile();
	}
};
exports.saveAs = function () {
	dialog.showSaveDialog({
		title:"Save Session",
		defaultpath: model.folders[0],
		filters: filefilter
	}, function(path) {
		appsettings.lastsave = path;
		exports.saveSettings();
		exports.saveSessionFile();
	});
};
exports.loadDialog = function () {
	dialog.showOpenDialog({
		title: "Load Session",
		defaultpath: appsettings.lastsave,
		filters: filefilter
	}, function (path){
		//console.log(path);
		appsettings.lastsave = path[0];
		exports.loadFile();
	});
};
exports.loadFile = function () {
	if (appsettings.lastsave) {
		fs.readFile(appsettings.lastsave, 'utf8', function(err, contents){
			localStorage.setItem("session settings", contents);
			exports.loadSession();
		});
	}
};
exports.saveSessionFile = function () {
	if (appsettings.lastsave) {
		fs.writeFile(appsettings.lastsave, JSON.stringify(model, null, 2), 'utf-8', (err) => {
			if(err) throw err;
			//console.log("saved");
		});
	}
};
exports.loadSession = function () {
	model = JSON.parse(localStorage.getItem("session settings"));
	// setup stuff
	fl.setFolders(model.folders);
	mode.calcFixedTime();
	//mode.calcClassTime();
	mode.calcStructuredTime();
	ui.updateUI();
};
exports.saveSettings = function () {
	localStorage.setItem("application settings", JSON.stringify(appsettings, null, 2));
};
exports.loadSettings = function () {
	appsettings = JSON.parse(localStorage.getItem("application settings"));
	// if we didn't get anything, make a new one
	appsettings = appsettings ? appsettings : {};
	// set UI
	document.getElementById("save-log").checked = appsettings.savelog ? appsettings.savelog : true;
	// if we don't have a count, make one
	if (!appsettings.stats) {
		as = {};
		as.count = 0;
		as.lastday = util.todaysDate();
		as.drawntoday = false;
		as.daysdrawn = 0;
		as.days = 0;
		as.seconds = 0;
		as.minutes = 0;
		as.hours = 0;
		as.days = 0;
		appsettings.stats = as;
	}
};
exports.setSaveLog = function () {
	appsettings.savelog = document.getElementById("save-log").checked;
	exports.saveSettings();
};
exports.setUpLogStream = function () {
	if(appsettings.savelog){
		// location
		let now = new Date();
		pd = dateformat(now, 'yy-mm-dd hh-MM');
		fd = dateformat(now, 'ddd mmm dd yyyy hh:MM:ss');
		let logfile = appsettings.lastsave.replace(".json", pd + ".log");
		//console.log(logfile);
		// create stream
		state.logstream = fs.createWriteStream(logfile, {flags: 'a'});
		// create file
		state.logstream.write('TAGREF DRAWING LOG: \n' + fd + '\n');
		document.getElementById('open-log').style.display = "block";
	}
	else {
		document.getElementById('open-log').style.display = "none";
	}
};
exports.clearData = function(){
	localStorage.removeItem("application settings");
	localStorage.removeItem("session settings");
	state = {};
	state.files = [];
	state.timers = [];
	data.saveSettings();
	display.togglePage('setup');
	ui.updateUI();
};