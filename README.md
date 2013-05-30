# requireX
* Author: swe
* Version: 0.8.1.0
* Language: JavaScript

## Short Description:
This module load JavaScript, Stylesheets and Images. Perfect for writing modular JavaScript.


##Example:

	require([
		'!#$;http://nothing.todo.here/ajax/libs/jquery/1.9.1/jquery.min.js',
		'!-$;!#$.fn;http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js',
		'http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js',
		'https://developers.google.com/_static/css/screen.css',
		'style.css',
		'http://www.w3schools.com/images/w3schoolslogoNEW310113.gif'
	]).always(function(a,b,c,d,e,f){
		$("div")
			.append('<p class="new">>> call require()</p>')
			.append('<p>Loaded: '+a.success+' ('+a.path.file()+') from '+a.path.src()+'</p>')
			.append('<p>Loaded: '+b.success+' ('+b.path.file()+') from '+b.path.src()+'</p>')
			.append('<p>Loaded: '+c.success+' ('+c.path.file()+') from '+c.path.src()+'</p>')
			.append('<p>Loaded: '+d.success+' ('+d.path.file()+') from '+d.path.src()+'</p>')
			.append('<p>Loaded: '+e.success+' ('+e.path.file()+') from '+e.path.src()+'</p>')
			.append('<p>Loaded: '+f.success+' ('+f.path.file()+') from '+f.path.src()+'</p>');
	}).next([
		'http://ajax.googleapis.com/ajax/libs/mootools/1.4.5/mootools-yui-compressed.js'
	]).then(function(a){
		$("div")
			.append('<p class="new">>> call require()</p>')
			.append('<p>Loaded: '+a.success+' ('+a.path.file()+') from '+a.path.src()+'</p>');
	});


