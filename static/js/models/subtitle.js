//N.B. start_time and end_time in seconds not milliseconds
Subtitle = Backbone.Model.extend({
      defaults:{
        content: '',
        unformated_start_time: 0.0,
        unformated_end_time: 0.0,
        start_time: 0.0,
        end_time: 0.0,
        active: true
      }
 });
