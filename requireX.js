/**
 *	@name: RequireX
 *	@version: 0.1.0.0
 *	@author: swe
 *
 *	Todo:
 *	=========================
 *
 *	- clean code up
 *	- add some more functions
 *
 *
 *	What does this script do?
 *	=========================
 *
 *	This module load JavaScript, Stylesheets and Images. Perfect for writing modular JavaScript.
 *
 */
(function(global){
	/**
	 *	Variables
	 */
	var //Global function names
		funcRequire 	= 'require',
		funcIsLoaded 	= 'isLoaded',
		funcIsLoading	= 'isPending',
		funcWaitFor		= 'waitForFiles',
		
		//Class author & version
		author			= 'swe',
		version 		= '0.1.0.0',
		
		//Short globals
		doc 			= document,
		stylesheets		= doc.styleSheets,
		rx 				= RegExp,
		delay			= setTimeout,
		intv			= setInterval,
		clIntv			= clearInterval,
		
		//Timeout trys
		stylesheetTrys	= 1000,
		waitForTrys		= 1000,
		
		//Regular Expression Pattern
		patternUrl 		= /^(https?:\/\/)?(?:(www)\.)?([^?]+)(.*)$/i,
		patternPath 	= /^([^\/]+(?=\/))?(.*\/)?(.+?)(?:\.([^\.]+))?$/,
		patternExec 	= ['!([#\\-])([^;]+?);','g'],
		
		//Require arguments
		requireArgs 	= ['files','callback'],
		requireArgsX 	= ['settings','files','callback'],
		
		//Internal variables
		registry 		= {},
		extensionTypes	= {},
		browser			= (function(){
			var obj = {},
				agent = navigator.userAgent,
				app = agent.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i), ver;

			if (app || (ver = agent.match(/version\/([\.\d]+)/i)))
			{
				obj[app[1]] = true;
                obj.version = ver ? ver[1] : app[2];
				
				return obj;
			}

			obj[navigator.appName] = true;
			obj.version = navigator.appVersion;
			
			return obj;
		})(),
		appendTo 		= (function(){
			var _ = doc.getElementsByTagName('head');
			
			return _.length ? _[0] : null;
		})();
			
	extensionTypes.js = 'script';
	extensionTypes.css = 'stylesheet';
	extensionTypes.jpg = extensionTypes.jpeg = extensionTypes.gif = extensionTypes.png = 'image';
		
	/**
	 *	Static Functions
	 */
	//Unite key array with value array to get an object
	function unite(keys,values,get) {
		var object = {};
		
		!!get || (get = function(i){return i;});
		
		for (var index = keys.length; index--;)
		{
			if (!keys[index])
			{
				continue;
			}
			
			object[keys[index]] = values[get(index)];
		}
		
		return object;
	}
	
	//Extend multiple objects
	function extend() {
		var last = arguments.length - 1,
			nil = true;
			
		if (getType(arguments[last]) == 'boolean')
		{
			nil = arguments[last];
			delete arguments[last];
		}
	
		for (var src = arguments[0], index = 1, add; add = arguments[index]; index++) {
			if (getType(add) != 'object')
			{
				continue;
			}
		
			for (var prop in add) {
				if (nil || (add[prop] != null && add[prop].length))
				{
					src[prop] = add[prop];
				}
			}
		}

		return src;
	}
	
	//Get the type of a variable
	function getType(object) {
		var type = typeof object,
			func = arguments.callee[type];
		
		return func ? func(object) : type;
	}
	
	extend(getType,{
		object : (function(parents){
			var length = parents.length;
				
			return function(object){
				for (var index = 0, type; type = parents[index]; index++)
				{
					if (object instanceof global[type])
					{
						return type.toLowerCase();
					}
				}
				
				return 'object';
			};
		})(['Array','Number','Date','RegExp'])
	});
	
	/**
	 *	URL Internal
	 *
	 *	Create an object with all important informations about an url.
	 *
	 */
	function url(url){			
		extend(this,!!patternUrl.exec(url) && (function(){
			var e = unite(['protocol','prefix',null,'uri'],rx,urlrx);
		
			return extend(e,!!patternPath.exec(rx.$3) && (function(){
				return extend((e.protocol || e.prefix) ? unite(['host','dir'],rx,urlrx) : {
					path 	: (rx.$1 || '') + (rx.$2 || '')
				}, unite([null,null,'file','ext'],rx,urlrx),false);
			})(),false);
		})(),{full : url},false);
		
		this.fullext = this.ext ? this.types[this.ext.toLowerCase()] : 'script';
	}
	
	function urlrx(i){
		return '$'+(i+1);
	};
	
	extend(url.prototype,{types : extensionTypes});
	
	/**
	 *	Exec Internal
	 *
	 *	This is handling extra commands for loaded files.
	 *
	 */
	function exec(string){
		var scan = RegExp.apply(new RegExp,patternExec), 
			cmds = {},
			cmd;
			
		while (cmd = scan.exec(string))
		{
			cmd = unite(['operator','line'],RegExp,execrx);
			
			(cmds[cmd.operator] || (cmds[cmd.operator] = [])).push(cmd.line);
		}
		
		extend(this,{
			cleared : string.replace(scan,''),
			collection : cmds
		});
	}
	
	function execrx(i){
		return '$'+(i+1);
	};
	
	extend(exec.prototype,{
		eachCollection : function(collection,callback){
			if (collection) 
			{
				var index = collection.length,
					result = {},
					item, all, object, next;
				
				while (item = collection[--index])
				{
					all = item.split('.');
					object = global[all.shift()];
					
					if (!object) break;
					
					while (next = all.shift())
					{
						if (!(object = object[next])) break;
					}
					
					extend(result,callback.call(this,item,object));
				}
				
				return result;
			}
			
			return null;
		},
		getModuleVariables : function(){
			return this.eachCollection(this.collection['#'],function(item,object){
				var result = {};
				
				result[item] = object;
				
				return result;
			});
		},
		doAutoExecution : function(){
			return this.eachCollection(this.collection['-'],function(item,object){
				var result = {};
				
				result[item] = getType(object) == 'function' ? object.call(null) : null;
				
				return result;
			});
		}
	});
	
	/**
	 *	Registry Internal
	 *
	 *	The core of the whole class here everything get registered.
	 *
	 */
	extend(registry,{
		//Registry variables
		main			: null,
		cache			: {},
		pending 		: {},
		files 			: [],
		//Load function
		load 			: function(ctx){
			var dfd = new promise(),
				args = arguments;
			
			delay(function(){
				if (!args.callee[ctx.path.fullext])
				{
					ctx.failure = true;
					return dfd.ready(ctx);
				}

				args.callee[ctx.path.fullext](ctx,function(failure){
					if (!(ctx.failure = failure))
					{					
						ctx.variables = ctx.cmds.getModuleVariables();
						ctx.autoexecution = ctx.cmds.doAutoExecution();
					}
					
					dfd.ready(ctx);
				});
			},0);
			
			return dfd;
		},
		//Pending functions
		setPending 		: function(path,dfd){
			!this.pending[path.fullext] && (this.pending[path.fullext] = {});
			this.pending[path.fullext][path.file] = dfd;
		},
		isPending 		: function(path){
			return !!this.pending[path.fullext] && !!this.pending[path.fullext][path.file];
		},
		getPending 		: function(path){
			return this.isPending(path) && this.pending[path.fullext][path.file];
		},
		clearPending 	: function(path){
			if (this.isPending(path))
			{
				this.setPending(path,null);
				delete this.pending[path.fullext][path.file];
			}
		},
		//Cache functions
		has				: function(path){
			return !!this.cache[path.fullext] && !!this.cache[path.fullext][path.file];
		},
		get				: function(path){
			return this.has(path) && this.cache[path.fullext][path.file];
		},
		set				: function(path,ctx){
			this.isPending(path) && !ctx.failure && this.clearPending(path);
			!this.cache[path.fullext] && (this.cache[path.fullext] = {});
			this.cache[path.fullext][path.file] = ctx;
		}
	});
	
	//Different loader
	extend(registry.load,{
		//Javascript loader
		script : function(ctx,ready){
			var script = document.createElement("script"),
				onload = function( _, failure ) {
					if (!script) return;
					
					var state = script.readyState;
				
					if (failure || !state || /loaded|complete/i.test( state ) ) 
					{					
						script.onerror = script.onload = script.onreadystatechange = null;
						!!script.parentNode && script.parentNode.removeChild( script );
						script = null;
						
						ready(!!failure || !!(browser.MSIE && /loaded/.test( state )));
					}
				},
				onerror = function(_){
					onload(_,true);
				};
			
			extend(script,{
				type : 'text/javascript',
				charset : 'utf-8',
				async : true,
				onload : onload,
				onreadystatechange : onload,
				onerror : onerror,
				src : ctx.path.full
			},ctx.settings,false);
			
			appendTo.appendChild(script);
		},
		//Cascading Style Sheet loader
		stylesheet : function(ctx,ready){
			var style = document.createElement('link'),
				onload = function( _, failure){
					if (!style) return;

					var state = style.readyState;

					if (failure || !state || /loaded|complete/i.test( state ) ) 
					{
						clIntv(interval);
						style = style.onload = style.onreadystatechange = null;

						ready(!!failure || !!(browser.MSIE && /loaded/.test( state )));
					}
				},
				onerror = function(_){
					onload(_,true);
				},
				trys = 0,
				interval = intv(function(){
					if (trys > stylesheetTrys) return onerror();
					
					try 
					{
						!!style.sheet.cssRules && onload();
					}
					catch(e){trys++;}
				},10);
			
			extend(style,{
				type : 'text/css',
				rel : 'stylesheet',
				charset : 'utf-8',
				onload : onload,
				onreadystatechange : onload,
				onerror : onerror,
				href : ctx.path.full
			},ctx.settings,false);
			
			appendTo.appendChild(style);
		},
		//Image loader
		image : function(ctx,ready){
			var image = new Image(),
				onload = function( _, failure){
					if (!image) return;
				
					var state = image.readyState;
					if (failure || !state || /loaded|complete/i.test( state ) ) 
					{					
						image.onload = image.onerror = image.onabort = null;
						delete image;
						image = null;

						ready(!!failure || !!(browser.MSIE && /loaded/.test( state )));
					}
				},
				onerror = function(_){
					onload(_,true);
				};
				
			extend(image,{
				onload : onload,
				onreadystatechange : onload,
				onerror : onerror,
				onabort : onerror,
				src : ctx.path.full
			},ctx.settings,false);
		}
	});
	
	/**
	 *	Promise Internal
	 */
	//Promise class
	function promise(){
		var self = this;
	
		extend(this,{
			created : new Date().getTime() /* Current timestamp */,
			stack : [],
			ready : function(){			
				self.complete.apply(self,arguments);
			}
		});
	}
	
	//Promise prototypes
	extend(promise.prototype,{
		then : function(execute){
			this.stack.push(execute);
			
			return this;
		},
		next : function(){
			var dfd = new promise(),
				args = arguments;
		
			this.then(function(){
				require.apply(null,args).then(function(){
					dfd.ready.apply(dfd,arguments);
				});
			});
			
			return dfd;
		},
		complete : function(){
			while(this.stack[0])
			{
				this.stack.shift().apply(null,arguments);
			}
		}
	});
	
	/**
	 *	Defer Internal
	 */
	function defer(){
		var dfd 	= new promise(),
			args 	= arguments,
			length 	= args.length,
			stack 	= [],
			push 	= function(index,result){
				stack[index] = result;
				var j = stack.length;
				if (j == length)
				{
					while (j--) if (stack[j] == null) return;
					
					dfd.ready.apply(dfd,stack);
				}
			};
		
		for (var index = 0; index < length; (function(i){
			args[i].then(function(){
				var length = arguments.length;
			
				push(i,!!length && (length > 1 ? arguments : arguments[0]));
			});
		})(index++));
			
		return dfd;
	}
	
	/**
	 *	Context Internal
	 *
	 *	This is the executing part of the script. It loads for example every file.
	 *
	 */
	function context(options){
		var dfd	= new promise(),
			cmds = new exec(options.file),
			path = new url(cmds.cleared),
			self = this;
			
		registry.setPending(path,dfd);
		
		extend(this,{
			run : function(){
				var ref = registry.get(path);
			
				!ref || ref.failure ? registry.load({
					cmds : cmds,
					path : path,
					settings : options.settings
				},false).then(function(ctx){
					registry.set(path,ctx);
					dfd.ready(ctx);
				}) : delay(function(){
					dfd.ready(ref);
				},0);
			}
		});

		return {
			self : this,
			promise : dfd
		};
	}
	
	/**
	 *	WaitFor Internal
	 *
	 *	Wait for files.
	 *
	 */
	function waitForFiles(){
		var dfd = new promise(),
			files = getType(arguments[0]) == 'array' ? arguments[0] : arguments,
			pending = [],
			pathes = [],
			getArgs = function(){
				var sleeping = [],
					args = [];
			
				for (var index = 0, file; file = files[index]; index++)
				{
					registry.isPending(file) ? sleeping.push(file) : (args[index] = registry.get(pathes[index]));
				};
				
				sleeping.length ? (waitForFiles.apply(null,sleeping)).then(function(){
					for (var index = 0, length = args.length; index < length; index++)
					{
						args[index] == null && (args[index] = registry.get(pathes[index]));
					}

					dfd.ready.apply(dfd,args);
				}) : dfd.ready.apply(dfd,args);
			};
			
		for (var index = 0, file; file = files[index++];)
		{
			var path = new url(file);
		
			if (registry.isPending(path))
			{
				pending.push(registry.getPending(path));
			}
			else if (!registry.has(path))
			{
				var retrydfd = new promise();
			
				(function(p,retry){
					var trys = 0,
						interval = intv(function(){
							if ((trys++) > waitForTrys)
							{
								clIntv(interval);
							}
							else if (registry.isPending(p))
							{
								registry.getPending(p).then(function(){
									retry.ready();
								});
								clIntv(interval);
							}
							else if (registry.has(p))
							{
								retry.ready();
								clIntv(interval);
							}
						},10);
				})(path,retrydfd);
				
				pending.push(retrydfd);
			}
			
			pathes.push(path);
		}
		
		pending.length 
			? (defer.apply(null,pending)).then(getArgs) 
			: delay(getArgs,0);
			
		return dfd;
	}
	
	/**
	 *	Require Internal
	 *
	 *	Load files.
	 *
	 */
	function require(){
		var options 	= unite(getType(arguments[0]) == 'object' ? requireArgsX : requireArgs,arguments),
			stack 		= [],
			pending 	= [],
			queue 		= function(i){
				if (!pending[i] || !stack[i]) return false;
			
				pending[i].then(function(){
					queue(++i);
				});
				stack[i].run();
				
				return true;
			},
			main;
			
		for (var index = 0, file; file = options.files[index++];)
		{
			var ctx = new context({
				settings : options.script || {},
				file : file
			});
			
			stack.push(ctx.self);
			pending.push(ctx.promise);
		}
		
		return queue(0) && (main = defer.apply(null,pending)).then(function(){
			!!registry.main && main.created == registry.main.created && (registry.main = null);
			!!options.callback && options.callback.apply(null,arguments);
		});
	}
	
	/**
	 *	Extend to global
	 */
	extend(global,unite([funcWaitFor,funcRequire,funcIsLoaded,funcIsLoading],[waitForFiles,function(){
		return registry.main = (registry.main ? registry.main.next.apply(registry.main,arguments) : require.apply(null,arguments));
	},function(file){
		var path = new url(file);
	
		return registry.has(path) && !registry.get(path).failure;
	},function(file){	
		return registry.isPending(new url(file));
	}]));
})(this.window || this);