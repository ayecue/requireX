define(function(){
	var slice = [].slice;

	return slice ? function(obj){
		return slice.call(obj);
	} : function(obj){
		return forEach(obj,function(index,item){
			this.result.unshift(item);
		},[]);
	};
});