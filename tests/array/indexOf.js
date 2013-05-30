define(function(){
	return function(string){
		for (var i = 0, j = this.data.length, result = []; i < j; i++)
		{
			if (this.data[i] == string)
			{
				return i;
			}
		}
		
		return -1;
	}
});