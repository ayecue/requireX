define([
	'../general/jquery.js'
],function($){
	return function($wrapper,name){
		var $element = $('<div class="header"></div>'),
			$label = $('<h1>'+name+'</h1>'),
			$close = $('<a href="_"></a>');
	
		$.extend(this,{
			source : $element
		});
		
		$wrapper.append($element);
		$element.append($label).append($close);
		
		$close.click(function(_){
			_.preventDefault();
			$wrapper.data('window-ref').clear();
		});
	};
});