
function _cl(el){

	return document.createElement(el);
}
function _l(id){
	return document.getElementById(id);
}


function Event(name){
  this.name = name;
  this.callbacks = [];
}
Event.prototype.registerCallback = function(callback){
  this.callbacks.push(callback);
}

function Reactor(){
  this.events = {};
}

Reactor.prototype.registerEvent = function(eventName){
  var event = new Event(eventName);
  this.events[eventName] = event;
};

Reactor.prototype.dispatchEvent = function(eventName, eventArgs){
  this.events[eventName].callbacks.forEach(function(callback){
    callback(eventArgs);
  });
};

Reactor.prototype.addEventListener = function(eventName, callback){
  this.events[eventName].registerCallback(callback);
};


//https://stackoverflow.com/questions/15308371/custom-events-model-without-using-dom-events-in-javascript#15308814
var R = new Reactor();

/*
reactor.registerEvent('big bang');

reactor.addEventListener('big bang', function(){
  console.log('This is big bang listener yo!');
});

reactor.addEventListener('big bang', function(){
  console.log('This is another big bang listener yo!');
});

reactor.dispatchEvent('big bang');
*/


let ws ;
let site = 'http://weborient.ir:2000';
let myHome;



let slideUp;
let slideDown;
let hash;
let cook;
let navi = 0;

function isMobile(){
	let ret = window.innerWidth > 600 ? 0 : 1; 
  return ret;
}

function _cl(el){

	return document.createElement(el);
}
function _l(id){
	return document.getElementById(id);
}

function get_appropriate_ws_url(extra_url)
{
	var pcol;
	var u = document.URL;

	/*
	 * We open the websocket encrypted if this page came on an
	 * https:// url itself, otherwise unencrypted
	 */

	if (u.substring(0, 5) === "https") {
		pcol = "wss://";
		u = u.substr(8);
	} else {
		pcol = "ws://";
		if (u.substring(0, 4) === "http")
			u = u.substr(7);
	}

	u = u.split("/");

	/* + "/xxx" bit is for IE10 workaround */

	return pcol + u[0] + "/" + extra_url;
}

function new_ws(urlpath, protocol)
{
	if (typeof MozWebSocket != "undefined")
		return new MozWebSocket(urlpath, protocol);

	return new WebSocket(urlpath, protocol);
}



function makeUrl(user,url){

	let base = 'files/';

	let ret = site + '/' + base + user + '/thumb/' + url;
	
	return ret;
	
}

function makeSlideUrl(user,url){

	let base = 'files/';
	

	if(config.width > 700) 

		 return site + '/' + base + user + '/desktop/' + url;

	else 
		return site + '/' + base + user + '/mobile/' + url;
}

function getLink(png){
	
	
	let dir = '/arrow/';
	return dir + png;
}
function getImage(url){
		let base = '/files/';

		return site + base + 'naro/mobile/' + url;
	}
window.onpopstate = function(e){
			
	App.navigate(window.location.pathname,true);
}


function pushState(a,b,c){
	if(c == window.location.pathname) return;
	history.pushState(a,b,c);
}

