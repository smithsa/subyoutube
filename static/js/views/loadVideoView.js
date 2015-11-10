var LoadVideoView = Backbone.View.extend({
    el: '#main-content',
    template: "load-video",
    initialize: function(){
        this.render();
        this.bind("reset", this.updateView);
    },
    render: function(){
        var template = _.template(TemplateLoader.get(this.template));
        this.$el.html(template);
        return this;
    },
    events: {
        'click #load-youtube-video' : 'loadYoutubeVideo'
    },
    loadYoutubeVideo: function(e){
        var youtube_url = $("input[name='youtube-video-href']").val(); 
        if( youtube_url === '' || youtube_url.indexOf("www.youtube.com/watch?v=") === -1){
          alert("Please enter a correct field");
          return false;
        }

        //hide the search field and load the video and the subtitle creation
        //parsing for the t=youtube video ID
        var video_id = "";
        video_id = youtube_url.split("v=")[1];
        if(!this.isValidateYoutubeUrl(video_id)){
          alert("Please enter a valid Youtube url.");
          return false;
        }
        //router.navigate("create/"+video_id, {trigger: true});
        window.location.href  = "#create/"+video_id;
    },
    httpGet: function(url){
        var xmlHttp = null;
        xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", url, false );
        xmlHttp.send( null );
        return xmlHttp.responseText;
    },
    isValidateYoutubeUrl: function(videoID){
        var response = this.httpGet("http://gdata.youtube.com/feeds/api/videos/"+videoID);
        if(response === "Invalid id"){
          return false;
        }
        return true;
    },
    updateView: function() {
        this.remove();
        this.render();
    }

});
