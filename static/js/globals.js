//TO-DO: Figure out if i'm using this
var app = {}; //creating namespace
app.GlobalVariables =(function () {
  var toggle_sort_count = 0;
  return {
    getToggleSortCount: function(){
        return toggle_sort_count;
    },
    incrementToggleSortCount: function(){
        toggle_sort_count = toggle_sort_count + 1;
    }
  };
})();

var TemplateLoader = {
    // Hash of preloaded templates for the app
    templates:{},
     
    // Recursively pre-load all the templates for the app.
    // This implementation should be changed in a production environment. All the template files should be
    // concatenated in a single file.
    loadTemplates: function (names, callback) {
      var that = this;
      var loadTemplate = function (index) {
      var name = names[index];
      $.get('js/templates/' + name + '.html', function (data) {
              that.templates[name] = data;
              index++;
              if (index < names.length) {
                  loadTemplate(index);
              } else {
                  callback();
              }
          });
      }
   
      loadTemplate(0);
    },
     
    // Get template by name from hash of preloaded templates
    get: function (name) {
      return this.templates[name];
    }
     
};

/*CSS Colors*/
var subtitle_font_color = "#222";
var placeholder_color = "#ccc";
var subtitle_placeholder = "Click Here To Enter Subtitle";
      
var guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();

String.prototype.formatTime = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);
    if (seconds < 10) {seconds = "0"+seconds};
    var time = hours+':'+minutes+':'+seconds;
    if(hours == 0){ time = minutes+':'+seconds;}
    return time;
}

String.prototype.contains = function(it) { return this.indexOf(it) != -1; };

function rangesNotOverlapOpen(start_time1 , end_time1, start_time2, end_time2){
  return (end_time1 <= start_time2) || (end_time2 <= start_time1);
}

function generateRandomString(){
  var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  var string_length = 8;
  var randomstring = '';
  for (var i=0; i<string_length; i++) {
    var rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum,rnum+1);
  }
  return randomstring;
}
