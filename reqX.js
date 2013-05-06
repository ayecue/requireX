/**
 *	Name: reqX.js
 *	Author: swe
 *	Version: 0.1.0.0
 *
 *
 *	Description:
 *		Loading external javascript dynamicly.
 *
 */
(function(){
	/**
	 *	KEYWORDS
	 */
	var NAME = 'require',
		ISLOADED = 'isLoaded',
		ISLOADING = 'isLoading',
		FILES = 'files',
		ONLOAD = 'onLoad',
		ONPROGRESS = 'onProgress';
		
	/**
	 *	VARS
	 */
	var REGESTRY = {files:[]},
		LOADING = false,
		DOC = document,
		HEAD = (function(){
			var _ = DOC.getElementsByTagName('head');
			
			return _.length ? _[0] : null;
		})();
		
	/**
	 *	FUNCTIONS
	 */
	var load = function(src,onload){
			var script = document.createElement("script");
			
			script.async = false;
			script.src = src;

			script.onload = script.onreadystatechange = function( _, failure ) {
				if ( failure || !script.readyState || /loaded|complete/i.test( script.readyState ) ) 
				{
					script.onload = script.onreadystatechange = null;
					if ( script.parentNode ) script.parentNode.removeChild( script );
					script = null;

					onload.call(_,!!failure);
				}
			}
			
			script.onerror = function(_){
				script.onload(_,true);
			};
			
			HEAD.appendChild(script);
		},
		queue = function(){
			var file = REGESTRY.files.shift();
			
			if (LOADING = !!file)
			{
				var obj = REGESTRY[file],
					url = obj.url.shift().full;
				
				load(url,function(failure){
					if (failure)
					{
						obj.error = true;
						obj.loading = false;
					
						if (obj.url.length)
						{
							REGESTRY.files.unshift(file);
						}
					}
					else
					{
						obj.error = obj.loading = false;
						obj.loaded = true;
					}
					
					for (var index = 0, length = obj.refs.length; index < length; obj.refs[index++].ready(obj));
					
					queue();
				});
			}
		},
		encodeURL = function(url){
			var urlSplit = url.match(/^(https?:\/\/)?(www\.)?([^\/?]+)?([^?]+)(.*)$/i) || [];
			
			return {
				full : url,
				protocol : urlSplit[1],
				prefix : urlSplit[2],
				host : urlSplit[3],
				directory : urlSplit[4],
				uri : urlSplit[5]
			};
		},
		encodeFile = function(directory){
			var filePattern = directory.match(/[a-z_\-\.]+\.js$/i) || [];
			
			return filePattern[0];
		};
		
	/**
	 *	CLASSES
	 */
	var helper = function(file,loader){
			var encodedUrl = encodeURL(file),
				encodedFile = encodeFile(encodedUrl.directory),
				handler = REGESTRY[encodedFile];
			
			if (!handler)
			{
				handler = {
					loading : true,
					loaded : false,
					error : false,
					url : [encodedUrl],
					file : encodedFile,
					refs : [loader]
				};
				
				REGESTRY.files.push(encodedFile);
			}
			else if (handler.error || handler.loading)
			{
				handler.error = false;
				handler.loading = true;
				handler.url.push(encodedUrl);
				handler.refs.push(loader);
			}
			
			return REGESTRY[encodedFile] = handler;
		},
		loader = function(files,onProgress,onReady){
			if (!files) return;
			
			var helperStack = [],
				handler = {
					helper : helperStack,
					ready : function(last){
						var done = true,
							length = this.helper.length;
						
						while (length--)
						{
							if (this.helper[length].loading)
							{
								done = false;
								break;
							}
						}
						
						if (done && !!onReady)
						{
							onReady.call(this,last);
						}
						else if (!!onProgress)
						{
							onProgress.call(this,last);
						}
						
						return done;
					}
				};
			
			for (var index = 0, length = files.length; index < length; index++)
			{
				var file = files[index];
					
				helperStack.push(helper(file,handler));
			}
			
			if (!handler.ready())
			{
				if (!LOADING)
				{
					queue();
				}
			
				return handler;
			}
			
			return handler = null;
		};
	
	/**
	 * API
	 */
	window[NAME] = loader;
	window[ISLOADING] = function(f){
		return !!REGESTRY[f] && REGESTRY[f].loading;
	};
	window[ISLOADED] = function(f){
		return !!REGESTRY[f] && REGESTRY[f].loaded;
	};
}).call(this);