define([
	'../general/jquery.js'
],function($){
	return function($wrapper){
		var $element = $('<div class="footer"></div>')
	
		$.extend(this,{
			source : $element,
			buttons : {refs : []},
			createButton : function(label){
				var $button = $('<div class="button '+label.toLowerCase()+'">'+label+'</div>');
				
				this.buttons.refs.push(label);
				this.buttons[label] = $button;
				$element.append($button);
				
				return $button;
			},
			hasButton : function(label){
				return !!this.buttons[label];
			},
			getButton : function(label){
				return this.hasButton(label) ? this.buttons[label] : this.createButton(label);
			},
			clearButton : function(label){
				this.hasButton(label) && this.getButton(label).remove();
			},
			addButton : function(label,callback){
				var $button = this.getButton(label),
					$wrapper = $button.data('button-wrapper');
			
				return $button.click(callback);
			}
		});
		
		$wrapper.append($element);
	};
});