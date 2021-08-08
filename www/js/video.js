
let Video = (function(){
	
	let inited = 0;
	let parent ;	
	let prefix = 'handi--';
	let M ;
	let location;
	let selected = 0;
	let unselected = 0; 
	let select,remove;
	let files;
	let details = {
		tags:[]
	};


	let View = {
		configure : function(){
			M = Main.Parts();

			parent = M.body;	
		},
		init : function(){
			
			if(inited) return;
			this.configure();
			this.template();
			M.header.classList.remove('noborder');

		},

		template : function(){
			createUploadHeader();	
			createUploadContainer();
			createUploadFooter();
		}

	
	}
	

	function createUploadHeader(){
			
		 M.header.innerHTML = '';
		M.header.classList.add('borderbottom');

		let hash = document.createElement('div');
		 hash.innerHTML = '#';
		 hash.classList.add('handi--header-item');
		 hash.style.marginTop = '8px';         
		 let map = new Image();
		 map.classList.add('handi--header-png');
		 map.src = getLink('map.png');
		 
		 let add = new Image();
		 add.classList.add('handi--header-png');

		 add.src= getLink('add.png');
	
		let upload = document.createElement('div');

		upload.classList.add(prefix + 'upload-btn');

		upload.innerHTML = 'upload';

		upload.addEventListener('click',startUpload);	

		 let input = document.createElement('input');
		document.body.append(input);
		input.id = 'input';
		input.type = 'file';
		input.multiple = 'multiple';
		input.style.display = 'none';
		 add.addEventListener('click',function(e){
		     input.click();
		 })

		input.addEventListener('change',_getInputFiles);

		 let edit = new Image();
		 edit.classList.add('handi--header-png');
		 edit.src = getLink('edit.png');
		 
		 edit.addEventListener('click',add_details);
		 map.addEventListener('click',select_location);
		 hash.addEventListener('click',add_hash); 
		 M.header.appendChild(add);
		 M.header.appendChild(map);
	//	 M.header.appendChild(hash);
		 M.header.appendChild(edit);
		M.header.appendChild(hash);
		M.header.appendChild(upload);
	}

	
	function createUploadFooter(){
		M.body.innerHTML = '';	
		let wrapper  = document.createElement('div');

		wrapper.classList.add(prefix + 'upload-footer');
		wrapper.style.height = config.footer;
		

		let sWrap = document.createElement('div');
		let dWrap = document.createElement('div');
		let cWrap = document.createElement('div');
		
		sWrap.classList.add(prefix + 'upload-items');
		dWrap.classList.add(prefix + 'upload-items');
		cWrap.classList.add(prefix + 'upload-items');

		

		let sline = document.createElement('span');
		let dline = document.createElement('span');
		
		sline.classList.add(prefix + 'upload-line');
		dline.classList.add(prefix + 'upload-line');
		

		sline.style.backgroundColor = 'green';
		dline.style.backgroundColor = 'tomato';

		let  selectSpan = document.createElement('span');
		selectSpan.innerHTML = 'selected';

		let removeSpan = document.createElement('span');
		removeSpan.innerHTML = 'remove';
		

		let numContainerSelect = document.createElement('div');
		let numContainerRemove = document.createElement('div');
		
		numContainerSelect.classList.add(prefix + 'upload-num');
		numContainerRemove.classList.add(prefix + 'upload-num');

		let o1 = document.createElement('span');
		let o2 = document.createElement('span');
		

		o1.innerHTML = '(';
		o2.innerHTML = '(';


		let num1 = document.createElement('span');
		let num2 = document.createElement('span');
		

		select = num1;
		remove = num2;

		num1.innerHTML = 0;
		num2.innerHTML = 0;
		

		num1.id = prefix + 'selected';
		num2.id = prefix + 'unselected';


		let c1 = document.createElement('span');
		let c2 = document.createElement('span');


		 c1.innerHTML = ')';
		 c2.innerHTML = ')';

		

		o1.classList.add(prefix + 'num');
		o2.classList.add(prefix + 'num');
		c1.classList.add(prefix + 'num');
		c1.classList.add(prefix + 'num');

		
		numContainerSelect.append(o1);
		numContainerSelect.append(num1);
		numContainerSelect.append(c1);
	
		
		numContainerRemove.append(o2);
		numContainerRemove.append(num2);
		numContainerRemove.append(c2);
	


		sWrap.append(sline);
		sWrap.append(selectSpan);
		sWrap.append(numContainerSelect);

		dWrap.append(dline);
		dWrap.append(removeSpan);
		dWrap.append(numContainerRemove);
		

		let close = new Image();
		close.src = getLink('coel.png');
			
		close.classList.add(prefix + 'upload-close');
		let closeText = document.createElement('div');

		closeText.innerHTML = 'close';
		
		let space = document.createElement('span');
		space.innerHTML = '    ';
		cWrap.append(close);
		cWrap.append(closeText);

		cWrap.append(space);

		sWrap.style.width = 110;
		dWrap.style.width = 90;
		cWrap.style.width = 70;

		cWrap.addEventListener('click',_=>{
			App.route('archive--init');
		})
		wrapper.append(sWrap);
		wrapper.append(dWrap);
		wrapper.append(cWrap);


		M.footer.append(wrapper);
	}

	function select_location(){
		let shadow = document.createElement('div');
		   shadow.style.width = window.innerWidth ;
		   shadow.style.height = window.innerHeight ;

		   shadow.classList.add('handi-shadow');
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
			location = e.latlng;
			 newMarker = new L.marker(e.latlng,{icon: myIcon}).addTo(mp);	
		})

	}
	

	function add_hash(){
		let prefix = "editor--"
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
		
			details['tags'].push(input.value);
			let span = document.createElement('span');
			
			span.innerHTML = input.value;
			
			body.append(span);
			
		})

		document.body.append(shadow);
		
		
	}


	 function add_details() {

	   let shadow = document.createElement('div');
	   shadow.style.width = window.innerWidth + 'px';
	   shadow.style.height = window.innerHeight + 'px';
		
	   shadow.addEventListener('click',function(){
	 	this.remove();
	    })

	   shadow.classList.add('handi-shadow');

	   let inputContainer  = document.createElement('div');
	   inputContainer.classList.add('handi--details-addContainer');
	   
	   let style = window.getComputedStyle(M.body);
           let bodyWidth =parseInt( style.getPropertyValue('width'));
	   let bodyHeight =parseInt (style.getPropertyValue('height'));

		

	   let wrapper = document.createElement('div');
	   wrapper.classList.add(prefix + 'details-wrapper');
		
	  wrapper.addEventListener('click',function(e){
	
		  e.stopPropagation();
	   })

	   inputContainer.style.width =  bodyWidth ;	
	   inputContainer.style.marginTop = 60;
	   let detailsInput = ['title','description'];

	   detailsInput.forEach(function(el){
	      let input = document.createElement('input');
	      input.type = 'text';
	      input.id = 'handi--details-' + el + 'Input';
	      input.placeholder = el;
	      input.classList.add('handi--details-inputs');
	      inputContainer.appendChild(input);
	   })

	   let inpts = inputContainer.children;
	   Array.from(inpts).forEach(function(el){
	      el.onclick = function(e){e.stopPropagation();}
	   })

	   let submit = document.createElement('div');
	   submit.classList.add('handi--details-submit');
	   submit.innerHTML = 'Add';


	   submit.addEventListener('click',function(){
	   	Add();
		   shadow.remove();
	   });

	   inputContainer.appendChild(submit);
	   //shadow.addEventListener('click',_close_shadow);
	wrapper.append(inputContainer);

	  shadow.appendChild(wrapper);
	   document.body.appendChild(shadow);

	 }
	


	function Add(){
	   let detailsInput = ['title','description'];

		
		//let details = {};
		

		detailsInput.forEach(function(el){
			let id = 'handi--details-' + el + 'Input';

			details[el] = document.getElementById(id).value;

		})

		
	}

	function startUpload(){
	
		let index = 0;
		let offset = 0;
		let chunkSize = 512;
		let offSize ;
		let numberOfFiles ;

	

		let x = location.lat;
		let y = location.lng;


		if(files)
			numberOfFiles = files.length;
	
		let prepareUpload = {
		
			nfile : numberOfFiles,
			x : x,
			y : y,
		
			tags : details['tags'],
			title : details['title'],
			description : details['description'],
			action : 'ivideo'
		};

	
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
				action : "uvideo"
				
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
		

		console.log(prepareUpload);
		ws.send(JSON.stringify(prepareUpload));
		readSlice(0)

	
	}
	function _getInputFiles(e){

		const partitionSize = 100;
		files = e.target.files;
		

		let fileContainer =  document.createElement('div');
		fileContainer.classList.add(prefix + 'body-upload');
		
		let style = window.getComputedStyle(M.body);
		let bodyWidth =parseInt( style.getPropertyValue('width'));
		let bodyHeight = (style.getPropertyValue('height'));


		fileContainer.style.width = bodyWidth -20;
		//fileContainer.style.height = bodyHeight - 40;

		M.body.append(fileContainer);

		if(config.dir){

			fileContainer.style.direction = 'rtl';
		}


		for (let i = 0 ; i < files.length ; i++){

			let wrapper = _cl('div');
			wrapper.classList.add(prefix + 'filecontainer-wrapper');
			

		    let video = document.createElement('video');
		    let source = document.createElement('source');
		   
		   // video.setAttribute('controls',true);
		   // video.style.display = 'none'; 
		    wrapper.append(video); 
		    video.appendChild(source);
		   
		  
	   	    	source.src = URL.createObjectURL(files[i]);
			  
			let canvas = _cl('canvas');
			wrapper.append(canvas);
		
			fileContainer.append(wrapper);
			video.load();		
						
			video.style.display = 'none'
		
			
		

			video.addEventListener('loadeddata',function(){
				let width  =this.videoWidth;
				let height = this.videoHeight;
				

				canvas.width = width;
				canvas.height = height;
				let w;
				let h;

			
				canvas.classList.add(prefix + 'selected');


					canvas.selected = 1;
					canvas.addEventListener('click',()=>{
						if(canvas.selected){
							canvas.classList.remove(prefix + 'selected');
							canvas.classList.add(prefix + 'unselected');
							canvas.selected = 0;
							updateSelection(0);
						}else{
							canvas.classList.remove(prefix + 'unselected');
							canvas.classList.add(prefix + 'selected');
							canvas.selected = 1;
							updateSelection(1);
						}
					})
		

				canvas.getContext('2d').drawImage(this, 0, 0, width, height);
		
				if(width > height){
						canvas.style.width = partitionSize;
						canvas.style.height = height/width * partitionSize;
						let left = height/width * partitionSize;
							
						canvas.style.marginTop = (partitionSize - left)/2;
					}else{

						canvas.style.height = partitionSize;
						canvas.style.width = width/height * partitionSize;
						let left = width/height * partitionSize;

						canvas.style.marginLeft = (partitionSize - left )/2;
					}

			})

		}	

		select.innerHTML  = files.length;
		 remove.innerHTML = 0;
		

		selected = files.length;
		unselected = 0;
	}

	function updateSelection(sel){
	
		if(sel){
			select.innerHTML = ++(selected);	
			remove.innerHTML = --(unselected);
		}else {
		
			select.innerHTML = --(selected);	
			remove.innerHTML = ++(unselected);
		
		}
	
	}

	function createUploadContainer(){}

	let Controller = (function(){
		let prefix = 'video--';

		let routes = [];

		let route1 = {
		
			route : prefix + 'init',
			url : 'video',
			dependencies : ['main--init'],
			used : 0,
			data : false
		};

		R.registerEvent(prefix + 'completed');
		R.addEventListener(prefix + 'completed',function(e){
			console.log(e);
		});


		R.registerEvent('gallery-done');
		R.addEventListener('gallery-done',function(e){
			console.log('gallery done');	
			console.log(e);
		})


		routes.push(route1);


		let Router = function(route){
			
			switch(route){
				case 'init':
					View.init();
					pushState({},'upload video','/naro/video/upload')
					break;
				default:
					break;

			}
		
		}

		return {
			Router : Router,
			routes : routes
		}
	})();
	

	App.Add(Controller);


})()

