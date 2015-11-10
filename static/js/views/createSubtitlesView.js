//cool interface example
//http://www.amara.org/en/videos/gbCUdn8QJtAc/en/637826/

//getting a feed
//https://gdata.youtube.com/feeds/api/users/ABCNetwork?v=2&alt=json, retrieved from the url above in its response

//TO-DO: on key press: .subtitle-content, for enter loose focus
//TO-DO: make sure we are restoring items that can be restored.... make a function to check dupes
//TO-DO: pull subtitles to server, sort id's server side...grab those then send appropriate data

/* 
  Handles all of the handling that will go on here for the subtitles 
*/
SubtitleView = Backbone.View.extend({
      tagName: "li",
      template: "subtitle-template",
      render: function(){
        var template = _.template(TemplateLoader.get(this.template));
        var template_data = $.extend(this.model.toJSON(), {subtitle_placeholder:subtitle_placeholder});
        this.$el.html(template(template_data));
        return this;
      },
});

/* 
  Handles all of the handling that will go on here for the subtitles trash can
*/
TrashCanSubtitleView = Backbone.View.extend({
      tagName: "li",
      template: "trash-can-subtitle-template",
      render: function(){
        var template = _.template(TemplateLoader.get(this.template));
        this.$el.html(template(this.model.toJSON({subtitle_placeholder:subtitle_placeholder})));
        return this;
      },
});

/* 
  For binding the modal to events dealing with the exportation.
*/
FancyBoxExportView = Backbone.View.extend({
        el: "#export-subtitles",
        events: {
            "click #export-subtitles-button": "exportSubtitles"
        },
        exportSubtitles: function(){
          $(".download-link, .fa-download").slideUp();
          var file_name = $("#subtitle-filename").val();
          if(file_name === ''){
            alert('Enter a filename');
            return false;
          }
          this.sendRequestToServerForSubtittles(file_name);
          var download_path = "downloads/subtitles/"+file_name+".srt";
          $("#export-subtitles").append("<center><i class='fa fa-download'></i><a class='download-link' href='"+download_path+"'' download>Download SRT File</a></center>");
        },
        getListOfSortedSubtitleIds: function(){
          var ul = document.getElementById("subtitle-list");
          var lis = ul.getElementsByTagName("li");
          var vals = [];
          var sorted_ids = [];
          var vals_and_html = {};
          for(var i = 0; i < lis.length; i++){
            var start_time = lis[i].getElementsByClassName('start_time')[0].innerHTML;
            start_time = start_time.replace(":", "");
            vals.push(start_time);
            vals_and_html[start_time] = lis[i].childNodes[0].getAttribute("data-id");
          }
          vals.sort();
          vals.reverse();
          for(var k = 0; k < vals.length ;k++){
            sorted_ids.unshift(vals_and_html[vals[k]]);
          }
          return sorted_ids;
        },
        sendRequestToServerForSubtittles: function(srt_file_name){
          var sorted_ids = this.getListOfSortedSubtitleIds();
          var current_model = {};
          var current_start_time = "";
          var current_end_time = "";
          var current_content = "";
          var subtitle_lists = {};
          for(var i =0; i < sorted_ids.length; i++){
            current_model = subtitleCollection.get(sorted_ids[i]);
            current_start_time = current_model.attributes.unformated_start_time;
            current_end_time = current_model.attributes.unformated_end_time;
            current_content = current_model.attributes.content;
            subtitle_lists[i] = {'start_time':current_start_time, 'end_time': current_end_time, 'content':current_content };
          }
          subtitle_lists = JSON.stringify(subtitle_lists)
          var json_data ={'subtitles':subtitle_lists,'filename':srt_file_name};
          $.getJSON($SCRIPT_ROOT + '/_exportsrtfile', json_data, function(data) {
              console.log(data);
          });
        }
});

/* 
  For binding the modal to events dealing with the trashcan.
*/
FancyBoxTrashCanView = Backbone.View.extend({
        el: "#trash-can-window",
        events: {
            "click #restore-trash-can-items-button": "restoreTrashcanItems"
        },
        restoreTrashcanItems: function(){
            var restore_empty = true;
            $( ".trashed-subtitle" ).each(function() {
              if($(this).prop('checked')){
                var subtitleId = $(this).val();
                //Will need to check if it interfers with other objects
                subtitleCollection.get(subtitleId).set({active:true}).save();
                subtitleCollection.trigger('reset'); 
                restore_empty = false;   
              }
            });
            if(restore_empty){
              alert("Please select at least on subtitle to restore.");
              return false;
            }
            $.fancybox.close();
        }
});


/* 
  Connection to the SubtitleView with the subtitle collection 
*/
var view = new SubtitleView({model: subtitleCollection});

//instantianting the collection
var subtitleCollection = new SubtitleCollection();

