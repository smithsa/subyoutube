SubtitleCollection = Backbone.Collection.extend({
    	model: Subtitle,
      	localStorage: new Store('subutube-subtitles') //naming the store, and assigning it to the collection
});