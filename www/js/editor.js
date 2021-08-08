 

let Editor = (function(){
	
	
	let prefix = 'editor--';

	const menu = ['basic','insert','style','color','font','justify','strike','action'];
	const actions = ['header','location','reorder','caption','text','tags','description','save'];
	let menuContainer; 
	let inputFile;
	let imageType;
	let editorBoard;
	let ps;	
	let M;
	let fullSize 
	let mediumSize ;  
	let files = [];
	let article = {
		'tags' : []
	};
	

	

	let View = {
	
		configure : function(){
			 M = Main.Parts();
			fullSize = window.innerWidth;
			mediumSize = M.width;
			
		},

		init : function(){
			this.configure();
			this.template();
		},

		template : function(){
			createContainer();	
			addHiddenInput();

			createMenu();	
		}
	}

	
	function createContainer(){
		

		 editorBoard = document.createElement('div');
		editorBoard.id = prefix + 'editing';
		editorBoard.style.height = config.height - config.footer;
		editorBoard.style.width = config.width;
		
		
		document.body.append(editorBoard);

	         ps = new PerfectScrollbar(editorBoard,{suppressScrollX : true});

	}


	function addHiddenInput(){
	
		 inputFile = document.createElement('input');
		inputFile.type = 'file';
		inputFile.addEventListener('change',selectPic);
		inputFile.style.display = 'none';

		document.body.append(inputFile);
	}

	function createMenu(){
		
		_createMenuContainer();
		_addElements();
	
	}


	function _createMenuContainer(){
	
		 menuContainer = document.createElement('div');
		menuContainer.id = prefix + 'imenu-container';

		let header = document.createElement('div');
		header.id  = prefix + 'imenu-header';

		let move = document.createElement('img');
           	move.src = getLink("move.png");
		move.classList.add(prefix + 'mheader-el');
		move.id = prefix + 'mheader-move';

		let down = document.createElement('img')
           	down.src = getLink('iup.png')	
			
		down.classList.add(prefix + 'mheader-el');
		down.id = prefix + 'mheader-down';

		down.addEventListener('click',function(){
			let id = '#' + prefix + 'imenu-body';
  			$(id).animate({top:"+=300"},80,function(){
				document.getElementById(prefix + 'mheader-down').style.display = 'none';
			});
           	})
		

		let minimize = document.createElement('span');
		minimize.classList.add(prefix + 'mheader-el');
		minimize.id = prefix + 'mheader-min';	
		header.append(move);
		header.append(down);
		header.append(minimize);

	
		let body = document.createElement('div');
		body.id = prefix + 'imenu-body';

		let subMenu = document.createElement('div');
		subMenu.id = prefix + 'imenu-sub';


		menuContainer.append(header);
		menuContainer.append(body);
		menuContainer.append(subMenu);
		

		move.addEventListener('mousedown',mouseDown,false);
		window.addEventListener('mouseup',mouseUp,false);

	
		minimize.addEventListener('click',function(){
		
			if(this.hide){
				this.hide= 0;
				body.style.display = 'block';
				subMenu.style.display = 'block';
			}else{
				this.hide  = 1;
				body.style.display='none';
				subMenu.style.display = 'none';
			}			
		})

		document.body.append(menuContainer);
	}
	 

	function _addElements(){
		let body =  document.getElementById(prefix + 'imenu-body');

		menu.forEach(elem=>{
			
			let item = document.createElement('div');
			item.innerHTML = elem;
			item.classList.add(prefix + 'imenu-bodyItem');
			item.addEventListener('click',__bringItems);

			body.append(item);
		
		})
	
	}

	function __bringItems(e){
		let elem = e.target;
		let id = '#' + prefix + 'imenu-body';
		
		let sub = document.getElementById(prefix + 'imenu-sub');
		sub.innerHTML = '';

		if(elem.innerHTML == 'action'){
	
			sub.innerHTML = '';

			actions.forEach(elem=>{
			
				let span = document.createElement('span');
				span.classList.add('xbt-edit','btn-xs');
				span.innerHTML = elem;

				span.addEventListener('click',function(e){
					e.stopPropagation();
					e.preventDefault();

					actionCommand(e);
				});
				sub.append(span);
			})		

		
			$(id).animate({top:"-=300"},200,function(){
			
				document.getElementById(prefix + 'mheader-down').style.display = 'block';
			});
		    

		}else {

			let html = returnMenuContent(elem.innerHTML);
		
			$(id).animate({top:"-=300"},200,function(){
			
				document.getElementById(prefix + 'imenu-sub').append(html);;
				document.getElementById(prefix + 'mheader-down').style.display = 'block';

	
				Array.from(document.getElementById('xbt').children).forEach(elem=>{
				
					elem.addEventListener('click',function(){
						doCommand(this.innerHTML);
					})
				})

			});
			
			
		           
		}
	}


       function returnMenuContent(type){
             let html = document.createElement('div');
		html.id ='xbt';
	       commands.forEach(function(command) {
   	        if(command.type != type) return;
		        commandRelation[command.cmd] = command;
		        let temp = document.createElement('span');
		      	temp.classList.add('xbt-edit','btn-xs');
		      
		        temp.innerHTML = command.cmd;
			
	     	     html.append(temp);
	        });

           return html;
           }

	


	function mouseUp()
	{
	    window.removeEventListener('mousemove', divMove, true);
	}

	function mouseDown(e){
	  window.addEventListener('mousemove', divMove, true);
	}

	function divMove(e){
	  let  div = document.getElementById(prefix + 'imenu-container');
	  
	  div.style.top = e.clientY + 'px';
	  div.style.left = e.clientX + 'px';
	}

	

	function actionCommand(e){
	
		let action = e.target.innerHTML;
		   
		switch(action){
		
			case 'header':
				__addHeader();
				break;
			case 'location':
				__addLocation();
				break;
			case 'reorder':
				__reorder();
				break;
			case 'caption':
				__addCaption();
				break;
			case 'text':
				__addText();
				break;
			case 'tags':
				__addTags();
				break;
			case 'description':
				__addDescription();
				break;
			case 'save':
				__saveArticle();
				break;
			default:
				break;
		}
			
	}

	function __addHeader(){
	
	      let tag = 'h3';
              var sel, range;
              
              if (window.getSelection) {
                 sel = window.getSelection();
       		
		      if (sel.rangeCount) {
                   range = sel.getRangeAt(0);
		 	
                   selectedText = range.toString();
                   if(selectedText == '') return;

		   article['header'] = cleanString(selectedText.trim());

                   range.deleteContents();
                   let span = document.createElement('h3')
                   span.innerHTML = selectedText;
                   span.classList.add('ei-header');
             
                   range.insertNode(span);
                  span.parentNode.setAttribute('ia','header');
                 }
              }
             
	}

	function __addLocation(){
	
		let shadow = document.createElement('div');
		   shadow.style.width = window.innerWidth ;
		   shadow.style.height = window.innerHeight ;

		   shadow.classList.add('shadow');
			shadow.addEventListener('click',function(e){
				if(e.originalTarget == this)
				 this.remove();
			})

		let map = _cl('div');
		map.classList.add(prefix + 'select-map');
			console.log(M.body);	
		let style = window.getComputedStyle(M.body);
		let bodyWidth =parseInt( style.getPropertyValue('width'));
		let bodyHeight =parseInt (style.getPropertyValue('height'));


		map.style.height = bodyHeight  -20; 

		map.style.width = bodyWidth -40;

		
		map.id = prefix + 'select-map';	
		shadow.append(map);

	       	document.body.append(shadow);

		let mp=L.map(map,{zoomControl : false}).setView([34.70815,46.45460], 15);


        	L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                         attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                   maxZoom: 18,
                   id: 'mapbox/streets-v11',
                   tileSize: 512,
                    zoomOffset: -1,
                      accessToken: 'pk.eyJ1IjoiMWlvMWwiLCJhIjoiY2psNThyd3luMGVsMjN4bnR3bXc4MXV2cyJ9.ks2qVsrV6d1rXu54-CyqIw'
                }).addTo(mp);
	         


                 new L.Control.Zoom({position:'bottomright'}).addTo(mp);
	  	
		let newMarker;
		

		 var myIcon = L.icon({
			    iconUrl:getLink('pin.png'),
			   
			    iconSize: [20, 35],
                });

		mp.on('click',(e)=>{
			
			if(newMarker)
				mp.removeLayer(newMarker);
		
			article['x'] = e.latlng.lat;
			article['y'] = e.latlng.lng;

			 newMarker = new L.marker(e.latlng,{icon: myIcon}).addTo(mp);	
		})
	
	}

	function __reorder(){
	
	
	}


	function __addCaption(){
	
		var nextEditable = document.createElement('div');               
                
                if(isMobile()){
                   nextEditable.style.width = M.width + 'px';
                   nextEditable.style.minHeight = 20 + 'px';                 
                }else{
                   nextEditable.style.width = M.width + 'px';
                   nextEditable.style.minHeight = 20 + 'px'; 
                }
               
                nextEditable.setAttribute('contenteditable','true');
          
                nextEditable.style.borderLeft = "1px solid lightblue";
                nextEditable.style.padding = 2 + 'px';         
                nextEditable.classList.add(prefix + 'medium');
               	nextEditable.setAttribute('type','caption');
                editorBoard.append(nextEditable);         
                nextEditable.focus();
		ps.update();
	}

	function __addText(){
          	
                var nextEditable = document.createElement('div');
                
                if(isMobile()){ 
                  nextEditable.style.width = M.width +  'px';
                  nextEditable.style.minHeight = 100 + 'px';
                    nextEditable.style.marginTop = '5px'; 
                }else{
                  nextEditable.style.width = M.width;
                  nextEditable.style.minHeight = 150 ;      
                    nextEditable.style.marginTop = '10px';            
                }

                nextEditable.setAttribute('contenteditable','true');
                
                nextEditable.style.borderLeft = "1px solid lightblue";
                nextEditable.style.padding = 2 + 'px';   
                nextEditable.style.marginBottom = 10 ; 
                nextEditable.classList.add(prefix + 'medium');        
                nextEditable.setAttribute('type','text');             
                editorBoard.append(nextEditable); 
               
                nextEditable.focus();
		ps.update();
	
	}


	function __addTags(){
		

		let tagContainer = document.createElement('div');
		tagContainer.classList.add(prefix + 'tag-container');

		let inputsContainer = document.createElement('div');

		inputsContainer.classList.add(prefix + 'tag-inputs');


		let input = document.createElement('input');
		input.type = 'text';

		input.classList.add(prefix + 'tag-input');

		let add = document.createElement('div');
		add.classList.add(prefix + 'tag-add');

		add.innerHTML = 'add tag';

		inputsContainer.append(input);
		inputsContainer.append(add);

		let body = document.createElement('div');

		body.classList.add(prefix + 'tag-body');

		tagContainer.append(inputsContainer);
		tagContainer.append(body);


		let shadow = document.createElement('div');
		shadow.style.width = window.innerWidth;
		shadow.style.height = window.innerHeight;

		shadow.classList.add('shadow');

		shadow.append(tagContainer);
		tagContainer.addEventListener('click',function(e){
		
			e.stopPropagation();

		})
	

		shadow.addEventListener('click',function(e){
			this.remove();
		})
	

		add.addEventListener('click',function(){
			
			if(!input.value) return;
			

			article['tags'].push(input.value);
			let span = document.createElement('span');
			
			span.innerHTML = input.value;
			
			body.append(span);
			
		})

		document.body.append(shadow);
		
	
	}
	
	function __addDescription(){
	
	   let tag = 'span';
              var sel, range;
              
    
              if (window.getSelection) {
                 sel = window.getSelection();
        
                 if (sel.rangeCount) {
                   range = sel.getRangeAt(0);
                   selectedText = range.toString();
                   if(selectedText == '') return;

		   article['description'] = cleanString(selectedText.trim());

                   range.deleteContents();
                   let span = document.createElement('span')
                   span.innerHTML = selectedText;
                   span.classList.add('description')
                   range.insertNode(span);
        	   
		    span.parentNode.setAttribute('ia','description');
                }
              }
              else if (document.selection && document.selection.createRange) {
                range = document.selection.createRange();
                selectedText = document.selection.createRange().text + "";
                if(selectedText == '') return;
                range.text = '[' + tag + ']' + selectedText + '[/' + tag + ']';
           
	      }
	}


	function __saveArticle(){
	
	
		let index = 0;
		let offset = 0;
		let chunkSize = 512;
		let offSize ;
	

	
		article['nfile'] = files.length;

		article['action'] = 'insert';

		console.log(article);

	//	ws.send(JSON.stringify(article))

		let fileReader = new FileReader();

		let readSlice = function(i){


			if(!files[i]) return;

			if((files[i].length -1) < i) return;

			chunkSize = files[i].size;

			if(offset + chunkSize > files[i].size){

				offSize = files[i].size - offset;

			}else{

				offSize = offset + chunkSize;

			}


			let slice = files[i].slice(offset,offSize);

			fileReader.readAsArrayBuffer(slice);

		}

		fileReader.addEventListener('load',function(e){

			let arrayBuffer = new Uint8Array(e.target.result);
			let buff = Array.from(arrayBuffer);

			let jObject = {

				data : buff,
				total : files[index].size,
				len : e.target.result.byteLength,
				filename : files[index].name,
				action : "upload"

			}

			ws.send(JSON.stringify(jObject));

			if(offSize <= offset + chunkSize){

				index +=1;
				offset = 0;
			}else {

				offset +=e.target.result.byteLength;

			}

			readSlice(index);


		})


		ws.send(JSON.stringify(article));

		readSlice(0)
	}

	
	function uploadJson(id){
	
		let json = {};
		let t = 0;

		
		json.id = id;
		json.tags = article.tags;
		json.x = article.x;
		json.y = article.y;

		json.action = 'json';
		
		for(let node of editorBoard.children) {
		
			if(node.hasAttribute('type')){
				let type = node.getAttribute('type');

			        if(type =='img'){
					json[t] = {
						'type' : type,
						'strech' : node.getAttribute('strech'),
						'name' : node.getAttribute('name')
					}
					
				}else {
					json[t] = {
						'type' : type,
						'html' : node.innerHTML
					}

					if(node.hasAttribute("ia"))
						json[t].ia = node.getAttribute("ia")
				}

				t++;
					
			}

		}

		
		ws.send(JSON.stringify(json));
	       		
		
	}


	
	function selectPic(e){

		let file = e.target.files;

		files.push(file[0]);
		let image = new Image();
			
		let reader = new FileReader();
		
		reader.onload = function(e){ 

			image.src = e.target.result;
			let partitionSize = (imageType == 'fullscreen') ? fullSize : mediumSize;
	
			
			image.onload = function(){
				
				let width = this.width;
				let height = this.height;

				if(width > height){
					this.width = partitionSize;
					this.height = height/width * partitionSize;
					this.style.width = this.width;
					this.style.height = this.height;
				}else {
					
					this.height = partitionSize;
					this.width = width/height * partitionSize;
					this.style.width = this.width;
					this.style.height = this.height;

				}
			

				console.log(file[0].name);				
				this.setAttribute('type','img');
				this.setAttribute('strech',imageType);
				this.setAttribute('name',file[0].name);
				this.classList.add(prefix + imageType);	
				editorBoard.append(this);
				ps.update();	
			}
		
		}


		reader.readAsDataURL(file[0]);	
	
	}

	function InsertImage(){
		selectImageType();		
	}


	function selectImageType(){
		
		let shadow = document.createElement('div');
		shadow.style.width = window.innerWidth;
		shadow.style.height = window.innerHeight;

		shadow.classList.add('shadow');

		let types = document.createElement('div');
		

		let full = document.createElement('div');
		let medium = document.createElement('div');
		
		full.innerHTML = 'fullscreen';
		medium.innerHTML = 'medium';
		
		
		full.addEventListener('click',_=>{
			imageType = 'fullscreen';
			shadow.remove();
			inputFile.click();
		})

		medium.addEventListener('click',_=>{
			imageType = 'medium';
			shadow.remove();
			inputFile.click();
		})


		types.classList.add(prefix + 'select-types');
		types.append(full);
		types.append(medium);

		types.addEventListener('click',function(e){
			e.stopPropagation();
		})

		shadow.addEventListener('click',function(e){
			this.remove();
		})
		shadow.append(types);

		document.body.append(shadow);	
	}


	function cleanString(input) {
	    var output = "";
	    for (var i=0; i<input.length; i++) {
		if (input.charCodeAt(i) <= 127) {
		    output += input.charAt(i);
		}
	    }
	    return output;
	}

	let Controller = (function(){
		let id ;

		R.registerEvent('article--done');
		R.addEventListener('article--done',function(e){
			id = e.id;
			uploadJson(e.id);
		})

		

		R.registerEvent('json-uploaded');
		R.addEventListener('json-uploaded',function(e){
		
			inputFile.remove();
			editorBoard.remove();
			menuContainer.remove(); 				
			console.log(e);
			R.dispatchEvent('article-init',e);
			

		
		})
		let routes = [];

		let route1 = {
		
			route : prefix + 'init',
			url : 'article',
			dependencies : ['main--init'],
			used : 0
		};

		routes.push(route1);
	

	
		let Router = function(route){
			
			switch(route){
				case 'init':
					View.init();
					pushState({},"create article","/naro/article/create");
					break;
				default:
					break;

			}
		
		}

		return {
			Router : Router,
			routes : routes
		}
			
	})()

	

	App.Add(Controller);

	return {
	
		insertImage : InsertImage
	}

})()



