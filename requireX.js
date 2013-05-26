/**
 *	@name: RequireX
 *	@version: 0.5.0.0
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
	'use strict';

	var /**
		 *	Vars
		 */
		//Informations
		funcs = ['require','define','isLoaded','isPending','waitForFiles'],
		author = 'swe',
		version = '1.0.0.0',
		
		//Shortcut
		doc = document,
		styles = doc.styleSheets,
		regexp = RegExp,
		delay = setTimeout,
		intv = setInterval,
		clIntv = clearInterval,
		slice = [].slice,
		
		//Timeouts
		styleTimeout = 1000,
		waitForTimeout = 1000,
		
		//Patterns
		patternUrl 		= /^(https?:\/\/)?(?:(www)\.)?([^?]+)(.*)$/i,
		patternPath 	= /^([^\/]+(?=\/))?(.*\/)?(.+?)(?:\.([^\.]+))?$/,
		patternExec 	= ['!([#\\-])([^;]+?);','g'],
		
		/**
		 *	Static Functions
		 */
		forEach = function(o,c,r){
			var t, d = {result:r,skip:false};
		
			if (typeof o == 'function')
			{
				while ((t = o.call(d)) && !d.skip)
				{
					c.call(d,t);
				}
			}
			else if (t = o.length)
			{
				for (var k = 0; k < t && !d.skip; c.call(d,k,o[k++]));        
			}
			else
			{
				for (var k in o)
				{
					c.call(d,k, o[k]);
				
					if (d.skip)
					{
						break;
					}
				}
			}
			
			return d.result;
		},
		toArray = slice ? function(obj){
			return slice.call(obj);
		} : function(obj){
			return forEach(obj,function(index,item){
				this.result.unshift(item);
			},[]);
		},
		quickDelay = function(func){
			return delay(func,0);
		},
		unite = function(keys,values,get) {
			!!get || (get = function(i){return i;});
			
			return forEach(keys,function(index,item){
				!!item && (this.result[item] = values[get(index)]);
			},{});
		},
		extend = function() {
			var args = toArray(arguments),
				last = args.length - 1,
				nil = true,
				src = args.shift() || {};
		
			getType(args[last]) == 'boolean' && (nil = args.pop());
			
			return forEach(args,function(index,item){
				getType(item) == 'object' && (this.result = forEach(item,function(prop,child){
					!!(nil || (child != null && child.length)) && (this.result[prop] = child);
				},this.result));
			},src);
		},
		getFirstOfType = function getFirstOfType(obj,type) {
			return forEach(obj,function(index,item){
				if (getType(item) == type)
				{
					this.result = index;
					this.skip = true;
				}
			});
		},
		getType = function(obj){
			return !!Core && !!Core.typeifier ? Core.typeifier.compile(obj) : typeof obj;
		},
		extTypes = (new (function(){
			var self = this;
			
			self.add = function(ext,type){
				getType(ext) == 'string' ? (self[ext] = type) : forEach(ext,function(_,item){
					self[item] = type;
				});
				
				return self;
			};
		}))
		.add('js','script')
		.add('css','stylesheet')
		.add(['jpg','jpeg','gif','png'],'image'),
	
		/**
		 *	Class Internal
		 */
		Class = function(){
			return forEach(arguments,function(_,module){
				var create = module.create;

				if (create)
				{
					var old = this.result.prototype.create;
					
					this.result.prototype.create = old ? function(){
						return forEach([create.apply(this,arguments),old.apply(this,arguments)],function(_,item){
							item && (item instanceof Array ? this.result.concat(item) : this.result.push(item));
						},[]);
					} : function(){
						return create.apply(this,arguments);
					};
					
					delete module.create;
				}
				
				if (module.static)
				{
					extend(this.result,module.static);
					delete module.static;
				}
				
				extend(this.result.prototype,module);
			},function(){
				return !!this.create ? this.create.apply(this,arguments) : this;
			});
		},
	
		/**
		 *	Type Internal
		 */
		Type = new Class({
			create : function(handler){
				this.handler = handler;
			},
			compile : function(obj){
				var type = typeof obj,
					func = this.handler[type];
					
				return func ? func(obj) : type;
			}
		}),
	
		/**
		 *	URL Internal
		 *
		 *	Create an object with all important informations about an url.
		 *
		 */
		Url = new Class({
			static : {
				filter : function(i){
					return '$'+(i+1);
				},
				types : extTypes
			},
			create : function(url){
				extend(this,{
					host : 'local',
					ext : 'js'
				},!!patternUrl.exec(url) && (function(){
					var e = unite(['protocol','prefix',null,'uri'],regexp,Url.filter);
				
					return extend(e,!!patternPath.exec(regexp.$3) && (function(){
						return extend((e.protocol || e.prefix) ? unite(['host','dir'],regexp,Url.filter) : {
							path 	: (regexp.$1 || '') + (regexp.$2 || '')
						}, unite([null,null,'file','ext'],regexp,Url.filter),false);
					})(),false);
				})(),{full : url},false);
				
				this.fullext = this.ext ? Url.types[this.ext.toLowerCase()] : 'script';
			}
		}),
	
		/**
		 *	Exec Internal
		 *
		 *	This is handling extra commands for loaded files.
		 *
		 */
		Exec = new Class({
			static : {
				filter : function(i){
					return '$'+(i+1);
				}
			},
			create : function(string){
				var scan = RegExp.apply(new RegExp,patternExec);
			
				extend(this,{
					cleared : string.replace(scan,''),
					collection : forEach(function(){
						return scan.exec(string);
					},function(){
						var cmd = unite(['operator','line'],RegExp,Exec.filter);
						
						(this.result[cmd.operator] || (this.result[cmd.operator] = [])).push(cmd.line);
					},{})
				});
			},
			eachCollection : function(collection,callback){
				if (collection) 
				{
					return forEach(collection,function(index,item){
						var all = item.split('.'),
							obj = global[all.shift()];
							
						!!obj && extend(this.result,forEach(function(){
							return all.shift();
						},function(next){
							!(this.result = this.result[next]) && (this.skip = true);
						},obj));
					},{});
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
		}),
	
	
		/**
		 *	Instance Internal
		 *
		 */
		Instance = new Class({
			static : {
				native : {
					set : function(key,value){
						this[key] = value;
					},
					is : function(key){
						return !!this[key];
					},
					get : function(key){
						return this.instance.is(key) && this[key];
					},
					clear : function(key){
						if (this.instance.is(key))
						{
							this.instance.set(key,null);
							delete this[key];
						}
					}
				}
			},
			create : function(props){
				var self = this;
				
				self.container = {instance:self};
				props = extend({},Instance.native,props);
				
				forEach(props,function(name,prop){
					if (!self[name])
					{
						getType(prop) == 'function' ? (self[name] = function(){
							return prop.apply(self.container,arguments);
						}) : (self[name] = prop);
					}
				});
			},
			toRoot : function(){
				return extend(this,{
					is : function(key){
						return !!this.container[key.fullext] && !!this.container[key.fullext].is(key.file);
					},
					set : function(key,value){
						!this.container[key.fullext] && (this.container[key.fullext] = new Instance());
						this.container[key.fullext].set(key.file,value);
					},
					get : function(key){
						return this.is(key) && this.container[key.fullext].get(key.file);
					},
					clear : function(key){
						if (this.is(key))
						{
							this.set(key,null);
							delete this.container[key.fullext];
						}
					}
				});
			}
		}),
	
		/**
		 *	State Internal
		 */
		State = new Class({
			create : function(type){
				extend(this,{
					type : type,
					stack : []
				});
			},
			add : function(func){
				this.stack.push(func);
			},
			is : function(t){
				return this.type == null || t === this.type;
			},
			run : function(t,args){
				this.is(t) && forEach(function(){
					return this.result.stack[0];
				},function(){
					this.result.stack.shift().apply(null,args);
				},this);
			}
		}),
	
		/**
		 *	Promise Internal
		 */
		Promise = new Class({
			static : {
				multi : function(){
					var dfd 	= new Promise(),
						args 	= arguments,
						length 	= args.length,
						stack 	= [],
						push 	= function(index,result){
							stack[index] = result;

							(stack.length == length && forEach(stack,function(_,item){
								if (item == null)
								{
									this.result = false;
									this.skip = true;
								}
							},true)) && dfd.complete(true,stack);
						};
					
					forEach(args,function(index,item){
						item instanceof Promise && item.always(function(){
							var length = arguments.length;
						
							push(index,!!length && (length > 1 ? arguments : arguments[0]));
						});
					});
						
					return dfd;
				}
			},
			create : function(){
				var self = this,
					states = [
						new State(true),
						new State(false),
						new State()
					];
				
				extend(self,{
					states : states,
					id : new Date().getTime() * Math.random(),
					then : function(func){
						states[0].add(func);
						
						return self;
					},
					fail : function(func){
						states[1].add(func);
						
						return self;
					},
					always : function(func){
						states[2].add(func);
						
						return self;
					}
				});
			},
			complete : function(state,args){
				forEach(this.states,function(index,item){
					item.run(state,args);
				});
			},
			next : function(){
				var dfd = new Promise(),
					args = arguments;
					
				this.always(function(){
					require.apply(null,args).then(function(){
						dfd.complete(true,arguments);
					}).fail(function(){
						dfd.complete(false,arguments);
					});
				});
					
				return dfd;
			}
		}),
	
		/**
		 *	Core Internal
		 *
		 *	The core of the whole class here everything get registered.
		 *
		 */
		Core = new Class({
			static : {
				argsHandler : new Class({
					static : {
						waitForFiles : function(args){
							return getType(args[0]) == 'array' ? args[0] : args;
						},
						require : function(args){
							return forEach({
								files : 'array',
								settings : 'object',
								callback : 'function',
								process : 'function'
							},function(index,item){
								var first = getFirstOfType(args,item);
								
								first != null && (this.result[index] = args[first]);
							},{});
						}
					}
				}),
				typeifier : new Type({
					object : (function(parents){
						var length = parents.length;
							
						return function(object){
							return forEach(parents,function(index,item){
								if (object instanceof global[item])
								{
									this.result = item.toLowerCase();
									this.skip = true;
								}
							}) || 'object';
						};
					})(['Array','Number','Date','RegExp'])
				}),
				browser : (function(){
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
				appendTo : (function(_){
					return _.length ? _[0] : null;
				})(doc.getElementsByTagName('head')),
				cache : (new Instance()).toRoot(),
				pending : (new Instance()).toRoot(),
				defined	: (new Instance()).toRoot(),
				load : new Class({
					static : {
						//Javascript loader
						script : function(ctx){
							var dfd = new Promise(),
								script = document.createElement("script"),
								onload = function( _, failure ) {
									if (!script) return;
									
									var state = script.readyState;
								
									if (failure || !state || /loaded|complete/i.test( state ) ) 
									{					
										script.onerror = script.onload = script.onreadystatechange = null;
										!!script.parentNode && script.parentNode.removeChild( script );
										script = null;
										dfd.complete(ctx.success = !failure && !(Core.browser.MSIE && /loaded/.test( state )));
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
							
							Core.appendTo.appendChild(script);
							
							return dfd;
						},
						//Cascading Style Sheet loader
						stylesheet : function(ctx){
							var dfd = new Promise(),
								style = document.createElement('link'),
								onload = function( _, failure){
									if (!style) return;

									var state = style.readyState;

									if (failure || !state || /loaded|complete/i.test( state ) ) 
									{
										clIntv(interval);
										style.onload = style.onreadystatechange = null;
										!failure && (failure = !!(Core.browser.MSIE && /loaded/.test( state )));
										!!failure && !!style.parentNode && style.parentNode.removeChild( style );
										style = null;

										dfd.complete(ctx.success = !failure);
									}
								},
								onerror = function(_){
									onload(_,true);
								},
								trys = 0,
								interval = intv(function(){
									if (trys > styleTimeout) return onerror();
									
									try{!!style.sheet.cssRules && onload();}catch(e){trys++;}
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
							
							Core.appendTo.appendChild(style);
							
							return dfd;
						},
						//Image loader
						image : function(ctx){
							var dfd = new Promise(),
								image = new Image(),
								onload = function( _, failure){
									if (!image) return;
								
									var state = image.readyState;
									if (failure || !state || /loaded|complete/i.test( state ) ) 
									{					
										image.onload = image.onerror = image.onabort = null;
										image = null;

										dfd.complete(ctx.success = !failure && !(Core.browser.MSIE && /loaded/.test( state )));
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
							
							return dfd;
						}
					},
					create : function(ctx){
						var dfd = new Promise();
						
						quickDelay(function(){
							if (!Core.load[ctx.path.fullext])
							{
								return dfd.complete(ctx.success = false,[ctx]);
							}

							Core.load[ctx.path.fullext](ctx).then(function(){
								ctx.variables = ctx.exec.getModuleVariables();
								ctx.autoexecution = ctx.exec.doAutoExecution();
							}).always(function(){
								dfd.complete(null,[ctx]);
							});
						});
						
						return dfd;
					}
				})
			}
		}),
	
		/**
		 *	Context Internal
		 *
		 *	This is the executing part of the script. It loads for example every file.
		 *
		 */
		Context = new Class({
			create : function(options){
				var dfd = new Promise(),
					exec = new Exec(options.file),
					path = new Url(exec.cleared);
					
				this.run = function(){
					var ref = Core.cache.get(path);

					!ref || !ref.success ? new Core.load({
						exec : exec,
						path : path,
						settings : options.settings
					}).always(function(ctx){
						Core.pending.clear(path);
						Core.cache.set(path,ctx);
						dfd.complete(ctx.success,[ctx]);
					}) : quickDelay(function(){
						dfd.complete(true,[ref]);
					})
				};
				
				Core.pending.set(path,dfd);
				
				return [this,dfd];
			}
		});
		
	/**
	 *	WaitFor Internal
	 *
	 *	Wait for files.
	 *
	 */
	function waitForFiles(){
		var dfd = new Promise(),
			files = Core.argsHandler.waitForFiles(arguments),
			pending = [],
			pathes = forEach(files,function(_,item){
				var path = new Url(item);
				
				if (Core.pending.is(path))
				{
					pending.push(Core.pending.get(path));
				}
				else if (!Core.cache.is(path))
				{
					var retry = new Promise(),
						trys = 0,
						interval = intv(function(){
							if (++trys > waitForTimeout)
							{
								clIntv(interval);
							}
							else if (Core.pending.is(path))
							{
								Core.pending.get(path).then(function(){
									retry.complete();
								});
								clIntv(interval);
							}
							else if (Core.cache.is(path))
							{
								retry.complete();
								clIntv(interval);
							}
						},10);

					pending.push(retry);
				}

				this.result.push(path);
			},[]),
			getArgs = function(){
				var sleeping = [],
					args = forEach(pathes,function(index,item){
						Core.pending.is(item) ? sleeping.push(item.full) : (this.result[index] = Core.defined.get(item) || Core.cache.get(item));
					},[]);
				
				sleeping.length ? (waitForFiles.apply(null,sleeping)).always(function(){
					dfd.complete(forEach(pathes,function(index,item){
						if (!Core.cache.is(item) || !Core.cache.get(item).success)
						{
							this.result = false;
							this.skip = true;
						}
					},true),forEach(pathes,function(index,item){
						args[index] == null && (args[index] = Core.cache.get(item));
					},args));
				}) : dfd.complete(forEach(pathes,function(index,item){
					if (!Core.cache.is(item) || !Core.cache.get(item).success)
					{
						this.result = false;
						this.skip = true;
					}
				},true),args);
			};
			
		pending.length 
			? Promise.multi.apply(null,pending).always(getArgs) 
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
		var dfd = new Promise(),
			options = Core.argsHandler.require(arguments),
			pending = [],
			stack = forEach(options.files,function(_,item){
				var context = new Context({
					settings : options.settings || {},
					file : item
				});
				
				this.result.push(context.shift());
				pending.push(context.shift());
			},[]),
			master = Promise.multi.apply(null,pending).always(function(){
				dfd.complete(forEach(arguments,function(_,item){
					if (!item.success)
					{
						this.result = false;
						this.skip = true;
					}
				},true),forEach(arguments,function(_,item){
					this.result.push(Core.defined.get(item.path) || item);
				},[]));
			}),
			processing = function(pointer){
				if (!pending[pointer] || !stack[pointer])
				{
					return false;
				}
				
				pending[pointer].always(function(){
					processing(++pointer);
				});
				stack[pointer].run();
				
				return true;
			};
			
		return processing(0) && dfd.always(function(){
			!!Core.master && Core.master.id == dfd.id && (Core.master = null);
			!!options.callback && options.callback.apply(null,arguments);
		});
	}
	
	
	extend(global,unite(funcs,[function(){
		return Core.master = (Core.master ? Core.master.next.apply(Core.master,arguments) : require.apply(null,arguments));
	},function(){
		//TODO
	},function(file){
		return Core.pending.is(new Url(file));
	},function(file){
		var path = new Url(file);
	
		return Core.cache.is(path) && Core.cache.get(path).success;
	},waitForFiles]));
})(this.window || this);