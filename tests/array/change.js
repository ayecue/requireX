define(function(){
	return {
		push : function(v){
			this.data.push(v);
		},
		unshift : function(v){
			this.data.unshift(v);
		},
		pop : function(){
			return this.data.pop();
		},
		shift : function(){
			return this.data.shift();
		}
	};
});