let config = {

	width : window.innerWidth,
	height : window.innerHeight,
	header : 40,
	footer : 40
}
/*
 function Event (sender){ 	 
    this._sender = sender;
    this._listeners = [];  
  }
  
  Event.prototype = {
     attach : function (listener) { 
         this._listeners.push(listener);
     },
     notify : function (args) { 
         var index;
         for (index = 0; index < this._listeners.length; index += 1) {               
            this._listeners[index](this._sender, args);             
         }
         
         
     }
  }
*/
var parms = [{
	"cmd": "aCommandName",
	"desc": "A DOMString representing the name of the command"
}, {
	"cmd": "aShowDefaultUI",
	"desc": "A Boolean indicating whether the default user interface should be shown. This is not implemented in Mozilla."
}, {
	"cmd": "aValueArgument",
	"desc": "A DOMString representing some commands (such as insertimage) require an extra value argument (the image's url). Pass an argument of null if no argument is needed."
}];
var commands = [{
	"type" : "color",
	"cmd": "backColor",
	"val": "red",
	"desc": "Changes the document background color. In styleWithCss mode, it affects the background color of the containing block instead. This requires a color value string to be passed in as a value argument. (Internet Explorer uses this to set text background color.)"
}, {
	"cmd": "bold",
	"type" : "style",
	"icon": "bold",
	"desc": "Toggles bold on/off for the selection or at the insertion point. (Internet Explorer uses the STRONG tag instead of B.)"
}, {
	"cmd": "contentReadOnly",
	"desc": "Makes the content document either read-only or editable. This requires a boolean true/false to be passed in as a value argument. (Not supported by Internet Explorer.)"
}, {
	"type" : "basic",
	"cmd": "copy",
	"icon": "clipboard",
	"desc": "Copies the current selection to the clipboard. Clipboard capability must be enabled in the user.js preference file. See"
}, {
	"type" : "style",
	"cmd": "createLink",
	"val": "https://twitter.com/netsi1964",
	"icon": "link",
	"desc": "Creates an anchor link from the selection, only if there is a selection. This requires the HREF URI string to be passed in as a value argument. The URI must contain at least a single character, which may be a white space. (Internet Explorer will create a link with a null URI value.)"
}, {
	"type" : "basic",
	"cmd": "cut",
	"icon": "scissors",
	"desc": "Cuts the current selection and copies it to the clipboard. Clipboard capability must be enabled in the user.js preference file. See"
}, {
	"type" : "font",
	"cmd": "decreaseFontSize",
	"desc": "Adds a SMALL tag around the selection or at the insertion point. (Not supported by Internet Explorer.)"
}, {
	"type" : "basic",
	"cmd": "delete",
	"icon": "scissors",
	"desc": "Deletes the current selection."
}, {
	"cmd": "enableInlineTableEditing",
	"desc": "Enables or disables the table row and column insertion and deletion controls. (Not supported by Internet Explorer.)"
}, {
	"cmd": "enableObjectResizing",
	"desc": "Enables or disables the resize handles on images and other resizable objects. (Not supported by Internet Explorer.)"
}, {
	"type" : "font",
	"cmd": "fontName",
	"val": "'Inconsolata', monospace",
	"desc": "Changes the font name for the selection or at the insertion point. This requires a font name string (\"Arial\" for example) to be passed in as a value argument."
}, {
	"type" : "font",
	"cmd": "fontSize",
	"val": "1-7",
	"icon": "text-height",
	"desc": "Changes the font size for the selection or at the insertion point. This requires an HTML font size (1-7) to be passed in as a value argument."
}, {
	"type" : "color",
	"cmd": "foreColor",
	"val": "rgba(0,0,0,.5)",
	"desc": "Changes a font color for the selection or at the insertion point. This requires a color value string to be passed in as a value argument."
}, {
	"cmd": "formatBlock",
  "val": "<blockquote>",
	"desc": "Adds an HTML block-style tag around the line containing the current selection, replacing the block element containing the line if one exists (in Firefox, BLOCKQUOTE is the exception - it will wrap any containing block element). Requires a tag-name string to be passed in as a value argument. Virtually all block style tags can be used (eg. \"H1\", \"P\", \"DL\", \"BLOCKQUOTE\"). (Internet Explorer supports only heading tags H1 - H6, ADDRESS, and PRE, which must also include the tag delimiters &lt; &gt;, such as \"&lt;H1&gt;\".)"
}, {
	"cmd": "forwardDelete",
	"desc": "Deletes the character ahead of the cursor's position.  It is the same as hitting the delete key."
}, {
	"type" : "actionf",
	"cmd": "heading",
	"val": "h3",
	"icon": "header",
	"desc": "Adds a heading tag around a selection or insertion point line. Requires the tag-name string to be passed in as a value argument (i.e. \"H1\", \"H6\"). (Not supported by Internet Explorer and Safari.)"
}, {
	"type" : "font",
	"cmd": "hiliteColor",
	"val": "Orange",
	"desc": "Changes the background color for the selection or at the insertion point. Requires a color value string to be passed in as a value argument. UseCSS must be turned on for this to function. (Not supported by Internet Explorer.)"
}, {
	"type": "font",
	"cmd": "increaseFontSize",
	"desc": "Adds a BIG tag around the selection or at the insertion point. (Not supported by Internet Explorer.)"
}, {
	"cmd": "indent",
	"icon": "indent",
	"desc": "Indents the line containing the selection or insertion point. In Firefox, if the selection spans multiple lines at different levels of indentation, only the least indented lines in the selection will be indented."
}, {
	"cmd": "insertBrOnReturn",
	"desc": "Controls whether the Enter key inserts a br tag or splits the current block element into two. (Not supported by Internet Explorer.)"
}, {
	"type": "insert",
	"cmd": "insertHorizontalRule",
	"desc": "Inserts a horizontal rule at the insertion point (deletes selection)."
}, {
	"type" : "insert",
	"cmd": "insertHTML",
	"val": "&lt;h3&gt;Life is great!&lt;/h3&gt;",
	"icon": "code",
	"desc": "Inserts an HTML string at the insertion point (deletes selection). Requires a valid HTML string to be passed in as a value argument. (Not supported by Internet Explorer.)"
}, {
	"type" : "insert",
	"cmd": "insertImage",
	"val": "http://dummyimage.com/160x90",
	"icon": "picture-o",
	"desc": "Inserts an image at the insertion point (deletes selection). Requires the image SRC URI string to be passed in as a value argument. The URI must contain at least a single character, which may be a white space. (Internet Explorer will create a link with a null URI value.)"
}, {
	"type" : "insert",
	"cmd": "insertOrderedList",
	"icon": "list-ol",
	"desc": "Creates a numbered ordered list for the selection or at the insertion point."
}, {
	"type" : "insert",
	"cmd": "insertUnorderedList",
	"icon": "list-ul",
	"desc": "Creates a bulleted unordered list for the selection or at the insertion point."
}, {
	"type" : "insert",
	"cmd": "insertParagraph",
	"icon": "paragraph",
	"desc": "Inserts a paragraph around the selection or the current line. (Internet Explorer inserts a paragraph at the insertion point and deletes the selection.)"
}, {
	"cmd": "insertText",
	"val": new Date(),
	"icon": "file-text-o",
	"desc": "Inserts the given plain text at the insertion point (deletes selection)."
}, {
	"type" : "style",
	"cmd": "italic",
	"icon": "italic",
	"desc": "Toggles italics on/off for the selection or at the insertion point. (Internet Explorer uses the EM tag instead of I.)"
}, {
	"type" : "justify",
	"cmd": "justifyCenter",
	"icon": "align-center",
	"desc": "Centers the selection or insertion point."
}, {
	"type" : "justify",
	"cmd": "justifyFull",
	"icon": "align-justify",
	"desc": "Justifies the selection or insertion point."
}, {
	"type" : "justify",
	"cmd": "justifyLeft",
	"icon": "align-left",
	"desc": "Justifies the selection or insertion point to the left."
}, {
	"type" : "justify",
	"cmd": "justifyRight",
	"icon": "align-right",
	"desc": "Right-justifies the selection or the insertion point."
}, {
	"cmd": "outdent",
	"icon": "outdent",
	"desc": "Outdents the line containing the selection or insertion point."
}, {
	"type" : "basic",
	"cmd": "paste",
	"icon": "clipboard",
	"desc": "Pastes the clipboard contents at the insertion point (replaces current selection). Clipboard capability must be enabled in the user.js preference file. See"
}, {
	"type" : "basic",
	"cmd": "redo",
	"icon": "repeat",
	"desc": "Redoes the previous undo command."
}, {
	"cmd": "removeFormat",
	"desc": "Removes all formatting from the current selection."
}, {
	"type" : "basic",
	"cmd": "selectAll",
	"desc": "Selects all of the content of the editable region."
}, {
	"type":"strike",
	"cmd": "strikeThrough",
	"icon": "strikethrough",
	"desc": "Toggles strikethrough on/off for the selection or at the insertion point."
}, {
	"type" : "strike",
	"cmd": "subscript",
	"icon": "subscript",
	"desc": "Toggles subscript on/off for the selection or at the insertion point."
}, {
	"type" : "strike",
	"cmd": "superscript",
	"icon": "superscript",
	"desc": "Toggles superscript on/off for the selection or at the insertion point."
}, {
	"type" : "strike",
	"cmd": "underline",
	"icon": "underline",
	"desc": "Toggles underline on/off for the selection or at the insertion point."
}, {
	"type" : "basic",
	"cmd": "undo",
	"icon": "undo",
	"desc": "Undoes the last executed command."
}, {
	"type" : "style",
	"cmd": "unlink",
	"icon": "chain-broken",
	"desc": "Removes the anchor tag from a selected anchor link."
}, {
	"type" : "style",
	"cmd": "useCSS ",
	"desc": "Toggles the use of HTML tags or CSS for the generated markup. Requires a boolean true/false as a value argument. NOTE: This argument is logically backwards (i.e. use false to use CSS, true to use HTML). (Not supported by Internet Explorer.) This has been deprecated; use the styleWithCSS command instead."
}, {
	"type" : "style",
	"cmd": "styleWithCSS",
	"desc": "Replaces the useCSS command; argument works as expected, i.e. true modifies/generates style attributes in markup, false generates formatting elements."
}];

