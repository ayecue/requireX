define(function(){
	return {
		filter : function(string){
			for (var i = this.data.length, result = []; i--; this.data[i] == string && result.push(string));
			
			return result;
		}
	};
});