define([
	'../general/jquery.js'
],function($){
	var lastDrag = null;

	return function($element){
		var self = this,
			x = 0,
			y = 0,
			dx = 0,
			dy = 0;
	
		$.extend(self,{
			mousedown : function(){
				$element.addClass('window-drag-active');
				dy = y - $element.offset().top;
				dx = x - $element.offset().left;
				
				$('body')
					.attr('unselectable', 'on')
					.attr('style','user-select:none;')
					.on('selectstart', false);
			},
			mouseup : function(){
				!!lastDrag && lastDrag.removeClass('window-last-active');
				lastDrag = $element.addClass('window-last-active');
				$element.removeClass('window-drag-active');
				
				$('body')
					.removeAttr('unselectable', 'on')
					.removeAttr('style')
					.off('selectstart');
			},
			mousemove : function(e){
				x = document.all ? window.event.clientX : e.pageX;
				y = document.all ? window.event.clientY : e.pageY;
				
				if ($element.hasClass('window-drag-active'))
				{
					var ny = y - dy,
						nx = x - dx;
				
					if (nx > 0 && ny > 0)
					{
						$element.css({
							top : ny,
							left : nx
						});
					}
				}
			},
			add : function(){
				$element
					.mousedown(this.mousedown)
					.mouseup(this.mouseup)
					.attr('unselectable', 'on')
					.on('selectstart', false);
				$(document).mousemove(this.mousemove);
			},
			clear : function(){
				$element
					.unbind('mousedown',this.mousedown)
					.unbind('mouseup',this.mouseup)
					.removeAttr('unselectable')
					.off('selectstart');
				$(document).unbind('mousemove',this.mousemove);
			}
		});
		
		this.add();
	};
});