var commandRelation = {};

function supported(cmd) {
	var css = !!document.queryCommandSupported(cmd.cmd) ? "btn-succes" : "btn-error"
	return css
};

function icon(cmd) {
	return (typeof cmd.icon !== "undefined") ? "fa fa-" + cmd.icon : "";
};

function doCommand(cmdKey) {
	if(cmdKey == "insertImage") {
   		
		Editor.insertImage();
		return;
	}
	var cmd = commandRelation[cmdKey];
	if (supported(cmd) === "btn-error") {
		alert("execCommand(“" + cmd.cmd + "”)\nis not supported in your browser");
		return;
	}
	//val = (typeof cmd.val !== "undefined") ? prompt("Value for " + cmd.cmd + "?", cmd.val) : "";
  // val = (typeof cmd.val !== "undefined") ? true : "";
  val = cmd.val;
	document.execCommand(cmd.cmd, false, (val || "")); // Thanks to https://codepen.io/bluestreak for finding this bug
	

	
}

function init() {
	var html = '',
		template = '<span class="xbt-edit btn-xs cmd" >  %cmd%</span>';
	commands.map(function(command, i) {
		commandRelation[command.cmd] = command;
		var temp = template;
		temp = temp.replace(/%iconClass%/gi, icon(command));
		temp = temp.replace(/%desc%/gi, command.desc);
		temp = temp.replace(/%btnClass%/gi, supported(command));
		temp = temp.replace(/%cmd%/gi, command.cmd);
		html+=temp;
	});
	document.querySelector(".buttons").innerHTML = html;
}

