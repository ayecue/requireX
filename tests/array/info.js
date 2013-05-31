define(function(){
	return {
		length : function(){
			return this.data.length;
		},
		is : function(pointer){
			return !!this.data[pointer];
		},
		get : function(pointer){
			return this.is(pointer) && this.data[pointer];
		}
	};
});