var Router = Backbone.Router.extend({

	routes: {
		"": "loadVideoView",
		"create/:video_id": "createSubtitlesView"
	},
	loadVideoView: function(){
		this.loadView = new LoadVideoView();
		console.log("Route: loadVideoView");
	},
	createSubtitlesView: function(video_id){		
		this.createView = new CreateSubtitlesView({video_id:video_id});
		console.log("Route: createSubititlesView");
	}

});

