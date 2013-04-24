/**
 *	Name: requireX.js
 *	Author: swe
 *	Version: 0.0.1.3
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
 *
 *		onLoaded (@string,@callback) return (void)
 *			How to:
 *				onLoaded('jquery.min',function(){
 *					console.log('loaded');
 *				});
 *
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
		ONLOADED = 'onLoaded',
		MODULE = 'module',
		MODULES = 'modules',
		DIRECTION = 'direction',
		ONLOAD = 'onLoad',
		ONPROGRESS = 'onProgress';
	
	/**
	 *	STATIC
	 */
	var LOADED = {},LOADING = {},LOADEDEXEC = {},
		DOC = document,
		HEAD = null,
		/**
		 *	On loaded event
		 */
		onloaded = function(f){
			var ex = LOADEDEXEC[f];
			
			if (ex)
			{
				var func;
			
				while (func = ex.shift())
					func(f);
					
				LOADEDEXEC[f] = null;
			}
		},
		/**
		 *	Include file
		 */
		include = function(file,callback){
			if (!HEAD) HEAD = DOC.getElementsByTagName('head');
		
			var script = document.createElement("script");
				
			script.async = false;
			script.src = file;

			script.onload = script.onreadystatechange = function( _, failure ) {
				if ( failure || !script.readyState || /loaded|complete/i.test( script.readyState ) ) 
				{
					script.onload = script.onreadystatechange = null;
					if ( script.parentNode ) script.parentNode.removeChild( script );
					script = null;

					if (callback)
						callback(!failure);
				}
			}
			
			script.onerror = function(_){
				script.onload(_,true);
			};
			
			if (HEAD && HEAD[0])
				HEAD[0].appendChild(script);
		},
		/**
		 *	Filter extensions
		 */
		filter = function(fn,dn){
			//Request Filter
			var r;
			fn = fn.replace(/\?([^?]*)$/,function(_,m){r="&"+m; return '';});
			
			//File Filter
			if (! /.js$/i.test(fn)) fn+='.js';
			
			return {
				request : r,
				file : fn,
				direction : dn
			};
		},
		/**
		 *	Convert datas
		 */
		convert = function(f,d){
			var fn,dn;
		
			if (d)
			{
				fn = f;
				dn = d;
			}
			else
			{
				try {
					fn = f.match(/([^\/]+)$/)[1];
					dn = f.match(/(.*?)(?:[^\/]+)$/)[1];
				} catch(e) {
					fn = f;
					dn = '/';
				}
			}
			
			return filter(fn,dn);
		},
		/**
		 *	Add file to queue
		 */
		add = function(_,f,b){
			var c = convert(f[MODULE] || f, f[DIRECTION] || b || null);
			
			if (LOADING[c.file] = (!LOADED[c.file] && !LOADING[c.file]))
				_.push(c);
		},
		/**
		 *	Process data
		 */
		process = function(f,b){
			if (! /^(string|object)$/.test(typeof f)) return;
		
			var _ = [];
		
			if (f instanceof Array)
				for(var i = 0, l = f.length; i<l; add(_,f[i++],b));
			else
				add(_,f,b);
			
			return _;
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
			stack = process(files,base),
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
					include(d.direction+d.file+'?_='+(new Date().getTime()) + (d.request || ''),function(success){
						LOADING[d.file] = false;
						
						if (LOADED[d.file] = success)
							onloaded(d.file);
						
						if (onprogress) onprogress(d.file,d.direction,success);
						queue();
					});
				}	
			};
			
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
	window[ISLOADING] = function(f){
		return !!LOADING[filter(f).file];
	};
	window[ISLOADED] = function(f){
		return !!LOADED[filter(f).file];
	};
	window[ONLOADED] = function(f,callback){
		var fn = filter(f).file;
		
		if (!!LOADED[fn]) return callback(fn);
		if (!LOADEDEXEC[fn]) LOADEDEXEC[fn] = [];
			
		LOADEDEXEC[fn].push(callback);
	};
}).call(this);
