
let App =( function(){
	let apps = [];

	 function getCookie(name) {
		  var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
		  
		 if (match)
			return 	match[2];
			else 
				return null;
	}

	
	function run(route){ 
		
	
		let routeObject;

		let app = apps.find(_app =>{
		
			return _app.routes.find(rt =>{

				if(rt.route == route){
					routeObject = rt;
					return true;
				}

			
				return false;
			})
		})


		if(app){ 
		
			routeObject.dependencies.forEach(subroute =>{
			
				run(subroute);
			})
		}else 
			return;
		
		let splited = route.split('--');
	
		app.Router(splited[1]);

	}
	
	function start(){
	
		if(getCookie("hash")){
				
			 hash = getCookie("hash");
			let obj = {"action":"session"};
			obj["hash"] = hash;
					
			ws.send(JSON.stringify(obj));

					
			} else 
		parseUrl(window.location.pathname,false);
		
		

	}

	function initializeWS(){
			
		ws = new_ws(get_appropriate_ws_url(""), "lws-minimal");
		
			ws.onopen = function() {
				
				start()		
			}
	
		ws.onmessage =function got_packet(_msg) {
			let msg = JSON.parse(_msg.data);
					console.log(msg);	
		let route = msg.route;
		
			function findRoute(){

				for(let t =  0 ; t < apps.length ; t++){
				
					for(let p = 0 ; p < apps[t].routes.length ; p++){
					
						if(apps[t].routes[p].route == route)
							return t;
					}
				}

				return -1;
			}
			
		
		if(findRoute() != -1){
				
				Database.Router(msg);
				
	
				run(route);
			
			}else{

			
			
			 	R.dispatchEvent(msg.route,msg);
			}
		};
	
		ws.onclose = function(){


		};

		
	}


	function addApp(app){
	
		apps.push(app);

	}


	function findIndex(url){
		let route = null;

		let ap =  apps.findIndex(app=>{

			return app.routes.findIndex(rt =>{
				if(rt.url == url){
					route = rt.route;
					return true;
				}else
				return	false;
			}) > 0;
		})

		return route;

	}
	
	function findPath(path){

		for(let t =  0 ; t < apps.length ; t++){
		
			for(let p = 0 ; p < apps[t].routes.length ; p++){
			
				if(apps[t].routes[p].url == path)
					return t;
			}
		}

		return -1;


	}
		
	function parseUrl(url,navigate){
		

		let parts = url.split("/");
		
		console.log('in parse Url ');
		console.log(parts);
		console.log('-----end -----');
		if(parts[2]){
			let index = findPath(parts[2]);
			console.log('index is ' + index);

			if(index == -1) return run('home--init');

			for(let i = 0 ; i < apps[index].routes.length ; i++){ 
				if(apps[index].routes[i].url == parts[2]){
					if(apps[index].routes[i].data )
						return getPage(parts);
					else 
						return run(apps[index].routes[i].route);

				}
			}		
		}
		

		

	//ws.send(JSON.stringify({username : 'naro',action:'video'}))
	run('home--init');
	
	}
	


	function getPage(parts){
	
		switch(parts[2]){
		
			case 'archive':
				ws.send(JSON.stringify({username : parts[1],action:parts[3]}));

				break;
			case 'show':
				ws.send(JSON.stringify({id : parts[3],action : 'show'}));	
		
				break;
			case 'play':
				ws.send(JSON.stringify({id : parts[3],action : 'mvideo'}));	

				break;
			
					
			default : 
				
				break;
		}
	
	}

	function getHash(){
	
		return hash;
	}


	function restart(){
		
		document.getElementById('container').remove();
	
		run('home--init');
	}

	window.addEventListener('DOMContentLoaded',initializeWS);

	return {
		route : run,	
		Add : addApp,
	
		hash : getHash,
		navigate : parseUrl,
		restart : restart

	}

	
})()

