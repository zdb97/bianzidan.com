define(
    [
        'jquery',
        'underscore',
        'backbone',
        'responsivenav',
        'modernizr',
		'mapStyling',
        'foundation',
        'accordion',
        'scrollto',        'async!//maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&libraries=places&key=AIzaSyDxEoEo9pRIoAA7Cv92HW32vvIAWPnQewE'
    ],

    function($, _, Backbone, responsiveNav, Modernizr, foundation, accordion, scrollTo) {
		/*
		 * default map data model
		 */
		var defaultMapDataModel = Backbone.Model.extend({
			defaults: {
                lat: 0,
                lng: 0,
				zoom: 0,
				marker_icon: null
			},
			
			url: 'json/map.json', // url ralative to html page
			
			parse: function(response) {
                return response.default_map_data;
            }
		});
	
        /*
        * place model
        */
        var placeModel = Backbone.Model.extend({
            defaults: {
                name: '',
                lat: '',
                lng: '',
                time_of_first_arrival: '',
                region: '',
                region_id: '',
                image: '',
                index: 0,
                selected: false,
                zoom: 0
            },

            initialize: function() {
                console.log('placeModel initialized: ', this.toJSON());
            }
        });
		
        /*
        * place collection
        */
        var placeCollection = Backbone.Collection.extend({

            model: placeModel,
            url: 'json/map.json?v=1', // url ralative to html page
          
            initialize: function() {
                console.log('placeCollection initialized');

                this.on('add', this.addModel, this);
                this.on('remove', this.removeModel, this);
                this.on('reset', this.resetModel, this);
            },

            /*
             * parse is called by Backbone whenever a collection's models are returned by the server, in fetch
            * The function is passed the raw response object, and should return the array of model attributes to be added to the collection.
            */
            parse: function(response) {

                var places = [];
                _.each(response.regions, function(region, index) {
                    // err detection should be added
                    var regionName = region.name;
                    var regionId = region.id;

                    _.each(region.places, function(place, index) {
                        place['region'] = regionName;
                        place['region_id'] = regionId;
                        places.push(place);
                    });
                });

                return places;
            },

            addModel: function() {
            },

            removeModel: function() {
                console.log('placeCollection model removed, models count: ', this.models.length);
            },

            resetModel: function() {
                console.log('placeCollection model re-set.');
            },
			
			getSelectedModel: function() {
				return  _.find(this.models, function(model) {
                    return (model.get('selected') === true) ;
                });
            },
			
			updateSelectedModels: function(selectedModel) {
				_.each(this.models, function(model){
					if (model === selectedModel) {
						model.set('selected', true);
					}
					else {
						model.set('selected', false);
					}
				});
                
            }
        });

        /*
        * region list view
        */
        var regionListView = Backbone.View.extend({
            template: _.template($('#region-template').html()),

            events: {
				'click #back-to-full-map': 'fullMapClick',
				'click #toggle-menu': 'menuToggleClick',
				'click .accordion-item': 'toggleAccordion'
            },

            initialize: function(options) {
                console.log('region view initialized: ', options);

                this.collection = options.collection;
				this.map = options.map;
                this.el = options.el;
                this.render();
				
            },

            render: function() {
                var self = this;
                self.addRegionDataToTemplate();
				
                return this;
            },

            addRegionDataToTemplate: function() {
                var self = this;
                var html = '';
                var regions = [];

                // fill list "regions" e.g: [{"region":"region", "region_id": "region_id"}]
                _.each(self.collection.models, function(model, index) {
                    regions.push({
                        'region': model.get('region'),
                        'region_id': model.get('region_id')
                    });
                });

                // find the unique collections from the list (unique region list)
                regions = _.uniq(regions, function(region) { return region.region_id; })

                _.each(regions, function(region, index) {
                    html += self.template({
                        'region': region.region,
                        'region_id': region.region_id
                    });
                });

                self.$el.find('>dl').append(html);
            }, 
			
			fullMapClick: function (e) {
                e.preventDefault();
                this.collection.updateSelectedModels(null);
                this.map.renderDefaultMap();
				this.map.clearSearchField();

                $('#map-canvas').ScrollTo();
			},
			// TODO: make region a collection then change the view based on model change
			toggleAccordion: function (e) {
				var thisObj = e.target;
				var collapseClass = 'fi-arrow-right';
				var expendClass = 'fi-arrow-down';
				var collapseTitle = 'click/tap to expend';
				var expendTitle = 'click/tap to collapse';
				
				if ($('#back-to-full-map').get(0) !== thisObj) {
					if ($(thisObj).hasClass(collapseClass)) {
						$('.' + expendClass).attr('title', collapseTitle);
						$('.' + expendClass).addClass(collapseClass).removeClass(expendClass);
						$(thisObj).addClass(expendClass).removeClass(collapseClass);
						$(thisObj).attr('title', expendTitle);
					}
					else {
						$(thisObj).addClass(collapseClass).removeClass(expendClass);
						$(thisObj).attr('title', collapseTitle);
					}
				}
				else {
					$('.' + expendClass).attr('title', collapseTitle);
					$('.' + expendClass).addClass(collapseClass).removeClass(expendClass);
				}
			},
			
			menuToggleClick: function (e) {
				this.$el.find('dl').toggle();
			}
        });

        /*
        * place list view
        */
        var placeListView = Backbone.View.extend({
            template: _.template($('#place-template').html()),

            events: {
                'click .map-link': 'listItemClick'
            },

            initialize: function(options) {
                //console.log('place view initialized: ', options);

                this.collection = options.collection;
                this.map = options.map;
                this.el = options.el;
                this.render();
            },

            render: function() {
                var self = this;
                self.addCollectionDataToTemplate();
				 
                return this;
            },

            addCollectionDataToTemplate: function() {
                var self = this;
                var html = '';

                _.each(self.collection.models, function(model, index) {
                    if (self.$el.hasClass('place-list-' + model.get('region_id'))) {
                        // set index value of model at run time.
                        model.set({
                            index: self.collection.indexOf(model)
                        });

                        html += self.template(model.toJSON());
                    }
                });

                self.$el.append(html);
            },
			
            getClickModel: function(e) {
                return _.find(this.collection.models, function(model, index) {
                    return (parseInt(model.get('index')) === parseInt($(e.target).attr('index')));
                });
            },

            listItemClick: function(e) {
                var clickModel = this.getClickModel(e);
				
                this.collection.updateSelectedModels(clickModel);
                this.map.renderSelectedPlace();

                $('#map-canvas').ScrollTo();
            }
        });

        /*
         * map view
         */
        var mapView = Backbone.View.extend({
            
            initialize: function(options) {
                console.log('map view initialized.');

				this.mapData = options.mapData;
                this.collection = options.collection;
                this.el = options.el;
				this.retina = options.retina;
                this.inputField = options.inputField; //
				this.map = null;
				this.markers = [];
				this.infoWindows = [];
				
				this.render();
            },
			
			events: { 
				'focus #searchTextField': 'searchFieldOnFocus'
			},

			render: function () {
				var self = this;
				
				// google map options
				var mapOptions = {
					center: new google.maps.LatLng(this.mapData.get('lat'), this.mapData.get('lng')),
                    zoom: this.mapData.get('zoom'),
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
					styles: mapStyling[3],
					panControl: false
                };
				//initialize google map
				this.map = new google.maps.Map(this.$el.get(0), mapOptions);
								
				_.each(this.collection.models, function(model, index) {
					// add location to map
					self.markers.push(self.addMarkerToMap(model));
				});
				
				// google auto complete
				var input = $(this.inputField).get(0);
				var autocomplete = new google.maps.places.Autocomplete(input);
				
				this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
				autocomplete.bindTo('bounds', this.map);
				google.maps.event.addListener(autocomplete, 'place_changed', function(e){
					var place = autocomplete.getPlace();
					
					if (!place.geometry) {
						window.alert("Autocomplete's returned place contains no geometry");
						return;
					}
					
					// If the place has a geometry, then present it on a map.
					if (place.geometry.viewport) {
						self.map.fitBounds(place.geometry.viewport);
					} else {
						self.map.setCenter(place.geometry.location);
						self.map.setZoom(17);
					}
					/*
					var marker = new google.maps.Marker({
						position: {lat: place.geometry.location.lat(), lng: place.geometry.location.lng()},
						map: self.map
					});*/
				});
                
				return this;
			},
			
			renderDefaultMap: function () {
				this.map.setZoom(this.mapData.get('zoom'));
				this.map.setCenter(new google.maps.LatLng(this.mapData.get('lat'), this.mapData.get('lng')));
				
				// close all info windows
				_.each(this.infoWindows, function(infoWindow, index){
					infoWindow.close();
				});
			},
			
            renderSelectedPlace: function() {
				this.clearSearchField();
				
                var selectedModel = this.collection.getSelectedModel();
                var latlng = new google.maps.LatLng(parseFloat(selectedModel.get('lat')), parseFloat(selectedModel.get('lng')));
				
				this.map.setCenter(latlng);
				this.map.setZoom(selectedModel.get('zoom'));
            },

            addMarkerToMap: function(model) {
				var latlng = new google.maps.LatLng(parseFloat(model.get('lat')), parseFloat(model.get('lng')));
				var imageHTML = model.get('image') === '' ? '' : '<img class="place-image" src="' + model.get('image') + '" alt="' + model.get('name') + '" />';
				var image = {
					url: this.mapData.get('marker_icon'),
					// This marker is 32 pixels wide by 32 pixels tall.
					size: new google.maps.Size(26, 32), // red (25, 32),
					// The origin for this image is 0, 52.
					origin: new google.maps.Point(0, 52),	// red (25, 52)
					// if the normal size of the image is 50x100 then double size for retina (25x50).
					scaledSize: new google.maps.Size(50, 150)
				  };
				
                var marker = new google.maps.Marker({
                    position: latlng,
                    map: this.map,
					draggable:false,
                    title: model.get('name'),
					animation: google.maps.Animation.DROP,
					icon: image
                });
				var infoWindow = new google.maps.InfoWindow({
					content: '<div><label>'+ model.get('name') + '</label>' + imageHTML + '</div>'
				});
				
				this.infoWindows.push(infoWindow); 
				
				google.maps.event.addListener(marker, 'click', function() {
					infoWindow.open(this.map,marker);
				});
				
				return marker;
            },
			
			searchFieldOnFocus: function (e) {
				this.clearSearchField();
			},
			
			clearSearchField: function () {
				$(this.inputField).val('');
			}
        });

		
		
        // app init
        $(function(){
			var retina = window.devicePixelRatio > 1;
			var defaultMapData = new defaultMapDataModel();
            var dataCollection = new placeCollection();
            var navigation = responsiveNav('.nav-collapse');

			$.when(dataCollection.fetch(), defaultMapData.fetch()).done(function(){
			
				var mapview = new mapView({
					mapData: defaultMapData,
					collection: dataCollection,
					el: 'div#map-canvas',
					retina: retina,
					inputField: '#searchTextField' //
				});

				var regionlistview = new regionListView({
					collection: dataCollection,
					map: mapview,
					el: '.region-list'
				});

				var regionLists = regionlistview.$el.find('dd.region');
				$.each(regionLists, function(regionList) {
					var dataRegion = $(this).attr('data-region');

					var placelistview = new placeListView({
						collection: dataCollection,
						map: mapview,
						el: 'ul.place-list-' + dataRegion
					}); 
				});
			
			}).fail(function(){
				console.log('data fetching error....');
				alert('error with loading data, please contact site admin.');
			});

            $(document).foundation({
                accordion: { /*
                    callback: function(accordion) {
                        console.log(accordion);
                    } */
                }
            });
        });

        

    }
);