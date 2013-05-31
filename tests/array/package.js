define({
	refresh : true
},[
	'../general/packager.js',
	'../general/toArray.js',
	'filter.js',
	'indexOf.js',
	'change.js',
	'info.js'
],function(packager,toArray){
	var packages = toArray(arguments).slice(2);

	return function(){
		this.data = [];
	
		packager(this,packages);
	};
});