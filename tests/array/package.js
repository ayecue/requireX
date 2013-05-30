define({
	refresh : true
},[
	'../general/extend.js',
	'filter.js',
	'indexOf.js',
	'change.js',
],function(extend,filter,indexOf,change){
	return function(){
		extend(this,{
			data : [],
			filter : filter,
			indexOf : indexOf
		},change);
	};
});