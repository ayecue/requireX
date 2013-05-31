define({
	refresh : true
},[
	'header.js',
	'content.js',
	'footer.js',
	'drag.js'
],function(Header,Content,Footer,Drag){
	return {
		createWindow : function(name){
			var $element = this.jQuery('<div class="window index'+this.windows.refs.length+'"></div>'),
				self = this;
			
			this.windows[name] = {
				window : $element,
				header : new Header($element,name),
				content : new Content($element),
				footer : new Footer($element),
				drag : new Drag($element),
				clear : function(){
					self.clearWindow(name);
				},
				keyref : this.windows.refs.length
			};
			this.windows.refs.push(name);
			$element.data('window-ref',this.windows[name]);
			
			return $element;
		},
		hasWindow : function(name){
			return !!this.windows[name];
		},
		getWindow : function(name){
			return this.hasWindow(name) ? this.windows[name] : this.createWindow(name);
		},
		clearWindow : function(name){
			if (this.hasWindow(name))
			{
				this.windows[name].drag.clear();
				this.windows[name].window.remove();
				this.windows.refs.splice(this.windows[name].keyref,1);
				this.windows[name] = null;
				delete this.windows[name];
			}
		},
		addWindow : function(element,name,css){
			var $element = this.jQuery.type($element) ==  'object' ? element : this.jQuery(element),
				$window = this.getWindow(name);
			
			!!$window.data('window-wrapper') && $window.removeData('window-wrapper');
			$window.data('window-wrapper',$element.append($window));
			$window.css(css);
		}
	};
});