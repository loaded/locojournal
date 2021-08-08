let Database = (function(){
	
	let received ;

	let Home = (function(){

		let mapmove ;
		let hashText;


		function Router(database){


			switch(database){
				case 'mapmove':
					mapmove = received;
					break;
				case 'popup':
					hashText = received;
					break;
				default :
					break;
			}

		}

		function get(){
			return mapmove;
		}


		function pop(){
			return hashText;
		}
		return {
			Router : Router,
			mapmove : get,
			popup : pop
		}


	})();

	let Show = (function(){
		let model ;

		let Router = function(route){
		
			switch(route){
				
				case 'init':
					model = received;
					
					break;
				default:
					break;
			}
		}

		function getModel(){
			return model;
		}

		return {
	
			Router : Router,
			Model : getModel

		
		}
	})()
	

	let Basket = (function(){
	
		let models = [] ;
		
		function add(item){
			models.push(item);
		}


		function remove(item){
			let index = models.findIndex(function(el){
				return (item.id == el.id)
			})

			if(index != -1){
				models.splice(index)
			}
		}

		
		function get(){
			return models;
		}

		return {
			Get : get,	
			Add: add,
			Remove : remove
		}
	})()

	let Video = (function(){
		let models = [] ;

		let Router = function(route){
		
			switch(route){
				
				case 'init':
					models = received;

					
					break;
				case 'video':
					models.push(received);
					break;
				default:
					break;
			}
		}

		function getModels(){
			return models;
		}

		function username (){
			return received.username;
		}
		
		function getModel(){
		
			return models[models.length -1];
		}

		return {
			getModel : getModel,
			user : username,
			Router : Router,
			Models : getModels
		}
	})()



	let Article = (function(){
		let models ;

		let Router = function(route){
		
			switch(route){
				
				case 'init':
					models = received;

					
					break;
				default:
					break;
			}
		}

		function getModels(){
			return models;
		}

		function username (){
			return received.username;
		}

		return {

			user : username,
			Router : Router,
			Models : getModels
		}
	})()


	let Archive = (function(){
		let models ;

		let Router = function(route){
		
			switch(route){
				
				case 'article':
					models = received.models;
					
					break;
				case 'gallery':
					models = received.models;
					break;
				case 'video':
					models = received.models;
					break;
			
				default:
					break;
			}
		}

		function getModels(){
			return models;
		}

		function username (){
			return received.username;
		}

		function getVideos(){
			return models;
		}

		return {

			user : username,
			Router : Router,
			Models : getModels,
			Videos : getVideos
		}
	})()

	let Router = function(data){
		
		received = data;

		let route = data.route.split('--');
			

		switch(route[0]){
			case 'home':
				Home.Router(route[1]);
			case 'archive':
				Archive.Router(route[1])
				break;
			case 'show':
				Show.Router(route[1]);
				break;
			case 'play':
				Video.Router(route[1]);
				break;
			default : 
				break;
		}
	}


	return {
		Show : Show,
		Archive :Archive,
		Home : Home,
		Router : Router,
		Basket : Basket,
		Video : Video
	}
})()

