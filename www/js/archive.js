Archive = (function(){
	

	let prefix = 'archive--';
	let M;
	let ps;
	let articleBoard;
	let inited = false;
	let View = {
	
		configure : function(){
			M = Main.Parts();

		},
		init : function(){
			this.configure();
			this.template();
		},
		template : function(){
			M.clear();
			createHeader();	
			createContainer();	
						
		}
	}

	
function createHeader(){
	
		let prefix = 'handi--'; 	
		let home = document.createElement('div');
		home.classList.add('handi--header-backHome');
		let image = new Image();
		image.classList.add('handi--header-backHomeImg');
		image.src = getLink('map.png');
		home.addEventListener('click',_=>{
			ws.send(JSON.stringify({username : 'naro',action : 'archive'}));	
		});
		
		M.header.classList.remove('noborder');
		let username = document.createElement('div');

		username.innerHTML = 'naro';

		username.classList.add(prefix + 'username');
		username.addEventListener('click',M.createMenu);
		home.appendChild(image);

		M.header.append(home);
		M.header.append(username);
	}

	function createContainer (){
	
		articleBoard = document.createElement('div');
		articleBoard.id = prefix + 'board';
		articleBoard.style.height = config.height - config.footer - config.header;
		articleBoard.style.width = M.width;
		
		
		M.body.append(articleBoard);

	         ps = new PerfectScrollbar(articleBoard,{suppressScrollX : true});
	
	
	}

	function articleArchive(){
	
	   	let models = Database.Archive.Models();
			

		models.forEach(model=>{
			_showModel(model);
			ps.update();
		})
	
	}


	function _showModel(model){
		
		let container = document.createElement('div');
		container.classList.add(prefix + 'article');

		let header = document.createElement('div');
		header.classList.add(prefix + 'header');

		header.innerHTML = model.header;

		let description = document.createElement('div');
		description.classList.add(prefix + 'description');

		description.innerHTML = model.description;


		let image = new Image();


		image.classList.add(prefix + 'img');


		image.src = geturl("naro",model.id,model.urls[0].url);
		let partitionSize = 50; 

		
		image.onload = function(){ 
			
			let width = this.width;
			let height = this.height;

			if(width > height){
				this.width = partitionSize;
				this.height = height/width * partitionSize;
				
			}else {
				
				this.height = partitionSize;
				this.width = width/height * partitionSize;
		
			}

			container.append(this);
		
		}	

		let textContainer = document.createElement('div');

		textContainer.classList.add(prefix + 'textContainer');


		textContainer.append(header);
		textContainer.append(description);
		
		container.append(image);
		container.append(textContainer);

		articleBoard.append(container);

		header.addEventListener('click',_=>{
			M.body.style.display = 'none';
			R.dispatchEvent('article-init',{username : 'naro',id : model.id});
			
		})

	} 

	function loadImage(imageName){
	
		let image = new Image();
		image.src = geturl("naro",id,imageName);
		let partitionSize = 50; 

		
		image.onload = function(){ 
			
			let width = this.width;
			let height = this.height;

			if(width > height){
				this.width = partitionSize;
				this.height = height/width * partitionSize;
				
			}else {
				
				this.height = partitionSize;
				this.width = width/height * partitionSize;
		
			}
	
		}				
					
	}

	function geturl(user,id,name){
	
		let data_file = site + '/files/' +user + '/'+id+'/thumb/' + name;

		return data_file;

	}
	
	

	function galleryArchive(){
	
		showModels();	
	}
	
	function videoArchive(){
	
		//clearContainer();
		showVideos();
	}


	function showVideos(){
	
		let models = Database.Archive.Videos();

		console.log(models);
		models.forEach(model=>{console.log(model)

			_add_video_to_archive(model).then(view=>{
				articleBoard.append(view);
				ps.update();
			})

		})

	}


	function _add_video_to_archive(model){
		

		let container = document.createElement('div');
		container.classList.add(prefix + 'video-container');

		let videoContainer = document.createElement('div');
		videoContainer.classList.add(prefix + 'video-video');


		let title = document.createElement('div');
		title.classList.add(prefix + 'video-title');
		
		let play = new Image();
		play.src = getLink("play.png");
		play.classList.add(prefix + 'video-play');
		videoContainer.append(play);

		title.innerHTML = model.title;

		
		container.append(videoContainer);
		container.append(title);
		
		
		
		
		let video = document.createElement('video');
		let source = document.createElement('source');
		let canvas = document.createElement('canvas');
	
		
		canvas.addEventListener('click',function(){
			ws.send(JSON.stringify({action:"mvideo",id:model.id}));
		})




		return new Promise(resolve=>{

			video.append(source);
			source.src = getUrl('naro',model.id,model.urls[0].url);
			
			video.load();
			let  partitionSize = 300;

			video.addEventListener('loadeddata',function(){
					let width  =this.videoWidth;
					let height = this.videoHeight;
					

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


				     	videoContainer.append(canvas);

					resolve(container);

				})

			})	

		
	   
	}


	function showModels(){

		let models = Database.Archive.Models();
		models.forEach(model=>{console.log(model)

			_add_model_to_archive(model).then(view=>{
				articleBoard.append(view);
				ps.update();
			})

		})

	}
	
	function getUrl(username,id,name){
	
		return site + '/files/' + username + '/' + id + '/' + name;
	}

	function _add_model_to_archive(model){
		let prefix = 'handi--';
	      let view = document.createElement('div');
	      let container = document.createElement('div');
	      let thumb = document.createElement('div');
	      let details = document.createElement('div');

	     view.classList.add(prefix + 'archive-view');
	     container.classList.add(prefix + 'archive-viewContainer');
	     thumb.classList.add(prefix + 'archive-viewThumb');
	     details.classList.add(prefix + 'archive-viewDetails');
		console.log(model.urls[0]);
	     let image = new Image();

		image.src = getUrl('naro',model.id,model.urls[0].url);

		return new Promise(resolve =>{
			image.onload = function(){
				let width =this.width ;
			     let height = this.height;

			     let portionX = this.width/this.height;
			     let portionY = this.height/this.width;

			      thumb.appendChild(this);


				if(isMobile()){

				     view.style.width = 350 ;
				     view.style.height = 250;
				     thumb.style.width = 150;
				     thumb.style.height = 150;


				}else {
				     view.style.width = 450 ;
				     view.style.height = 250;
				     thumb.style.width = 250;
				     thumb.style.height = 250;

				}

			     let detailsContainer = document.createElement('div');

			     let gallery = document.createElement('div');
			     let description = document.createElement('div');
			     let price = document.createElement('div');

			     gallery.innerHTML = model.title;
			     description.innerHTML = model.text;
			     price.innerHTML = 500;


			     gallery.classList.add(prefix + 'archive-viewDetail');
			     description.classList.add(prefix + 'archive-viewDetail');
			     description.classList.add(prefix + 'archive-viewDesc');

			     price.classList.add(prefix + 'archive-viewDetail');

			     detailsContainer.appendChild(gallery);
					     detailsContainer.appendChild(price);
			     detailsContainer.style.paddingLeft = 10;

			     details.appendChild(detailsContainer);

				details.style.width = 200;
			      details.style.height = 250;


				if(isMobile()){
					if(width > height){
						 detailsContainer.style.width = 200 -10;

						image.width = 150 ;
					       image.height = 150 *  portionY;
					       image.style.marginTop =(150 - (150 * portionY) )/2 + 'px';
					       detailsContainer.style.marginTop = (150 - (150*portionY))/2 + 'px';
				     }else {
					       image.height = 150 ;
					       image.width = 150 * portionX;
					       image.style.marginLeft = (150 - (150 * portionX))/2 + 'px';
				     }

				}else{
					if(width > height){
					       image.width = 250 ;
					       image.height = 250 *  portionY;
					       image.style.marginTop =(250 - (250 * portionY) )/2 + 'px';
					       detailsContainer.style.marginTop = (250 - (250*portionY))/2 + 'px';
				     }else {
					       image.height = 250 ;
					       image.width = 250 * portionX;
					       image.style.marginLeft = (250 - (250 * portionX))/2 + 'px';
				     }

				 detailsContainer.appendChild(description);


				}


				this.addEventListener('click',function(){

					     ws.send(JSON.stringify({id : model.id,action:'show'}));

				})
			     details.addEventListener('click',function(e){

						 this.style.position = 'relative';
				 e.preventDefault();
				 e.stopPropagation();
				 if(this.left){
				    this.left = 0;
				    //$(image).animate({opacity : 1},200)
				    //$(this).animate({left : 0},200)
				 }
				 else {
				    this.left = 1;
				    //$(image).animate({opacity : 0.3},200);
				    //$(this).animate({left : '-=260px'},200);
				 }
			     })
			     container.appendChild(thumb);
			     container.appendChild(details);
			     view.appendChild(container);
				resolve(view);
			}
		})
	   }



	let Controller = (function(){

		let routes = [];

		let route1 = {
		
			route : prefix + 'article',
			url : 'archive',
			dependencies : ['main--init'],
			used : 0,
			data : true
		};
		
		let route2 = {
		
			route : prefix + 'gallery',
			url : 'archive',
			dependencies : ['main--init'],
			used : 0,
			data : true
		};
		
			
		let route3 = {
		
			route : prefix + 'video',
			url : 'archive',
			dependencies : ['main--init'],
			used : 0,
			data : true
		};


		routes.push(route1);
		routes.push(route2);	
		routes.push(route3);


		let Router = function(route){
			
			switch(route){
				case 'article':
					View.init();
					articleArchive();
					pushState({},"archive","/naro/archive/article");
					break;
				case 'gallery':
					View.init();
					galleryArchive();
					pushState({},"archive","/naro/archive/gallery");

					break;
				case 'video' : 
					View.init();
					videoArchive();
					pushState({},"archive","/naro/archive/video");

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
})()
