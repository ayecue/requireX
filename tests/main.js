require({
	refresh : true
},[
	'array/package.js'
],function(myArray){
	var testArray = new myArray();
	
	testArray.push('test');
	testArray.push('foo');
	testArray.push('bar');
	
	console.log(testArray);
	console.log(testArray.filter('test'));
	console.log(testArray.indexOf('foo'));
});