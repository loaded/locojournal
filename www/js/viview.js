
let VideoShow = (function(){
	
	let inited = 0;
	let parent ;	
	let prefix = 'handi--';
	let M; 
	
	let location;

	let View = {
		configure : function(){
			M = Main.Parts();			
			parent = M.body;	
		},
		init : function(){
	

			inited = 1;
			this.configure();
			this.template();
		},

		template : function(){
			M.clear();
			createHeader();	
			createContainer();
			createFooter();

			//show_thumbs();

			//_menu();
		}

	
	}


	function createHeader(){
	
	 	
		let back = document.createElement('div');
		back.classList.add('handi--header-backHome');
		let image = new Image();
		image.classList.add('handi--header-backHomeImg');
		image.src = getLink('home.png');
		back.addEventListener('click',_=>{
			ws.send(JSON.stringify({username : 'naro',action : 'archive'}));	
		});
		
		M.header.classList.remove('noborder');
		let username = document.createElement('div');

		username.innerHTML = 'naro';

		username.classList.add(prefix + 'username');
		username.addEventListener('click',createMenu);
		back.appendChild(image);

		M.header.append(back);
		M.header.append(username);
	}

	
	function createMenu(){
//		let items = ['Archive','Location','Contact','About','Statistic'];	
		let menu = M.createMenu();
	
/*		for(let i = 0; i < items.length ; i++){
		
			let item = document.createElement('div');
			item.innerHTML = items[i];
			item.classList.add(prefix + 'menu-item');
			menu.append(item);
		}
*/		
	
	
	}

	function createContainer(){
		M.body.innerHTML = '';
		//document.getElementsByClassName('handi--body')[0].innerHTML = '';

	     _create_model_view(M.body);	

	}

	function createFooter(){
		//document.getElementsByClassName('handi--footer')[0].innerHTML = '';

		M.footer.innerHTML = '';
	
	}

	 function _create_model_view(el){

		let preview = document.createElement('div');
	       _create_model_preview(preview);

	       let space = document.createElement('div');
	       _create_model_space(space);

	       let thumbContainer = document.createElement('div');
	       _create_model_thumbs(thumbContainer);
   }

   function _create_model_preview(el){
  
	     el.style.width = '100%';
	     el.style.height  = calculateHeight();
	     el.id = 'handi--container-preview';
	     M.body.append(el); 
	   //View.handiModel.appendChild(el);

   }

   function _create_model_space(el){
	     
	     el.style.width = '100%';
	     el.style.height = 40 ;

	     _create_model_space_buttons(el);
	     M.body.append(el);

   }

   function _create_model_thumbs(el){
		
	 el.id = 'handi--container-thumbs';

	   let container = document.createElement('div');
	   container.classList.add('handi--thumb-container');
	container.append(el);

	    	     
	   M.body.append(container);

   }

	function slide_back(){
		let thumbContainer = document.getElementById('handi--container-thumbs');	
		let container = document.getElementById('handi--thumb-container');

		let model = Database.Show.Model();
		
		let style = window.getComputedStyle(thumbContainer);
		let left =parseInt( style.getPropertyValue('left'));
	
		


		if(isMobile()){
			if( model.urls.length * 100 > M.width ){
				let howMuch = left + 2 *100;
				if(howMuch > 0){
				 	howMuch = 0;
				}

				thumbContainer.style.left= howMuch;
			} 
		}else {
			if( model.urls.length * 130 > M.width ){
				let howMuch = left + 2 *130; 
				if(  howMuch > 0) {
					howMuch = 0;
		
				}
		

				thumbContainer.style.left= howMuch;
			} 
			
		
		}
	}



	function slide_next(){
		let thumbContainer = document.getElementById('handi--container-thumbs');	
		let container = document.getElementById('handi--thumb-container');

		let model = Database.Show.Model();
		
		let style = window.getComputedStyle(thumbContainer);
		let left =parseInt( style.getPropertyValue('left'));
	

		if(isMobile()){
			if( model.urls.length * 100 > M.width ){

				let howMuch = left - 2 *100;
				if((M.width- howMuch) >  model.urls.length * 100) 
					howMuch =left -((model.urls.length * 100) -(M.width - left));

				thumbContainer.style.left= howMuch;
			} 
		}else {
			if( model.urls.length * 130 > M.width ){
				let howMuch = left - 2 *130;
				if((M.width- howMuch) > model.urls.length * 130) 
					howMuch = left-((model.urls.length * 130) -(M.width - left))
				if(-left ==( model.urls.length * 130 - M.width)) return; 
	
				thumbContainer.style.left= howMuch;
			} 
			
		
		}
	}

	
	function _create_model_space_buttons(parent){
	     
	     let buttonContainer = document.createElement('div');
	     buttonContainer.classList.add('handi--container-spaceContainer');

	     let upload = document.createElement('div');
	     let details = document.createElement('div');

	     upload.classList.add('handi--container-spaceCart');
	     upload.innerHTML = 'add to cart';
	     details.innerHTML = 'details';

	     buttonContainer.appendChild(upload);
	     buttonContainer.appendChild(details);
		
		
		let n = new Image();

		n.src = getLink('n.png');

		n.classList.add('handi--basket-next');

		let b = new Image();
		b.src = getLink('b.png');
		b.classList.add('handi--basket-back');
		
		n.addEventListener('click',slide_next);
		b.addEventListener('click',slide_back);

		parent.append(n);
		parent.append(b);



	     Array.from(buttonContainer.children).forEach((child,index)=>{
	       child.classList.add('handi--container-spacebtns') ;
	  /*     child.addEventListener('mouseenter',_handle_upload_btns_mouseenter.bind(child));
	       child.addEventListener('mouseleave',_handle_upload_btns_mouseleave.bind(child)); */
	     })

	     upload.addEventListener('click',function(){
	
			Database.Basket.Add(Database.Show.Model());
	      });

	     details.style.borderTop = '2px solid black';
	     parent.appendChild(buttonContainer);

  	}

	  function calculateHeight(){
	  
		return (config.height - 180 -40 -40 );
	  }
		
	

	
	function show_thumbs(){
	
		let model = Database.Show.Model();
		let container = document.getElementById('handi--container-thumbs');	
		if(isMobile())
			container.style.width = model.urls.length * 100;
		else 
			container.style.width = model.urls.length * 130;

		model.urls.forEach(url=>{
			_load_file(url.url,model);
		})

		_preview_firstone(model.urls[0].url);

	}
	 function _load_file(url,model){
		  
		 let image = new Image();
		  image.mSize = 100;
		  image.dSize = 130;
		  image.addEventListener('load',_load_template_for_thumb);
		  image.src =  getUrl(model.username,model.id,url);

		  image.name = url;
		  image.filename = url;
		  
	}

	function getUrl(username,id,name){
		let url  = site + '/files/' + username + '/' + id +  '/desktop/' + name;
		console.log(url);
		return 	url;
	}

	function _load_canvas(image){ 
	   
	  let width = image.width;
	  let height = image.height;
	  
	  let orientation = image.orient;
	  
	  let mSize = image.mSize;
	  let dSize = image.dSize;
	  
	  let canvas = document.createElement('canvas');
	  canvas.name = image.name;

	  if( 4 < orientation && orientation < 9){
	    if(width > height){
	       if(isMobile()){
		   height = mSize * height/width;
		   width = mSize;
	       }else{
		    height  =  dSize * height/width ;
		   width = dSize;
	       }
	    }else{
	       if(View.isMobile()){
		  width = parseInt(mSize * (width/height));
		  height = mSize;
	       }else{ console.log('2');
		  height = parseInt(dSize * (width/height));
		  width = dSize; 
		} 
	    }

	  canvas.height = width; 
	  canvas.width = height; 
	  }else{
	       if(width > height){
		 if(isMobile()){
		    height = parseInt((mSize  )*(height/width));
		    width = mSize  ;
		 }else{        
		   height   = parseInt(dSize * height/width);
		   width = dSize;
		 }
	      }else{
		if(isMobile()){ 
		   width = parseInt(mSize * (width/height));
		   height = mSize;
		}else{
		   width = parseInt(dSize * (width/height));
		   height = dSize;
		} 
	    }

	   canvas.width = width ;
	   canvas.height = height;
	  }


	  image.width = width;
	  image.height = height;

	  let ctx = canvas.getContext('2d');
	  ctx.drawImage(image,0,0,width ,height );
	 
	  return canvas;
	}
			     


	function _load_template_for_thumb(e){
	  let image = e.target;

	  let mSize = image.mSize;
	  let dSize = image.dSize;

	  let preview = document.createElement('div');

	  let canvas = _load_canvas(image);

	  if(image.name)
	    canvas.gallery = image.name;
	  if(image.filename)
	   canvas.name =image.filename;

	  if(image.src)
	    canvas.src = image.src;

	  preview.appendChild(canvas);

	  let marginTop ;
	  let marginLeft;

	  if(isMobile()){
	     marginLeft = parseInt(mSize - canvas.width)/2;
	     marginTop = parseInt(mSize - canvas.height)/2;
	     preview.style.width = mSize + 'px';
	     preview.style.height = mSize + 'px';
	  }else{
	     marginLeft = parseInt(dSize - canvas.width)/2;
	     marginTop = parseInt(dSize - canvas.height)/2;
	     preview.style.width = dSize + 'px';
	     preview.style.height = dSize + 'px';
	  }

	  canvas.style.marginTop = marginTop + 'px';
	  canvas.style.marginLeft = marginLeft + 'px';

	  preview.style.marginTop = 5 + 'px';
	  preview.style.marginRight = 10 + 'px';
	  preview.name = image.name;
	  preview.classList.add('handi--container-thumbs');
	  canvas.style.borderBottom = '2px solid green';

	  if(image.filename)
	     canvas.addEventListener('click',_preview_file);
	  
	 

	 document.getElementById('handi--container-thumbs').appendChild(preview);
	}



	function _preview_file(e){
		let canvas = e.target;

		   let image = new Image();
		   image.gallery = canvas.gallery;
		   image.name = canvas.name;
		   image.mSize = parseInt(config.width  );
		   image.dSize =parseInt(config.height -260 - 20);
		   image.pType = 'file';
		   image.addEventListener('load',_load_template_for_show);
		   image.src = canvas.src;
	}

	
	function _preview_firstone(url){
		
		let image = new Image();
		   image.gallery = null;
		   image.name = url;
		   image.mSize = parseInt(config.width );
		   image.dSize =parseInt(config.height -260 - 20);
		   image.pType = 'file';
		   image.addEventListener('load',_load_template_for_show);
		   image.src = getImage(url);
 
	}

 
	function _load_template_for_show(e){
	  
	  let image = e.target;

	  let mSize = image.mSize -20 ;
	  let dSize = image.dSize;
	 
		image.mSize -=20;

	  let preview = document.createElement('div');
	  
	  let canvas = _load_canvas(image);
	  preview.appendChild(canvas); 
	  
	  let marginTop ;
	  let marginLeft;

	  if(isMobile()){
		     marginLeft = parseInt(mSize - canvas.width )/2;
		     marginTop = parseInt(mSize - canvas.height)/2;   
		     preview.style.width = (mSize ) + 'px';
		     preview.style.height = (mSize )+ 'px';
	  }else{
		     marginLeft = parseInt(dSize - canvas.width)/2;
		     marginTop = parseInt(dSize - canvas.height)/2 ;
		     preview.style.width = dSize + 'px';
		     preview.style.height = (dSize )  + 'px';
	  }
	  
	  if(image.pType == 'file') { 
		    canvas.src = image.src;
		    canvas.name = image.name;
		    canvas.gallery = image.gallery;
	   }
	   

	   if(isMobile()){
	     	canvas.style.marginLeft = marginLeft + 'px';
	   }else
	   	canvas.style.marginLeft = marginLeft + 'px';

	   canvas.style.marginTop = marginTop + 'px';
	   canvas.top = marginTop;
	   canvas.addEventListener('click',_slide_canvas);
	   preview.style.margin = 'auto';  
	   
	   document.getElementById('handi--container-preview').innerHTML = '';
	   document.getElementById('handi--container-preview').appendChild(preview);
	}


	function _slide_canvas(e){
	   	let elem = e.target;
	 
		  elem.parentElement.remove();


	  	  ex(elem);
	 
	}
	
	function show_details(){
		
		let model = Database.Show.Model();
	
		let details = document.createElement('div');
	
		let title = document.createElement('div');
		let text  = document.createElement('div');
		let price = document.createElement('div');

		details.classList.add(prefix + 'show-details');	

		title.classList.add(prefix + 'show-title');
		text.classList.add(prefix + 'show-text');
		price.classList.add(prefix + 'show-price');
		

		title.innerHTML = model.title;
		text.innerHTML = model.text;
		price.innerHTML = model.price || '500';

		details.append(title);
		details.append(text);
		details.append(price);
		
		let elem = document.getElementById('handi--container-preview');
		
		if(isMobile()){
			details.style.marginLeft = 10;
			details.style.marginTop = 20;
		}else {
			details.style.marginLeft = 20;
		}

		elem.append(details);	

	}

	function ex(el){
	  
	  let width = el.width;
	  let height = el.height;
	  let top = el.top;

			
	  let bWidth = (config.width > 800) ? 800 : config.width ;

		 
	  let src = el.src;
	  if(isMobile()){
	    	left = parseInt((bWidth - width)/2) ;   
	   }else
	   	left = parseInt((bWidth - width)/2) ;
	   
	  let style = window.getComputedStyle(el) ;
	  
	  
	  let type = width > height ? 'width' : 'height';
	  let steps = (type == 'width') ? parseInt( top/10) : parseInt( left/10);
	  
	  let xStep = parseInt(left/steps);
	  let yStep = parseInt(top/steps);
	  
	  let max = Math.max(width,height);

	  let nWidth = parseInt(width);
	  let nHeight =parseInt( height);

	 let promise = function(time){

	   setTimeout(function(){
	      if(top == 0 && left == 0) {
		  let elem = document.getElementById('handi--container-preview').firstChild;
		  elem.style.float = 'left';
		show_details(el);
		  return;
	      }          
		
	      let image = new Image();
	      image.onload = function(){
		document.getElementById('handi--container-preview').innerHTML = '';        

		let canvas = document.createElement('canvas');
		canvas.style.position = 'relative';       
	      
		canvas.width = nWidth;
		canvas.height = nHeight;      
	       
		if(yStep == 0){
		  let df =( height - 300)/steps;

		  this.height = nHeight - df;
		  this.width = nWidth - df * (width/height);
		  
		  canvas.style.height = nHeight - df + 'px';
		  this.width = nWidth -df * (width/height);
		  nWidth -= df * (width /height);
		  nHeight -= df;
		}else {
		    if(Math.max(nHeight,nWidth)> 300) {
		      let df = (width - 300)/steps;             

		      this.height = nHeight - df * (height/width);
		      this.width = nWidth -df ;
		      canvas.style.height = nHeight - df * (height/width)  + 'px';
		      canvas.style.width =(nWidth - df ) + 'px';

		      nHeight -= df * (height/width);
		      nWidth -= df;
		 }
		}
		

		let ctx = canvas.getContext('2d');
		ctx.drawImage(image,0,0,nWidth,nHeight);
	  
		canvas.style.left = (left - xStep) > 0 ? (left - xStep) + 'px' : 0;
		canvas.style.top = (top - yStep) > 0 ? (top - yStep) + 'px' : 0;

		top = (top - yStep) > 0 ? (top - yStep) : 0;
		left = (left -xStep) > 0 ? (left -xStep) : 0;       
	       
		document.getElementById('handi--container-preview').appendChild(canvas);
	   
		promise(time);
	      }

	      image.src = src;

	   },time)
	 }
	  
	 if (type == 'width')
	   promise(10);
	 else 
	   promise(1);
	 
	 }

	

	function play(){
	
		let prefix = 'play--';

		let model = Database.Video.getModel();
		

		M.body.innerHTML= '';

		let container = document.createElement('div');
		container.classList.add(prefix + 'video-player');
  
	        container.style.width = '100%';
	        container.style.height  = calculateHeight();
		

		let title = document.createElement('div');
		title.style.height = 40;
		title.style.width = "100%";
		title.innerHTML = model.title;

		title.classList.add(prefix + 'video-title');

		let description = document.createElement('div');
		description.style.height = 140;
		description.style.width = '100%';
		description.innerHTML = model.description;

		description.classList.add(prefix + 'video-description');



	        M.body.append(container); 
	
		M.body.append(title);				
		M.body.append(description);
		var video = document.createElement('video');
		video.controls  = true;
		container.appendChild(video);

		let url = getVideo(model.username,model.id,model.url);
		video.style.display = 'none';

		addSourceToVideo(video,url , 'video/webm');

			
			video.load();
			let  partitionSize = M.width;

			video.addEventListener('loadeddata',function(){
					let width  =this.videoWidth;
					let height = this.videoHeight;
					
					let containerHeight = calculateHeight();
				        
				if(width > height){

							let w = partitionSize;
							let h = height/width * partitionSize;

							if(h > containerHeight){
								h = containerHeight;
								w = width/height * h;
								let left=partitionSize- w;
								this.width = w;
								this.height = h;
								this.style.marginLeft = left/2;


							}else {
								this.style.width = partitionSize;
								this.style.height = height/width * partitionSize;
								let top = height/width * partitionSize;
								this.style.marginTop = (partitionSize - top)/2;

							}
														
					
				}else{

							this.style.height = partitionSize;
							this.style.width = width/height * partitionSize;
							let left = width/height * partitionSize;

							this.style.marginLeft = (partitionSize - left )/2;
					
				}
					this.style.display = 'block'
					this.play();

				})

				

			

	}
	
	function addSourceToVideo(element, src, type) {
	    var source = document.createElement('source');

	    source.src = src;
	    source.type = type;

	    element.appendChild(source);
	}

	function getVideo(username,id,name){
		let url  = site + '/files/' + username + '/' + id + '/' + name;
		console.log(url);
		return 	url;
	}



	let Controller = (function(){
		let prefix = 'play--';

		let routes = [];

		let route1 = {
		
			route : prefix + 'init',
			url : 'play',
			dependencies : ['main--init'],
			used : 0,
			data : true
		};

		let route2 = {
		
			route : prefix + 'video',
			url : 'play',
			dependencies : ['main--init'],
			used : 0,
			data : true
		};



	/*	R.registerEvent(prefix + 'completed');
		R.addEventListener(prefix + 'completed',function(e){
			console.log(e);
		});*/
		
		routes.push(route1);
		routes.push(route2);

		let Router = function(route){
			
			switch(route){
				case 'init':
					View.init();
					let model1 = Database.Show.Model();
					pushState({},'play','/'+model1.username + '/play/' + model1.id);
					break;
				case 'video':
					View.init();
					play();
					let model = Database.Video.getModel();
					pushState({},'viview','/'+model.username + '/play/'+model.id);
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

