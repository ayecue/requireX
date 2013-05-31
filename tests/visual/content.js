define([
	'../general/jquery.js'
],function($){
	return function($wrapper){
		var $element = $('<div class="content"></div>')
	
		$.extend(this,{
			source : $element,
			add : function(string){
				$element.html(string);
			}
		});
		
		$wrapper.append($element);
	};
});