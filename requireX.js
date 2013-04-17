/**
 *	Name: requireX.js
 *	Author: swe
 *	Version: 0.0.0.5
 *
 *
 *	Description:
 *		Loading external javascript dynamicly.
 *
 *	API:
 *		require (@object) return (void)
 *			How to:
 *				1.) 
 *					require({
 *						modules: filename,
 *						direction: pathname,
 *						onLoad: function
 *					});
 *				2.)
 *					require({
 *						modules: [filename,filename],
 *						direction: pathname,
 *						onLoad: function
 *					});
 *				3.)
 *					require({
 *						modules: [{module:filename,direction:pathname},{module:filename,direction:pathname}],
 *						onLoad: function
 *					});
 *				4.)
 *					require({
 *						modules: [{module:filename,direction:pathname},filename],
 *						direction: pathname,
 *						onLoad: function
 *					});
 *				5.)
 *					//Modules have to be in the same directory as requireX
 *					require({
 *						modules: [{module:filename},{module:filename}],
 *						onLoad: function
 *					});
 *
 *
 *		isLoaded (@string) return (boolean)
 *			How to:
 *				isLoaded(filename); 
 *
 *
 *		isLoading (@string) return (boolean)
 *			How to:
 *				isLoading(filename);
 *
 *	Example:
 *			require({
 *				modules : [
 *					{module:'jquery.min',direction:'http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/'},
 *					{module:'jquery-ui.min',direction:'http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/'},
 *					{module:'mootools-yui-compressed',direction:'http://ajax.googleapis.com/ajax/libs/mootools/1.4.5/'}
 *				],
 *				direction : 'http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/',
 *				onLoad : function(){
 *					console.log(isLoaded('jquery.min.js'));
 *				}
 *			});
 *
 *
 */
(function() {
	"use strict";
	
	/**
	 *	KEYWORDS
	 */
	var NAME = 'require',
		ISLOADED = 'isLoaded',
		ISLOADING = 'isLoading',
		MODULE = 'module',
		MODULES = 'modules',
		DIRECTION = 'direction',
		ONLOAD = 'onLoad',
		ONPROGRESS = 'onProgress';
	
	/**
	 *	STATIC
	 */
	var LOADED = {},LOADING = {},
		DOC = document,
		HEAD = null,
		include = function(file,callback){
			if (!HEAD) HEAD = DOC.getElementsByTagName('head');
		
			var script = document.createElement("script");
				
			script.async = false;
			script.src = file;

			script.onload = script.onreadystatechange = function( _, cancel ) {
				if ( cancel || !script.readyState || /loaded|complete/i.test( script.readyState ) ) 
				{
					script.onload = script.onreadystatechange = null;
					if ( script.parentNode ) script.parentNode.removeChild( script );
					script = null;

					if (callback)
						callback(!cancel);
				}
			}
			
			if (HEAD && HEAD[0])
				HEAD[0].appendChild(script);
		},
		convert = function(d){
			var name,direction;
			
			if (d.direction)
			{
				name = d.file;
				direction = d.direction;
			}
			else
			{
				try {
					name = d.file.match(/([^\/?]+)(?:[^\/]*)$/)[1];
					direction = d.file.match(/(.*?)(?:[^\/?]+)(?:[^\/]*)$/)[1];
				} catch(e) {
					name = d.file;
					direction = '/';
				}
			}
			
			return {
				file : name,
				direction : direction
			};
		};
	
	/**
	 *	CONTROLLER
	 */
	var LOADER = function(config,onReady){
		if (!config) return;
	
		var files = config[MODULES] || false,
			base = config[DIRECTION] || false,
			onprogress = config[ONPROGRESS] || false,
			queueing = false,
			stack = [],
			add = function(d){
				var converted = convert(d);
			
				if (!LOADED[converted.file] && !LOADING[converted.file])
				{
					LOADING[converted.file] = true;
					stack.push(converted);
				}
			},
			queue = function(){
				var d = stack.shift();
				
				if (!d)
				{
					if (onReady)
						onReady();
					
					queueing = false;
					
					return;
				} 
				
				if (!LOADED[d.file])
				{
					include(d.direction+d.file+'.js?_='+(new Date().getTime()),function(success){
						LOADING[d.file] = false;
						LOADED[d.file] = success;
						
						if (onprogress) onprogress();
						queue();
					});
				}
			};
			
		if (files instanceof Array)
		{
			for (var index = 0 ,length = files.length; index<length; index++)
				add({
					file : files[index][MODULE] || files[index], 
					direction : files[index][DIRECTION] || base || null
				});
		}
		else if (typeof files == 'object')
		{
			add({
				file : files[MODULE] || files, 
				direction : files[DIRECTION] || base || null
			});
		}
		else if (typeof files == 'string')
		{
			add({
				file : files, 
				direction : base || null
			});
		}
			
		return {
			load : function(){
				if (!queueing)
				{
					queueing = true;
					queue();
				}
			},
			destroy : function(){
				files = base = queueing = stack = add = queue = null;
			}
		};
	};
	
	/**
	 * API
	 */
	window[NAME] = function(config){
		var l = new LOADER(config,function(){
			if (config[ONLOAD])
				config[ONLOAD]();
		
			l.destroy();
			l = null;
		});
		
		l.load();
	};
	window[ISLOADING] = function(file){
		return !!LOADING[file];
	};
	window[ISLOADED] = function(file){
		return !!LOADED[file];
	};
}).call(this);