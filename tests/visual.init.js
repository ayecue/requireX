require({
	refresh : true
},[
	'css/visual.style.css',
	'visual/package.js',
	'general/jquery.js'
],function(css,Visual,$){
	var button = $('<div class="addWindow">Create Window</div>'),
		counter = 0,
		v = new Visual();
	
	button.click(function(){
		var name = 'test'+(counter++);
		
		v.addWindow('body',name,{
			width: 500
		});
		v.getWindow(name).content.add('Drag Me');
		v.getWindow(name).footer.addButton('Alert',function(){
			alert('Hey there.');
		});
	});
	
	$('body').append(button);
});