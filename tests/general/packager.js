define([
	'extend.js'
],function(extend){
	return function(obj,args){
		for (var i = 0, l = args.length; i < l; i++)
		{
			!!args[i] && extend(obj,args[i]);
		}
		
		return obj;
	};
});