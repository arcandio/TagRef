// So much for DRY
exports.attach = function() {
	document.querySelector("#choose-folder").addEventListener('click', fl.selectFolder);
	document.querySelector("#searchfilter").addEventListener('keyup', fl.setFilters);
	document.querySelector("#blacklist").addEventListener('keyup', fl.setFilters);
	document.querySelector("#blockfilter").addEventListener('keyup', fl.setFilters);

	document.querySelector("#mode-tabs .fixed").addEventListener('click', function(){mode.setMode('fixed');});
	document.querySelector("#mode-tabs .class").addEventListener('click', function(){mode.setMode('class');});
	document.querySelector("#mode-tabs .free").addEventListener('click', function(){mode.setMode('free');});
	document.querySelector("#mode-tabs .structured").addEventListener('click', function(){mode.setMode('structured');});

	document.querySelector('#fixed-settings [data-time="30"]').addEventListener('click', function(){mode.setLengthPerImage(30);});
	document.querySelector('#fixed-settings [data-time="60"]').addEventListener('click', function(){mode.setLengthPerImage(60);});
	document.querySelector('#fixed-settings [data-time="300"]').addEventListener('click', function(){mode.setLengthPerImage(300);});
	document.querySelector('#fixed-settings [data-time="600"]').addEventListener('click', function(){mode.setLengthPerImage(600);});
	document.querySelector('#fixed-settings [data-time="1800"]').addEventListener('click', function(){mode.setLengthPerImage(1800);});
	document.querySelector("#fixed-custom-time").addEventListener('change', function(){mode.setCustomLength();});

	document.querySelector("#fixed-settings .flip-h-r").addEventListener('change', mode.setFixedOptions);
	document.querySelector("#fixed-settings .flip-v-r").addEventListener('change', mode.setFixedOptions);
	document.querySelector("#fixed-settings .grayscale").addEventListener('change', mode.setFixedOptions);

	document.querySelector("#free-settings .flip-h-r").addEventListener('change', mode.setFreeOptions);
	document.querySelector("#free-settings .flip-v-r").addEventListener('change', mode.setFreeOptions);
	document.querySelector("#free-settings .grayscale").addEventListener('change', mode.setFreeOptions);
	
	//document.querySelector("#structured-settings .grayscale").addEventListener('change', mode.setFixedOptions());

	// TODO: add event handlers for EVERY repeatable row. See attachRow() below

	document.querySelector("#structured-settings .newrow").addEventListener('click', mode.appendNewRow);

	document.querySelector("#save-log").addEventListener('change', data.setSaveLog);
	document.querySelector("#savenowdrawing").addEventListener('change', data.setNowDrawing);
	document.querySelector("#nowdrawinglocation").addEventListener('click', data.setNDFile);
	document.querySelector("#settings .volume").addEventListener('change', display.setVolume);
	document.querySelector("#settings #mutest").addEventListener('click', display.mute);

	document.querySelector(".startbutton").addEventListener('click', display.startNewSession);
	document.querySelector(".savebutton").addEventListener('click', data.saveAs);
	document.querySelector(".loadbutton").addEventListener('click', data.loadDialog);
	document.querySelector(".aboutbutton").addEventListener('click', mode.showAbout);
	document.querySelector(".databutton").addEventListener('click', mode.showData);

	document.querySelector("#next").addEventListener('click', function(){display.doEvent(reverse=false);});
	document.querySelector("#previous").addEventListener('click', function(){display.doEvent(reverse=true);});
	document.querySelector("#blacklist").addEventListener('click', display.blacklist);
	document.querySelector("#pause").addEventListener('click', display.pauseTimer);
	document.querySelector("#mutetb").addEventListener('click', display.mute);
	document.querySelector("#display-toolbar .volume").addEventListener('change', display.setVolume);
	document.querySelector("#open-log").addEventListener('click', display.openLog);
	document.querySelector("#exit-session").addEventListener('click', display.exitSession);

	document.querySelector("#exit-session-done").addEventListener('click', display.exitSession);
	document.querySelector("#all-done .sessionloglocation").addEventListener('click', display.openLog);

	document.querySelector("#about-page .back.top").addEventListener('click', function(){display.togglePage('setup');});
	document.querySelector("#about-page .back.bottom").addEventListener('click', function(){display.togglePage('setup');});

	document.querySelector("#clear-data").addEventListener('click', data.clearData);
	document.querySelector("#data-page .back.top").addEventListener('click', function(){display.togglePage('setup');});
	document.querySelector("#data-page .back.bottom").addEventListener('click', function(){display.togglePage('setup');});

};
exports.attachRows = function (){
	// get the table
	let table = document.querySelector("#structured-settings table");
	let inputs = table.querySelectorAll("input");
	if(inputs){
		for (let i=0; i<inputs.length; i++){
			let element = inputs[i];
			//console.log(element);
			element.removeEventListener('change', mode.setStructuredEvents);
			element.addEventListener('change', mode.setStructuredEvents);
		}
		let buttons = table.querySelectorAll(".delete");
		for (let i=0; i<buttons.length; i++){
			let button = buttons[i];
			button.removeEventListener('click', mode.removeRow);
			button.addEventListener('click', mode.removeRow);
		}
	}
};