define(function(){
	return function(){
		var src = arguments[0];
		
		arguments[0] = null;
		delete arguments[0];
		
		for (var index = 0, length = arguments.length; index < length; index++)
		{
			var item = arguments[index];
		
			if (!item)
			{
				continue;
			}
		
			for (var key in item)
			{
				src[key] = item[key];
			}
		}
		
		return src;
	};
});