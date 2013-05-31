define(function(){
	return {
		appendTo : function(element){
			!!this.pad.parentNode && this.pad.parentNode.removeChild(this.pad);
			!!element && element.appendChild(this.pad);
		},
		write : function(string){
			var node = document.createElement('p');
		
			node.appendChild(document.createTextNode(string));
			this.line.push(node);
			this.pad.appendChild(node);
		},
		deleteLastLine : function(){
			var last = this.line.pop();
		
			!!last && this.pad.removeChild(last);
		},
		deleteFirstLine : function(){
			var first = this.line.shift();
			
			!!first && this.pad.removeChild(first);
		},
		deleteLine : function(pointer){
			var line = this.line.get(pointer);
		
			!!line && this.pad.removeChild(line);
		}
	};
});