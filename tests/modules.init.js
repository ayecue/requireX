require({
	refresh : true
},[
	'writer/package.js'
],function(Writer){
	var writer = new Writer(),
		wrapper = document.getElementsByTagName('body')[0];
	
	writer.appendTo(wrapper);
	writer.write('Test text 1.');
	writer.write('Test text 2.');
	writer.write('Test text 3.');
	writer.write('Test text 4.');
	
	writer.findAndDestroy('3\\.$');
});