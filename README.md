# requireX
* Author: swe
* Version: 0.1.0.0
* Language: JavaScript

## Short Description:
This module load JavaScript, Stylesheets and Images. Perfect for writing modular JavaScript.


##Example:

	require([
		'!#$;http://ajax.googleapis.comw/ajax/libs/jquery/1.9.1/jquery.min.js',
		'!#$;!#$.fn;http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js',
		'http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js',
		'https://developers.google.com/_static/css/screen.css',
		'style.css',
		'http://www.w3schools.com/images/w3schoolslogoNEW310113.gif'
	]).then(function(a,b,c,d,e,f){
		console.log('Loaded: '+!a.failure+' ('+a.path.file+') from '+a.path.host);
		console.log('Loaded: '+!b.failure+' ('+b.path.file+') from '+b.path.host);
		console.log('Loaded: '+!c.failure+' ('+c.path.file+') from '+c.path.host);
		console.log('Loaded: '+!d.failure+' ('+d.path.file+') from '+d.path.host);
		console.log('Loaded: '+!e.failure+' ('+e.path.file+') from '+e.path.host);
		console.log('Loaded: '+!f.failure+' ('+f.path.file+') from '+f.path.host);
		
		//do something with jQuery
		console.log(b.variables.$('*'));
	}).next([
		'http://ajax.googleapis.com/ajax/libs/mootools/1.4.5/mootools-yui-compressed.js'
	]).then(function(a){
		console.log('Loaded: '+!a.failure+' ('+a.path.file+') from '+a.path.host);
	});

	
##API:

	//Loading all files.
	require(
		{configuration} /*optional*/, 
		["file","file"],
		callback /*optional*/
	)
	//Prototypes
	.next(
		{configuration} /*optional*/, 
		["file","file"],
		callback /*optional*/
	)
	.then(
		callback
	)
	
	
	//Check file if it's loaded.
	isLoaded(filename.extension)
	
	
	//Check file if it's pending.
	isPending(filename.extension)
	
	
	//Waiting that specific files get loaded
	waitForFiles(["filename.extension","filename.extension"],callback)
	//Prototypes
	.next(
		{configuration} /*optional*/, 
		["file","file"],
		callback /*optional*/
	)
	.then(
		callback
	)


##old requireX

Loading external javascript dynamicly.


###Example:

	require({
		modules : [
			{module:'jquery.min',direction:'http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/'},
			{module:'jquery-ui.min',direction:'http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/'},
			{module:'mootools-yui-compressed',direction:'http://ajax.googleapis.com/ajax/libs/mootools/1.4.5/'}
		],
		direction : 'http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/',
		onLoad : function(){
			console.log(isLoaded('jquery.min.js'));
		}
	});


###API:

	require (@object) return (void)
		How to:
			1.) 
				require({
					modules: filename,
					direction: pathname,
					onLoad: function
				});
			2.)
				require({
					modules: [filename,filename],
					direction: pathname,
					onLoad: function
				});
			3.)
				require({
					modules: [{module:filename,direction:pathname},{module:filename,direction:pathname}],
					onLoad: function
				});
			4.)
				require({
					modules: [{module:filename,direction:pathname},filename],
					direction: pathname,
					onLoad: function
				});
			5.)
				//Modules have to be in the same directory as requireX
				require({
					modules: [{module:filename},{module:filename}],
					onLoad: function
				});

	isLoaded (@string) return (boolean)
		How to:
			isLoaded(filename); 

	isLoading (@string) return (boolean)
		How to:
			isLoading(filename);
			
	onLoaded (@string,@callback) return (void)
		How to:
			onLoaded('jquery.min',function(){
				console.log('loaded');
			});
