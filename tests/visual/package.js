define({
	refresh : true
},[
	'../general/packager.js',
	'../general/toArray.js',
	'../general/jquery.js',
	'creation.js'
],function(packager,toArray,$){
	var packages = toArray(arguments).slice(3),
		instance = function(){
			this.jQuery = $;
			this.windows = {refs : []};
		};
		
	packager(instance.prototype,packages);

	return instance;
});