/* 
  Renders the full list of subtitles calling SubtitleView for each one.
*/
CreateSubtitlesView = Backbone.View.extend({
      el: "#main-content",
      template: "create-subtitles",
      render: function(){
          var video_id  = this.options.video_id;
          var template = _.template(TemplateLoader.get(this.template));
          var video_information = this.retrieveVideoInformation(video_id);
          var template_data = $.extend({video_id:video_id}, video_information);
          this.$el.html(template(template_data));
          return this;
      },
      initialize: function () {
        this.render();
        this.subtitle_content_html_element = this.$('#subtitle-content');
        subtitleCollection.on('add', this.addOne, this);
        subtitleCollection.on('reset', this.addAll, this);
        this.bind("reset", this.updateView);
        subtitleCollection.fetch(); // Loads list from local storage
      },
      events: {
        'click #new-subtitle': 'createSubtitleOnClick',
        'click .delete': 'trashSubtitle',
        'click .subtitle-content': 'clearPlaceholder',
        'blur .subtitle-content': 'editSubtitleContent',
        'keypress .subtitle-content': 'blurInput',
        'click #delete-all': 'deleteAllSubtitles',
        'click .seek':'seekInYTVideo',
        'click #sort-subtitles': 'sortSubtitles',
        'click #trash-can-button': 'addAllTrashCan',
        'click #export-subtitles-modal-button': 'exportSubtitles',
        'click #preview-subtitles-modal-button': 'previewSubtitles',
      },
      createSubtitleOnClick: function(e){
          player.pauseVideo();
          var start_time =  String(Math.floor(player.getCurrentTime()));
          var unformated_start_time = start_time;
          var end_time = $("#subtitle-duration").val();
          end_time = parseInt(end_time) + parseInt(start_time);
          var unformated_end_time = end_time;

          var overlaps_subtitle = false;
          //checking for any overlapping of time intervals
          subtitleCollection.every(function(model) {
            if(model.attributes.active === true){
              if(!rangesNotOverlapOpen(model.attributes.unformated_start_time, model.attributes.unformated_end_time, unformated_start_time, unformated_end_time)){
                alert("Subtitle overlaps with existing subtitle. Delete existing subtitile that overlaps with the new one you wish to create.");
                overlaps_subtitle = true;
                return false;
              }
            }
          });
          if(overlaps_subtitle){ return false;}
         
         //formating displayed time intervals
          end_time = String(end_time).formatTime();
          start_time = start_time.formatTime();
          var newSubtitleAttributes = {
                                          content: "",
                                          start_time: start_time,
                                          end_time: end_time,
                                          unformated_start_time: unformated_start_time,
                                          unformated_end_time: unformated_end_time, 
                                          active: true,
                                          id: guid()
                                        }
          var created_model = subtitleCollection.create(newSubtitleAttributes, {success: function(model){
      	  }});

          //clearing the input element
          $("#subtitle-content").val("");
          //player.playVideo();
      },
      addOne: function(subtitle){ 
        var view = new SubtitleView({model: subtitle});
        if(subtitle.get('active')){
          $('#subtitle-list').prepend(view.render(subtitle.toJSON()).el);
        }
      },
      addAll: function(){ 
        this.$('#subtitle-list').empty(); 
        subtitleCollection.each(this.addOne, this);
        var current_subtitle_content =  "";
        $( ".subtitle-content" ).each(function() {
           current_subtitle_content =  $(this).text();
           current_subtitle_content.contains(subtitle_placeholder) ? $(this).css("color", placeholder_color) : $(this).css("color", subtitle_font_color);            
        });
      },
      trashSubtitle: function(e){
          var subtitleId = $(e.target).parent().attr('data-id');
          subtitleCollection.get(subtitleId).set({active:false}).save();
          var subtitle_item = subtitleCollection.get(subtitleId);
          subtitleCollection.trigger('reset'); 
      },
      addTrashCan: function(subtitle){
        var view = new TrashCanSubtitleView({model: subtitle});
        if(!subtitle.get('active')){
          $('#trash-can-subtitle-list').prepend(view.render(subtitle.toJSON()).el);
        }
      },
      addAllTrashCan: function(){
        this.$('#trash-can-subtitle-list').empty(); 
        subtitleCollection.each(this.addTrashCan, this);
        //creating view for fancybox
        var fancybox_view = new FancyBoxTrashCanView({
            "el": "#trash-can-window"
        });
        fancybox_view.render();
        $("#trash-can-button").fancybox();
      },
      deleteAllSubtitles: function(){
        if(confirm("This action will permanatly delete all subtitles. Are you sure you want to delete all subtitles?")){
            _.chain(subtitleCollection.models).clone().each(function(model){
                console.log('deleting model ' + model.id);
                model.destroy();
            });
            $("#subtitle-list").empty();
        }
      },
      editSubtitleContent: function(e){
        var subtitle_content = $(e.target).text();
        var subtitleId = $(e.target).parent().attr('data-id');
        subtitleCollection.get(subtitleId).set({content:subtitle_content}).save();
        if($(e.target).text() == ""){
          $(e.target).text("Click Here To Enter Subtitle");
          $(e.target).css("color", placeholder_color);
        }
      },
      exportSubtitles: function(){
        $("#subtitle-filename").val("");
        var fancybox_view = new FancyBoxExportView({
            "el": "#export-subtitles"
        });
        fancybox_view.render();
        $("#trash-can-button").fancybox();
      },
      previewSubtitles: function(){
        var random_string = generateRandomString();
        var filename = "temp_"+random_string; 
        var data_srt_attribute = "downloads/previews/"+filename+".srt";
        response = this.sendRequestToServerForSubtittles(filename, function(){$("#caption-srt").attr('data-srt', data_srt_attribute);});
      },
      getListOfSortedSubtitleIds: function(){
        var ul = document.getElementById("subtitle-list");
        var lis = ul.getElementsByTagName("li");
        var vals = [];
        var sorted_ids = [];
        var vals_and_html = {};
        for(var i = 0; i < lis.length; i++){
          var start_time = lis[i].getElementsByClassName('start_time')[0].innerHTML;
          start_time = start_time.replace(":", "");
          vals.push(start_time);
          vals_and_html[start_time] = lis[i].childNodes[0].getAttribute("data-id");
        }
        vals.sort();
        vals.reverse();
        for(var k = 0; k < vals.length ;k++){
          sorted_ids.unshift(vals_and_html[vals[k]]);
        }
        return sorted_ids;
      },
      sendRequestToServerForSubtittles: function(srt_file_name, callback){
        var sorted_ids = this.getListOfSortedSubtitleIds();
        var current_model = {};
        var current_start_time = "";
        var current_end_time = "";
        var current_content = "";
        var subtitle_lists = {};
        for(var i =0; i < sorted_ids.length; i++){
          current_model = subtitleCollection.get(sorted_ids[i]);
          current_start_time = current_model.attributes.unformated_start_time;
          current_end_time = current_model.attributes.unformated_end_time;
          current_content = current_model.attributes.content;
          subtitle_lists[i] = {'start_time':current_start_time, 'end_time': current_end_time, 'content':current_content };
        }
        subtitle_lists = JSON.stringify(subtitle_lists)
        var json_data ={'subtitles':subtitle_lists,'filename':srt_file_name};
        $.getJSON($SCRIPT_ROOT + '/_previewsrtfile', json_data, function(data) {
            if(data['status'] === 'Success'){
              callback();
            }
        });
      },
      sortSubtitles: function(){
        var ul = document.getElementById("subtitle-list");
        var lis = ul.getElementsByTagName("li");
        var vals = [];
        var vals_and_html = {};
        for(var i = 0, l = lis.length; i < l; i++){
          var start_time = lis[i].getElementsByClassName('start_time')[0].innerHTML;
          start_time = start_time.replace(":", "");
          vals.push(start_time);
          vals_and_html[start_time] = lis[i].innerHTML;
        }
        
        vals.sort();
        
        if(app.GlobalVariables.getToggleSortCount() % 2 == 0){
          vals.reverse();
        }

        for(var i = 0, l = lis.length; i < l; i++){
          lis[i].innerHTML = vals_and_html[vals[i]];
        }
        app.GlobalVariables.incrementToggleSortCount();
      },
      seekInYTVideo: function(e){
        var subtitleId = $(e.target).parent().attr('data-id');
        if($(e.target).hasClass("start_time")){
            player.seekTo(subtitleCollection.get(subtitleId).attributes.unformated_start_time);
        }else{
            player.seekTo(subtitleCollection.get(subtitleId).attributes.unformated_end_time);
        }
      },
      retrieveVideoInformation: function(video_id){
        var url = "https://gdata.youtube.com/feeds/api/videos/"+video_id+"?v=2&alt=json";
        var response = $.parseJSON(this.httpGet(url));
        var video_information = {};
        video_information.video_author =  response['entry']['author'][0]["name"]["$t"];
        video_information.video_title = response['entry']['title']["$t"];
        video_information.video_description = response['entry']['media$group']["media$description"]["$t"];
        return video_information;
      },
      blurInput: function(e){
        if(e.which == 13){
          $('#new-subtitle').focus();
          return false; 
        }
        return true;
      },
      clearPlaceholder: function(e){
        if( $(e.target).text().contains(subtitle_placeholder)){
          $(e.target).text("");
        }
        $(e.target).css("color", subtitle_font_color);
      },
      httpGet: function(url){
          var xmlHttp = null;
          xmlHttp = new XMLHttpRequest();
          xmlHttp.open( "GET", url, false );
          xmlHttp.send( null );
          return xmlHttp.responseText;
      },
      updateView: function() {
        this.remove();
        this.render();
      }
});
