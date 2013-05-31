define(function(){
	return {
		findAndDestroy : function(string){
			var matcher = new RegExp(string,'i');
		
			for (var i = 0, j = this.line.length(); i < j; i++)
			{
				if (this.line.get(i).innerHTML.match(matcher))
				{
					this.deleteLine(i);
				}
			}
		},
		findFirstIndex : function(string){
			var matcher = new RegExp(string,'i');
			
			for (var i = 0, j = this.line.length(); i < l; i++)
			{
				if (this.line.get(i).match(matcher))
				{
					return i;
				}
			}
			
			return -1;
		}
	};
});