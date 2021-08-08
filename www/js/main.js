

let Main = (function(){
	let prefix = 'main--';
	let container,body,header,footer;
	let inited;
	let width ;
	let height;
	let isBasket = 0;
	let View = {
	
		configure : function(){
	
			width = (config.width > 800) ? 800 : config.width -10 ;

		
			height = config.height
		},
	
		init : function(){  
			
			if(inited) return clear();
			inited = 1;
			this.configure();
			this.template();


			
		
		},
		template : function(){
			createMainContainer();
			createHeader();
			createBody();
			createFooter();

			_menu();
		}
	}

		
	function clear(){
		header.innerHTML = '';
		body.innerHTML = '';
		footer.innerHTML = '';
		body.style.display = 'block';

		let board = document.getElementById('article--board');

		let editing = 	document.getElementById('editor--editing');
		let imenu = 	document.getElementById('editor--imenu-container');

		
		if(typeof(board) != 'undefined' && board != null) board.remove();
		if(typeof(editing) != 'undefined' && editing != null) editing.remove();
		if(typeof(imenu) != 'undefined' && imenu != null) imenu.remove();

	}


	function createMainContainer(){
		
		container = document.createElement('div');
		container.classList.add(prefix + 'container');
		container.id = prefix + 'container';

		container.style.width = width;
		
		container.style.height = height;

		document.body.append(container);
	}

	function createHeader(){
	      
	       header = document.createElement('div');
               header.classList.add(prefix + 'header');
	       header.style.height = config.header;
		
	       container.append(header);	
	};

	function createBody(){
	
		 body = document.createElement('div');

		body.classList.add(prefix  + 'body');
		body.style.height = config.height - (config.footer + config.header);
		container.append(body);
	}


	function createFooter(){
	
		footer = document.createElement('div');
		footer.classList.add(prefix + 'footer');
	
		footer.style.height = config.footer
		container.append(footer);
	}
	
	function main(){
		return {
			header : header,
			body : body,
			footer : footer,
			width : width,
			height : height,
			createMenu : createMenu,
			clear : clear
		}
	}
	
	
	function _expand_menu(e){

	    let target = e.target;
	    let wHeight = window.innerHeight;
	    let wWidth = window.innerWidth;
	    let menuHeight = 1/3 * wHeight-40;
	    let ratio = wWidth/200;
	    let steps = (140 + 40 + 30)/10;  
	    let width,height = 0;

	    let iterate = function() { setTimeout(function(){
	       
	    if( width >( window.innerWidth )){
	       _create_menu(window.innerWidth,height);
		return;
	    } 

	    let prev =  document.getElementById(prefix + 'menu');
	    width = prev.width;
	    height = prev.height;
	    prev.remove();      
	   
	   let canvas  = document.createElement('canvas');
	   if(height < 220)
	     height += 10;
	   width +=ratio * 10
	   canvas.id = prefix + 'menu';
	   canvas.width = width ;
	   canvas.height = height ;
	   canvas.style.top =( window.innerHeight - height) + 'px';
	   canvas.style.right = 0;
	   let ctx = canvas.getContext('2d');
	   ctx.beginPath();
	 //  ctx.lineWidth = 20/100 * width;
	  // ctx.strokeStyle = 'darkslategrey';
	   ctx.rect(0,0,width,height);
	   ctx.fillStyle = '#333'
	   ctx.fill();
	   ctx.stroke(); 

	   document.body.appendChild(canvas);

	   iterate();        

	    },5)

	  }

	iterate();
	}

	function _menu (e){
	   let color ;

	   if(e) {
	     color = 'green';
	     document.getElementById(prefix + 'menu').remove();
	    }
	   else 
	     color = 'white';

	   let canvas  = document.createElement('canvas');

	   canvas.id = prefix + 'menu';
	   canvas.width = 40;
	   canvas.height = 40;
	   canvas.style.top =( window.innerHeight - 40) + 'px';
	   canvas.style.right = 0;
	   let ctx = canvas.getContext('2d');
	   ctx.beginPath();
	   ctx.lineWidth = '25';
	   ctx.strokeStyle = '#333';
	   ctx.rect(0,0,40,40);
	   ctx.fillStyle = color;
	   ctx.fill();
	   ctx.stroke();  

	   canvas.addEventListener('click',_expand_menu); 
	   document.body.appendChild(canvas);
	}

	function _create_menu(width,height){
	  let div = document.createElement('div');
	  div.style.width = width + 'px';
	  div.style.height = height+ 'px';
	  div.id = prefix + 'menu-footer';
	  div.style.top = (window.innerHeight - height) + 'px';
	  div.style.right = 0;


	  let footer = document.createElement('div');
	  if(isMobile()){
	   footer.style.width = config.width + 'px';
	  }else
	  footer.style.width = config.width + 'px';
	  footer.style.height = 40 + 'px';
	  footer.style.borderTop = "1px solid #332d2d";
	    
	  
	  footer.style.position = 'relative'
	  //footer.style.top =( height -30) + 'px';
	  footer.style.marginLeft = 'auto';
	  footer.style.marginRight = 'auto';
	  
	  let links = document.createElement('div');
	   links.id = prefix + 'footer-links'; 

	  let menu = ['home','login','about'];
	   
	    
	  for(let i = 0 ; i < menu.length ; i++){
	     
	    let span = document.createElement('span');
	    span.innerHTML = menu[i];
	    span.classList.add(prefix + 'footer-footerItem');
	    let border = document.createElement('span');
	    border.classList.add(prefix + 'footer-border',prefix + 'footer-footerItem');
	    links.appendChild(span);
	   // links.appendChild(border);
	  
	  }

	  let details = document.createElement('div');
	  details.id = prefix + 'footer-details';
	  if(isMobile()){
	  //  details.style.width = View.config.mainWidth + 'px';
	  }else
	  details.style.width = config.width;
	  details.style.height = 40 + 'px';
	  //_create_model_basket_buttons(details);
	  let basketContent = document.createElement('div');
	  basketContent.id = prefix + 'basket';
	  basketContent.style.width = config.width + 'px';
	  basketContent.style.height = 140 + 'px';
	   
	  footer.appendChild(links);
 	 _create_model_space_buttons(details);
	  fill_basket_thumbs();

	  div.appendChild(details);
	  div.appendChild(basketContent);
	  div.appendChild(footer);
	  document.body.appendChild(div);
	  
	}


	function _create_model_space_buttons(parent){
		let prefix = 'handi--';
	      let buttonContainer = document.createElement('div');
	     buttonContainer.classList.add(prefix + 'container-spaceContainer');

	     let article = document.createElement('div');
	     let gallery = document.createElement('div');
	     let video = document.createElement('div');


	    // .classList.add(prefix + 'container-spaceCart');
	     article.innerHTML = '+article' ;
	     gallery.innerHTML =  '+gallery';
	     video.innerHTML = '+video';
		
		article.addEventListener('click',function(e){
			remove_menu().then(_=>{
				App.route("editor--init");

			});
	
		})

		
		video.addEventListener('click',function(e){
	
			remove_menu().then(_=>{
				App.route("video--init");

			});
	
		})

		
		gallery.addEventListener('click',function(e){

			remove_menu().then(_=>{
				App.route("upload--init");

			});

		})


	     buttonContainer.appendChild(article);
	     buttonContainer.appendChild(gallery);
	     buttonContainer.appendChild(video);


	     Array.from(buttonContainer.children).forEach((child,index)=>{
	       child.classList.add(prefix + 'container-spacebtns') ;
		     child.style.borderTop = 'none';
		     
	  /*     child.addEventListener('mouseenter',_handle_upload_btns_mouseenter.bind(child));
	       child.addEventListener('mouseleave',_handle_upload_btns_mouseleave.bind(child)); */
	     })
/*
	     remove.addEventListener('click',function(){
	
			//Database.Basket.Remove(Database.Show.Model());
	      });
*/

		let n = new Image();

		n.src = getLink('ne.png');
			
		
		n.classList.add(prefix + 'basket-next');
		n.id = prefix + 'basket-next';

		let b = new Image();
		b.src = getLink('be.png');
		b.classList.add(prefix + 'basket-back');
		b.id = prefix + 'basket-back';

		parent.append(n);
		parent.append(b);


	//     details.style.borderTop = '2px solid black';
	     parent.appendChild(buttonContainer);

  }


	function remove_menu(){
		let footer = document.getElementById('main--menu-footer');
		let style = window.getComputedStyle(footer);

		let top = style.getPropertyValue('top');
		let topInt = parseInt(top);
		console.log(topInt);
		document.getElementById('main--menu').remove();
		
		return new Promise(function(resolve){
				
			function delay(remain){
		

				if(remain == 220){
					footer.remove();
					_menu();
					resolve("done");
	
				} 
			
				else {
					
					footer.style.top = remain + topInt;
					setTimeout(function(){delay(remain+20)},20)
	
				} 
					
			}
			setTimeout(function(){delay(20)},20)
	
		})
	
	}

	function fill_basket_thumbs(){
		
		let models = Database.Basket.Get();
	

		models.forEach(model=>{
	
			_load_file(model.urls[0].url);
		})


	}

	function show_thumbs(){
	
/*		let model = Database.Show.Model();
		
		console.log(model);
		model.urls.forEach(url=>{
			_load_file(url.url);
		})
*/
//		_preview_firstone(model.urls[0].url);

	}
	 function _load_file(url){
		  
		 let image = new Image();
		  image.mSize = 100;
		  image.dSize = 100;
		  image.addEventListener('load',_load_template_for_thumb);
		  image.src =  getImage(url);

		  image.name = url;
		  image.filename = url;
		  
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
		    height = parseInt(mSize*(height/width));
		    width = mSize;
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
	 	  ctx.drawImage(image,0,0,width,height);
	 
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
	  preview.classList.add(prefix + 'container-thumbs');
	  canvas.style.borderBottom = '2px solid green';

	  if(image.filename)
	     canvas.addEventListener('click',_preview_file);
	  
	 

	 document.getElementById(prefix + 'basket').appendChild(preview);
	}

	
	function prepareContainer(){
		
		isBasket = 1;	

	
		let container = document.createElement('div');
		container.id = prefix + 'contaienr';	
		container.classList.add(prefix + 'container');
		container.style.width = width;
		container.style.height = config.height - (config.footer+140 + 40 );
		let header = document.createElement('div');
		header.id = prefix + 'header';

		header.classList.add(prefix + 'header');
		header.style.height = config.header;
	
		let close = document.createElement('div');
		close.classList.add(prefix + 'header-backHome');
		let image = new Image();
		image.classList.add(prefix + 'header-closeImg');
		image.src = getLink('close.png');
		close.addEventListener('click',_=>{
			
			container.remove();
			document.getElementById(prefix + 'menu').remove();
			document.getElementById(prefix + 'menu-footer').remove();
			isBasket = 0;
			_menu();
			//ws.send(JSON.stringify({username : 'naro',action : 'archive'}));	
		});

		close.append(image);
	
		let username = document.createElement('div');

		username.innerHTML = 'naro';

		username.classList.add(prefix + 'username');
		username.addEventListener('click',Menu);
	
		header.append(close);
		header.append(username);

		let body = document.createElement('div');
		body.id = prefix + 'body';
		body.classList.add(prefix + 'body');
		body.style.height = config.height - (config.footer + config.header + 140 +40 );
		
		container.append(header);
		container.append(body);


		document.body.append(container);
	}


	
	function Menu(){
/*		let items = ['Articles','Gallery','Videos','About','Statistic'];	
		let menu = createMenu();
	
		for(let i = 0; i < items.length ; i++){
		
			let item = document.createElement('div');
			item.innerHTML = items[i];
			item.classList.add(prefix + 'menu-item');
			menu.append(item);

			item.addEventListener('click',function(){
				getpage(this.innerHTML);

			})
		}
*/	
	}

	function getpage(page){
	
		switch(page) {
		
			case 'Articles' : 
				ws.send(JSON.stringify({username : 'naro',action : 'article'}));
				break;
			case 'Gallery': 
				ws.send(JSON.stringify({username : 'naro',action : 'gallery'}));
				break;
			case 'Videos':
				ws.send(JSON.stringify({username : 'naro',action : 'video'}));
				break;
			default:
				break;


		}
	}



	function _preview_file(e){
	
		
		if(!isBasket ) 
			prepareContainer();
		

		document.getElementById(prefix + 'body').innerHTML = '';
		let canvas = e.target;

	   let image = new Image();
	   image.gallery = canvas.gallery;
	   image.name = canvas.name;
	   image.mSize = parseInt(config.width);
	   image.dSize =parseInt(config.height -260 - 20);
	   image.pType = 'file';
	   image.addEventListener('load',_load_template_for_show);
	   image.src = canvas.src;
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
	   
	   document.getElementById('basket--body').innerHTML = '';
	   document.getElementById('basket--body').appendChild(preview);
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
		
		let elem = document.getElementById('basket--body');
		
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
		  let elem = document.getElementById('basket--body').firstChild;
		  elem.style.float = 'left';
		show_details(el);
		  return;
	      }          
		
	      let image = new Image();
	      image.onload = function(){
		document.getElementById('basket--body').innerHTML = '';        

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
	       
		document.getElementById('basket--body').appendChild(canvas);
	   
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



	function createMenu(){
		
		let prefix = 'handi--'
		let menu = document.createElement('div');
	

		let items = ['Articles','Gallery','Videos','About','Statistic'];	
		
	
		
		body.append(menu);
		let shadow = document.createElement('div');
		shadow.classList.add('handi-shadow');
		document.body.append(shadow);
		
		menu.addEventListener('click',function(e){
			e.stopPropagation();
		});

		shadow.addEventListener('click',_=>{
			menu.remove();
			shadow.remove();
		});

		menu.classList.add(prefix + 'user-menu');
		
		shadow.style.width = window.innerWidth;
		shadow.style.height = window.innerHeight;

		if(!config.dir){
			menu.style.right = 0;
		}
		for(let i = 0; i < items.length ; i++){
		
			let item = document.createElement('div');
			item.innerHTML = items[i];
			item.classList.add(prefix + 'menu-item');
			menu.append(item);
			item.addEventListener('click',function(){
				getpage(this.innerHTML);

			menu.remove();
			shadow.remove();
	
		})
			
		}

		return menu;
	}


	let Controller = (function(){
	
		let routes = [];

		let route1 = {
		
			route : prefix + 'init',
			url : '',
			dependencies : [],
			used : 0
		};

		routes.push(route1);

		let Router = function(route){
			
			switch(route){
				case 'init':
					View.init();
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


	return { 
		Parts : main
	}


})();



