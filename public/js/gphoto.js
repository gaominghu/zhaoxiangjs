var GPhoto, request,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

request = superagent;

GPhoto = (function() {
  function GPhoto() {
    this.displaySettings = __bind(this.displaySettings, this);
    this.enumSettings = __bind(this.enumSettings, this);
    this.loadSettings = __bind(this.loadSettings, this);
    this.settings = {};
  }

  GPhoto.prototype.startPreview = function() {
    $('#mainImage').attr('src', 'http://' + window.location.hostname + ':8080' + '/?action=stream');
    request.get('/api/stream/start', function(res){
      console.log(res);
    });
  };

  GPhoto.prototype.stopPreview = function() {
    $('#mainImage').attr('src', '');
  };

  GPhoto.prototype.loadSettings = function(cb) {
    return request.get('/api/settings', (function(_this) {
      return function(settings) {
        if (cb) {
          return cb(JSON.parse(settings.text));
        }
      };
    })(this));
  };

  GPhoto.prototype.enumSettings = function(settings, gui) {
    if (!gui) {
      gui = this.gui;
    }
    return $.each(settings, (function(_this) {
      return function(key, val) {
        var changeFn, foo, _ref;
        if ((_ref = val.type) === 'window' || _ref === 'section') {
          return _this.enumSettings(val.children, gui.addFolder(val.label));
        } else {
          foo = {};
          foo[val.label] = val.value;
          changeFn = function(newValue) {
            console.log(val.label, "changed to", newValue);
            return request.put("/api/settings/" + key, {
              newValue: newValue
            }, function(response) {
              return console.log(response);
            });
          };
          if (val.type === 'string') {
            return gui.add(foo, val.label).onChange(changeFn);
          } else if (val.type === 'toggle') {
            foo[val.label] = val.value !== 0;
            return gui.add(foo, val.label).onChange(function(newValue) {
              return request.put("/api/settings/" + key, {
                newValue: (newValue ? 1 : 0)
              }, function(response) {
                return console.log(response);
              });
            });
          } else if (val.type === 'choice') {
            return gui.add(foo, val.label, val.choices).onChange(changeFn);
          } else if (val.type === 'range') {
            return gui.add(foo, val.label, val.min, val.max, val.step).onChange(changeFn);
          }
        }
      };
    })(this));
  };

  GPhoto.prototype.displaySettings = function() {
    var foo;
    if (!this.gui) {
      this.gui = new dat.GUI();
    }
    foo = {
      'Start live preview': (function(_this) {
        return function() {
          return _this.startPreview();
        };
      })(this),
      'Take picture': (function(_this) {
        return function() {
          return request.get('/api/shoot/jpeg', function(res) {
            console.log(res);
            if (res.text) {
              $('#mainImage').attr('src', res.text + '?' + new Date().getTime());
              $('<a>').attr('href', res.text).text(res.text).appendTo($('#downloads')).css({
                'display': 'block'
              });
            }
          });
        };
      })(this)
    };
    this.gui.add(foo, 'Take picture');
    this.gui.add(foo, 'Start live preview');
    this.loadSettings(this.enumSettings);
  };

  return GPhoto;

})();

window.gphoto = new GPhoto();

window.gphoto.displaySettings();

// ---
// generated by coffee-script 1.9.0
