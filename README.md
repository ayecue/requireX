requireX
========

Loading external javascript dynamicly.

Example:
========

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


API:
========

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
