define({
	refresh : true
},[
	'../general/packager.js',
	'../general/toArray.js',
	'../array/package.js',
	'output.js',
	'filter.js'
],function(packager,toArray,myArray){
	var packages = toArray(arguments).slice(3),
		doc = document;
	
	return function(){
		this.pad = doc.createElement('div');
		this.line = new myArray();
	
		packager(this,packages);
		this.pad.className = 'writePad';
	};
});