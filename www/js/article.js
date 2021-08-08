
let Article = (function(){
	
	let M;
	let fullSize;
	let mediumSize;
	let prefix = 'article--'	
	let id;
	let articleBoard;
	let ps;

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
			M.clear();	
			createContainer();
			//console.log(Database.Article.getModels());

		}
	}
	

	function createContainer (){
	
		articleBoard = document.createElement('div');
		articleBoard.id = prefix + 'board';
		articleBoard.style.height = config.height - config.footer;
		articleBoard.style.width = config.width;
		
		
		document.body.append(articleBoard);

	         ps = new PerfectScrollbar(articleBoard,{suppressScrollX : true});
	
	
	}

	function _showArticle(article){
           
		_iterate(article)
		/*	
		let i = 0; 
		
		do{
			display(article[i]);
			i++;
		}while(article[i])*/
	}

	
	function _iterate(article){
	
		let iterate = function(i){
			if(article[i]){
					
					if(article[i].type =='img'){
					
								
						let imageContainer = document.createElement('div');
						
						let imageType = article[i]['strech'];
						let imageName = article[i]['name'];
				
						let image = new Image();
						image.src = geturl("naro",id,imageName);
						let partitionSize = (imageType == 'fullscreen') ? fullSize : mediumSize;
				
				
						image.classList.add(prefix + imageType);	
					
						
						image.onload = function(){ 
							
							let width = this.width;
							let height = this.height;

							if(width > height){
								this.width = partitionSize;
								this.height = height/width * partitionSize;
								imageContainer.style.width = this.width;
								imageContainer.style.height = this.height;
							}else {
								
								this.height = partitionSize;
								this.width = width/height * partitionSize;
								imageContainer.style.width = this.width;
								imageContainer.style.height = this.height;

							}
						
							imageContainer.append(this)
							
							if(partitionSize == window.innerWidth)
								imageContainer.classList.add(prefix + 'fullscreen');
							else 
								imageContainer.classList.add(prefix + 'medium');
							articleBoard.append(imageContainer);
							ps.update();	
							iterate(++i);
						}				
							
				}	
				else {
					display(article[i]);
					iterate(++i);
				}

			}	

		}

		iterate(0);
	}

	function display(article){
		console.log(article)	
		switch(article.type){
			case 'img':
				showImage(article);
				break;
			case 'caption':
				showCaption(article);
				break;
			case 'text':
				showText(article);
				break;
			default:
				break;
		}
	}
	

	function geturl(user,id,name){
	
		let data_file = site + '/files/' +user + '/'+id+'/desktop/' + name;

		return data_file;

	}

	function showImage(article,resolve){
			let imageContainer = document.createElement('div');
			
			let imageType = article['strech'];
			let imageName = article['name'];
	
			let image = new Image();
			image.src = geturl("naro",id,imageName);
			let partitionSize = (imageType == 'fullscreen') ? fullSize : mediumSize;
	

		image.classList.add(prefix + imageType);	
		
			
			image.onload = function(){
				
				let width = this.width;
				let height = this.height;

				if(width > height){
					this.width = partitionSize;
					this.height = height/width * partitionSize;
					imageContainer.style.width = this.width;
					imageContainer.style.height = this.height;
				}else {
					
					this.height = partitionSize;
					this.width = width/height * partitionSize;
					imageContainer.style.width = this.width;
					imageContainer.style.height = this.height;

				}
			
				imageContainer.append(this)
				
				if(partitionSize == window.innerWidth)
					imageContainer.classList.add(prefix + 'fullscreen');
				else 
					imageContainer.classList.add(prefix + 'medium');
				articleBoard.append(imageContainer);
				ps.update();	
				res
			}			
	}

	function showCaption(article){
		let caption = document.createElement('div');
		caption.innerHTML = article.html;
		caption.classList.add(prefix + 'caption');
		caption.style.width = mediumSize;
		
		articleBoard.append(caption);

		ps.update();

	}

	function showText(article){
		let text = document.createElement('div');
		text.innerHTML = article.html;
		text.style.width = mediumSize;
		if(article.ia){
			text.classList.add(prefix + article.ia);	
		}else
			text.classList.add(prefix + 'text');
		

		text.classList.add(prefix + 'medium');

		articleBoard.append(text);
		ps.update();
	
	}



	function getJson(user,id){

		let data_file = site + '/files/' +user + '/'+id+'/article.json'; 
		console.log(data_file);

		var http_request = new XMLHttpRequest();
		http_request.onreadystatechange = function(){
		
			if(http_request.readyState == 	4){
			
				var jsonObj =JSON.parse(http_request.responseText);
				
				_showArticle(jsonObj);
			}	
		}
		
		http_request.open('GET',data_file,true);
		http_request.send();


	}

	let Controller = (function(){
		let routeParam ;
		

		R.registerEvent('article-init');
		R.addEventListener('article-init',function(e){
			id = e.id;
	
			routeParam = e;
			Router('init');
			//View.init();

	})

		let routes = [];

		let route1 = {
		
			route : prefix + 'init',
			url : '',
			dependencies : ['main--init'],
			used : 0
		};

		let route2 = {
		
			route : prefix + 'get',
			url : 'get',
			dependencies : ['main--init'],
			used : 0,
			data : false
		}

		routes.push(route1);
		
	
		let Router = function(route){
			
			switch(route){
				case 'init':
					View.init();
					pushState({},"article","/"+routeParam.username+'/get/article/'+routeParam.id);
					getJson(routeParam.username,routeParam.id);	
	
					break;
				case 'get':
					View.init();
					let url = window.location.pathname;

					let parts = url.split('/');
					
					pushState({},"article","/"+parts[1]+'/get/article/'+parts[4]);
					getJson(e.username,e.id);	
					
					console.log('in get wonidaf locakja kljadsf');

					console.log(window.location.pathname);
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
