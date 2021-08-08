
 let Home = ( function(){
	

	let step = 10;
	let direction;
	let prefix = "home--";
	let id = 'home';
	let parent ;
	let container;
	let mp;
	 let inited;
	 let M ;

	 let mainContainer;

	let View = {
		configure : function(){
			if(inited) return;	
			parent  = Main.Parts().body
			M = Main.Parts();
			mainContainer = document.getElementById('main--container');
				},
		init : function(){

		
			this.configure();
			this.template();	
			inited = 1;
	

		},
		template : function(){
			clear();
			setContainer();
			setSearchBar();
			setSuggestion();
			setMap();

		}
	
	}

	function clear(){
		console.log(M)	
		M.header.innerHTML = '';
		M.body.innerHTML = '';
		M.footer.innerHTML = '';
	}


	function setContainer(){
	
		let homeContainer = _cl('div');
		parent.append(homeContainer);

		container = homeContainer;
	//	homeContainer.style.width = config.width;
	//	homeContainer.style.height = config.height - 70;

		let parentContainer = parent;

	//	parentContainer.style.width = config.width;
	//	parentContainer.style.height = config.height - 70;
		homeContainer.classList.add(prefix);
	}

	function setSearchBar(){
		
		let searchContainer = _cl('div');
		searchContainer.classList.add(prefix + 'container-search');

		let filter = _cl('div');
		let filterImage = new Image();
		filterImage.src = getLink('filter.png');
		filterImage.classList.add(prefix + 'search-filterIcon');
		filter.append(filterImage);

		let search = _cl('div');
		let searchImage = new Image();
		searchImage.src = getLink('search.png');
		searchImage.classList.add(prefix + 'search-searchIcon');
		
		search.append(searchImage)

		let searchInput = _cl('div');
		searchInput.classList.add(prefix + 'search');
		searchInput.contentEditable = "true";
	
		searchInput.addEventListener('keydown',e=>{
			if(e.which === 13) alert("entr");
		})	


		let icons = _cl('div');
		icons.classList.add(prefix + 'search-icons');



		if(config.dir){
			icons.append(filter);
			icons.append(search);

			searchInput.style.direction = "rtl";
			searchContainer.append(icons);

			searchContainer.append(searchInput)
		}else{
	
			icons.append(search);

			icons.append(filter);
	
			searchInput.style.direction = "ltr";
			searchContainer.append(searchInput)
			searchContainer.append(icons);

		
		}

		container.append(searchContainer);
	}


	function setSuggestion(){
	
		let suggestion = _cl('div');
		suggestion.classList.add(prefix + 'suggestion');
		
		container.append(suggestion);
		
		_addHash(suggestion);

		if(config.dir)
			suggestion.style.direction = 'rtl';
		else 
			suggestion.style.direction = 'ltr';
	}


	function setMap(){
		let map = _cl('div');
		map.classList.add(prefix + 'map');
		map.id = prefix + 'map';	
		map.style.height = _calculateHeight();

	//	map.style.width = config.width;


		container.append(map);
  	        mp=L.map(map,{zoomControl : false}).setView([34.70815,46.45460], 10);


        	L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                         attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                   maxZoom: 18,
                   id: 'mapbox/streets-v11',
                   tileSize: 512,
                    zoomOffset: -1,
                      accessToken: 'pk.eyJ1IjoiMWlvMWwiLCJhIjoiY2psNThyd3luMGVsMjN4bnR3bXc4MXV2cyJ9.ks2qVsrV6d1rXu54-CyqIw'
                }).addTo(mp);
	         
		mp.on('moveend', ()=> { 
   			let data = {
				xmin : mp.getBounds().getSouthWest().lat,
				ymin : mp.getBounds().getSouthWest().lng,
				xmax : mp.getBounds().getNorthEast().lat,
				ymax : mp.getBounds().getNorthEast().lng,
				action : "getbound"
			}
		
			ws.send(JSON.stringify(data));


		});
		mp.on('click',function(e){console.log(e)})
                 new L.Control.Zoom({position:'bottomright'}).addTo(mp);

	}

	function mapmove(){
	
        	let json = Database.Home.mapmove().data;

              var myIcon = L.icon({
			    iconUrl:getLink('hl.png'),
			   
			    iconSize: [20,20],
                });


		for(let i = 0 ; i < json.length ; i++){
			
			
			latLng = L.latLng(json[i].x,json[i].y);
			let marker = new L.marker(latLng,{icon:myIcon}).addTo(mp).on('click',e=>{
				createThumb(json[i].id,e);	

			});
			

		}
	
			
	
	}

	function _getHashData(hash){

		let map = document.getElementById(prefix + 'map');
		 mp.setView([34.70915,46.45460], 15);

	//	ws.send(JSON.stringify({hash : hash , action : 'gethash'}));
	}

	 function createThumb(id,e){
		
		 let json = Database.Home.mapmove().data;
 	
		 let index =  json.findIndex(obj=>{

			return (obj.id == id);
		})

		switch(json[index].type){
		
			case 'article':
				thumbArticle(json[index]);
				break;
			case 'video':
				thumbVideo(json[index]);
				break;
			case 'gallery':
				thumbGallery(json[index]);
				break;
			default:
				break;
		}


		 return;

	 	
	 }

	 function thumbArticle(model){
	 	
		 
		 let thumbContainer = document.createElement('div');
		 thumbContainer.classList.add(prefix + 'article-map');

		 let title = document.createElement('div');
		 let username = document.createElement('div');
		 let thumb = document.createElement('div');
		 let description = document.createElement('div');
		
		title.id = prefix + 'article-header';
		 username.id = prefix + 'article-username';
		 description.id = prefix + 'article-description'
			
		title.innerHTML = "<h4>" + model.header + "</h4>";
		 username.innerHTML = model.username;
		description.innerHTML = model.description;	

		 let textContainer = document.createElement('div');

		 textContainer.classList.add(prefix + 'article-text');
		 textContainer.style.width = M.width  - 150;


		 textContainer.append(title);
		 textContainer.append(description);
		 textContainer.append(username);

		 let img = new Image();
	
	
		 thumb.classList.add('archive--archive-viewThumb');
		 username.style.height = 25;

			
		 thumb.appendChild(img);
		
		 img.src = getImage(model.username,model.id,model.url);

		 img.onload = function(){
		 
		 	let width =this.width ;
		     let height = this.height;

		     let portionX = this.width/this.height;
		     let portionY = this.height/this.width;

		     
		     thumb.style.width = 140; 
		     thumb.style.height = 140; 

		     if(width > height){
		       this.width = 140 ;
		       this.height = 140 *  portionY;
		       this.style.marginTop =(140 - (140 * portionY) )/2 + 'px';
		       
		     }else {
		       this.height = 140 ;
		       this.width = 140 * portionX;
		       this.style.marginLeft = (140 - (140 * portionX))/2 + 'px';
		     }
	
			this.style.padding = 10;
		 }

	     
		
		thumbContainer.addEventListener('click',function(){
			this.remove();
			R.dispatchEvent('article-init',{id : model.id,username : model.username});
			//	     ws.send(JSON.stringify({id : id,action:'model'}));

		})
		
		
		 thumbContainer.append(thumb);
		 thumbContainer.append(textContainer);
		 mainContainer.append(thumbContainer);
		

		 if(!config.dir){
		 	thumb.style.float = 'left';
			 textContainer.style.float = 'left'
		 }


		 thumbContainer.addEventListener('click',function(){
		 	
			 __slideUp(this,10,140,0);
		//	 this.remove();

		 })

		 __slideDown(thumbContainer,10,140,-140)


	 }

	 function getVideo(username,id,url){
	 	return site + '/files/' + username + '/' + id + '/' + url;
	 }

	 function thumbVideo(model){
	 	
		 console.log(model);
		 
		 let thumbContainer = document.createElement('div');
		 thumbContainer.classList.add(prefix + 'gallery-map');

		 let title = document.createElement('div');
		 let username = document.createElement('div');
		 let thumb = document.createElement('div');
		 let description = document.createElement('div');

	
		title.id = prefix + 'article-header';
		 username.id = prefix + 'article-username';
		 description.id = prefix + 'article-description'

		title.innerHTML = "<h3>" +  model.title +  "</h3>";
		 username.innerHTML = model.username;
		description.innerHTML = model.description;	

		 let textContainer = document.createElement('div');

		 textContainer.classList.add(prefix + 'gallery-text');
		
		 textContainer.style.width = M.width  - 160;


		 textContainer.append(title);
		 textContainer.append(description);
		 textContainer.append(username);

		 let video = document.createElement('video');
	         let source = document.createElement('source');
	   


	        
		source.src = getVideo(model.username,model.id,model.url); 
 
	        video.appendChild(source);
	 		  
		let canvas = _cl('canvas');

		 thumb.appendChild(canvas);
		thumb.append(video);
	
	
		video.load();		
					
		video.style.display = 'none'


		video.addEventListener('loadeddata',function(){
			let width  =this.videoWidth;
			let height = this.videoHeight;
			let partitionSize = 140;		

			canvas.width = width;
			canvas.height = height;
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
			this.remove();
		})



	
		 thumb.classList.add('archive--archive-viewThumb');
	
		
			
    	
		 thumbContainer.append(thumb);
		 thumbContainer.append(textContainer);
		 mainContainer.append(thumbContainer);
		

		 if(!config.dir){
		 	thumb.style.float = 'left';
			 textContainer.style.float = 'left'
			 textContainer.style.marginLeft = 10;
		 }


		 thumbContainer.addEventListener('click',function(){
			this.remove();
			 ws.send(JSON.stringify({action : 'mvideo',id : model.id}));
		 })

		 __slideDown(thumbContainer,10,140,-140)


	 }
	
	 function thumbGallery(model){
	 	
		 
		 let thumbContainer = document.createElement('div');
		 thumbContainer.classList.add(prefix + 'gallery-map');

		 let title = document.createElement('div');
		 let username = document.createElement('div');
		 let thumb = document.createElement('div');
		 let description = document.createElement('div');

	
		title.id = prefix + 'article-header';
		 username.id = prefix + 'article-username';
		 description.id = prefix + 'article-description'

		title.innerHTML = model.title;
		 username.innerHTML = model.username;
		description.innerHTML = model.description;	

		 let textContainer = document.createElement('div');

		 textContainer.classList.add(prefix + 'gallery-text');

		textContainer.style.width = M.width  - 160;

		 textContainer.append(title);
		 textContainer.append(description);
		 textContainer.append(username);

		// title.style.textAlign= 'center';
		// username.style.textAlign = 'center';

		 let img = new Image();
	
	
		 thumb.classList.add('archive--archive-viewThumb');
		 username.style.height = 25;
		 title.style.height = 25;
			
		 thumb.appendChild(img);
		
		 img.src = getImage(model.username,model.id,model.url);

		 img.onload = function(){
		 
		 	let width =this.width ;
		     let height = this.height;

		     let portionX = this.width/this.height;
		     let portionY = this.height/this.width;

		     
		     thumb.style.width = 140; 
		     thumb.style.height = 140; 

		     if(width > height){
		       this.width = 140 ;
		       this.height = 140 *  portionY;
		       this.style.marginTop =(140 - (140 * portionY) )/2 + 'px';
		       
		     }else {
		       this.height = 140 ;
		       this.width = 140 * portionX;
		       this.style.marginLeft = (140 - (140 * portionX))/2 + 'px';
		     }
	
			this.style.padding = 10;
		 }

	     
		
		thumbContainer.addEventListener('click',function(){
						
	//	     ws.send(JSON.stringify({id : id,action:'model'}));

		})
		
		
		 thumbContainer.append(thumb);
		 thumbContainer.append(textContainer);
		 mainContainer.append(thumbContainer);
		

		 if(!config.dir){
		 	thumb.style.float = 'left';
			 textContainer.style.float = 'left';
			 textContainer.style.marginLeft = 10;
		 }


		 thumbContainer.addEventListener('click',function(){
			this.remove();
			 ws.send(JSON.stringify({action : 'show',id : model.id}));
		 })

		 __slideDown(thumbContainer,10,140,-140)


	 }
	

	 function getImage(username,directory,filename){
	 	return site + '/files/' +  username + '/' + directory + '/thumb/' + filename; 
	 }

	function _hashClick(model){

	
		if(document.getElementsByClassName(prefix + 'description').length >  0)
			document.getElementsByClassName(prefix + 'description')[0].remove();
	
		let hashDescription = _cl('div');
		hashDescription.classList.add(prefix + 'description');
		container.append(hashDescription);	
		//_l('container').append(hashDescription);	



		let info = _cl('div');

		info.classList.add(prefix + 'description-info');
		
	
		let text = _cl('div');
		text.classList.add(prefix + 'description-text');
		
		text.innerHTML = model.header;
		hashDescription.append(text);
        	hashDescription.append(info);
		


		let profilename = _cl('div');
		profilename.classList.add(prefix + 'description-infoName');

		profilename.innerHTML = '@' + model.username;

		let more = _cl('div');
		more.classList.add(prefix + 'description-more');

		more.innerHTML = "More ..";

		info.append(profilename);

		text.append(more);
	

		more.addEventListener('click',function(e){
		
			ws.send(JSON.stringify({
				hash : Database.Home.popup().hash,
				action : 'hash'
			}))	
		})

		profilename.addEventListener('click',function(e){
	
			ws.send(JSON.stringify({
				username : Database.Home.popup().username,
				action : 'profile'
			}))
		}
		)

		hashDescription.addEventListener('click',()=>{
		
			__slideUp(hashDescription,10,114,0);
		})


		if(config.dir){
			text.style.borderLeft='none';
			text.style.borderRight = '2px solid black';
			hashDescription.style.direction = 'rtl';
			more.style.left = 0;
			
		}else{
			more.style.right = 0;
		}

		__slideDown(hashDescription,10,114,-114)
		
	}



	function _addHash(container){
		let hashes = ['cooking','driving','something','else'];


		for(let i = 0 ; i < hashes.length ;i++){
		
			let span = _cl('span');
			span.classList.add(prefix + 'hash');
			span.innerHTML = '#' +  hashes[i];

			container.append(span);
		}
	}


	function _calculateHeight(){
	
		let total = config.height;
		return (total - (120 + 50 + 20 + 20));
	}
	

	let __slideUp = function(container,time,remains,top){
	
		
		setTimeout(function(){
				

			if(remains ==  0 ) {
					container.remove()
					step = 10; 				
					return;
		       
			};
			


			console.log(remains,top);
			if(remains < step) 
				step = remains;

			container.style.top = top -step ;
			
			__slideUp(container,time,remains -step,top - step);			
		
		},time);
	
	}


	let __slideDown = function(container,time,remains,top){
	
		
		setTimeout(function(){
				

			if(remains ==  0 ) {

					step = 10; 				
		 			return;
                       
			};
			
			if(remains < step) 
				step = remains;

			container.style.top = top+step ;
			
			__slideDown(container,time,remains -step,top +step);			
		
		},time);
	}



	let Controller = (function(){
		let init = prefix  + 'init';
		let map = prefix + 'mapmove';

		let route1 = {
			route : init,
			url : '',
			used : 0,
			dependencies : ['main--init']

		};

		let route2 = {
		
			route : map,
			url : 'adfkj',
			used : 0,
			dependencies : []
		}

		let route3 = {
		
			route : prefix + 'popup',
			url :  '',
			used : 0,
			dependencies : []
		}

		let routes =  [];
		routes.push(route1);
		routes.push(route2);
		routes.push(route3);


		let Router = function(route){
			
			switch(route){
			
				case 'init':
					View.init();
					pushState({},'home','/');
					break;
				case 'mapmove':
					mapmove();
					break;
				case 'popup':
					_hashClick();
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

})();


