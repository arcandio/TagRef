/* Folder Selection */
exports.selectFolder = function () {
	exports.setFolders(dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']}));
	
};
exports.setFolders = function (folders) {
	if (folders){
		model.folders = util.cleanupFolderPaths(folders);
		data.saveSession();
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
};

/* Base File List */

function doGlob() {
	// Get all files with extension in all folders and subfolders
	let extensions = ['*.jpg', '*.png', '*.tiff', '*.webp'];
	//let files = [];
	let pat = util.packMultiGlobF(model.folders) + "/**/" + util.packMultiGlobE(extensions);
	//console.log(pat);
	let g = new Glob(pat, globComplete);
	//console.log(g);
}
function globComplete (err, matches) {
	//console.log(matches.length);
	removeFiles(matches);
}
function removeFiles (files) {
	// ensure the filters are set
	//model.searchfilter = model.searchfilter ? model.searchfilter : [];
	//console.log(files);
	let searched = [];
	// iterate through the searchlist and keep only matches
	let searcharray = util.cleanArray(model.searchfilter);
	//console.log(searcharray);
	if (searcharray.length) {
		for (let i=0; i<files.length; i++){
			if(util.containsAny(files[i], searcharray)){
				searched.push(files[i]);
			}
		}
	}
	else {
		searched = files.slice();
	}
	//console.log(searched);
	let unblocked = [];
	// concat the blacklist and block filter arrays
	let removalarray = util.cleanArray(model.blacklist.concat(model.blockfilter));
	//console.log(removalarray);
	for (let i=0; i<searched.length; i++) {
		if (!util.containsAny(searched[i], removalarray)) {
			unblocked.push(searched[i]);
		}
	}
	//console.log(unblocked);
	state.files = unblocked;
	// file count
	document.getElementById("filecount").innerHTML = state.files ? state.files.length : 0;
	//console.log(state.files.length);
	ui.updateStartButton();
}
exports.setFilters = function () {
	// get from UI
	model.searchfilter = document.getElementById("searchfilter").value.split("\n");
	model.blacklist = document.getElementById("blacklist").value.split("\n");
	model.blockfilter = document.getElementById("blockfilter").value.split("\n");
	// replace empties
	model.searchfilter = model.searchfilter ? model.searchfilter : [];
	model.blacklist = model.blacklist ? model.blacklist : [];
	model.blockfilter = model.blockfilter ? model.blockfilter : [];
	data.saveSession();
	doGlob();
	ui.updateUI();
};