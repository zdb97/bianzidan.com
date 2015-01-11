define(
    [
        'jquery',
        'underscore',
        'backbone',
        'responsivenav',
        'modernizr',
        'foundation',
        'accordion',
        'async!//maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&libraries=places'
    ],

    function($, _, Backbone, responsiveNav, Modernizr, foundation, accordion) {
		/*
		 * default map data model
		 */
		var defaultMapDataModel = Backbone.Model.extend({
			defaults: {
                lat: 0,
                lng: 0,
				zoom: 0
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
            url: 'json/map.json', // url ralative to html page
          
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
				'click .accordion-item': 'accordionItemClick',
				'click #back-to-full-map': 'fullMapClick'
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

                self.$el.append(html);
            }, 
			
			accordionItemClick: function (e) {
				e.preventDefault();
			},
			
			fullMapClick: function (e) {
			 e.preventDefault();
				this.collection.updateSelectedModels(null);
				this.map.renderDefaultMap();
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
            }
        });

        /*
         * map view
         */
        var mapView = Backbone.View.extend({
            map: null,

            initialize: function(options) {
                console.log('map view initialized.');

				this.mapData = options.mapData;
                this.collection = options.collection;
                this.el = options.el;
                //this.inputField = options.inputField;
				
				this.renderDefaultMap();
            },

			renderDefaultMap: function () {
				var self = this;
				
				// google map options
				var mapOptions = {
					center: new google.maps.LatLng(this.mapData.get('lat'), this.mapData.get('lng')),
                    zoom: this.mapData.get('zoom'),
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
					panControl: false
                };
				//initialize google map
				this.map = new google.maps.Map(this.$el.get(0), mapOptions);
				
				_.each(this.collection.models, function(model, index) {
					// add location to map
					self.addMarkerToMap(model);
				});
				
				return this;
			},
			
            renderSelectedPlace: function() {
                var selectedModel = this.collection.getSelectedModel();
                var currentLatLng = new google.maps.LatLng(parseFloat(selectedModel.get('lat')), parseFloat(selectedModel.get('lng')));

				// google map options
                var mapOptions = {
                    center: currentLatLng,
                    zoom: parseInt(selectedModel.get('zoom')),
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
					panControl: true
                };
                //load google map
                this.map = new google.maps.Map(this.$el.get(0), mapOptions);
                // add location to map
                this.addMarkerToMap(selectedModel);
				
                // google auto complete
                /*
                var input = $(this.inputField).get(0);
                var autocompleteOptions = {
                    types: ['(cities)'],
                    componentRestrictions: {country: 'au'}
                };            

                var autocomplete = new google.maps.places.Autocomplete(input, autocompleteOptions);

                //autocomplete.bindTo('bounds', map);
                google.maps.event.addListener(autocomplete, 'place_changed', this.changeLocation);
                */

                return this;
            },

            addMarkerToMap: function(model) {
				var latlng = new google.maps.LatLng(parseFloat(model.get('lat')), parseFloat(model.get('lng')));
				
                var marker = new google.maps.Marker({
                    position: latlng,
                    map: this.map,
					draggable:false,
                    title: model.get('name')
                });
				var infowindow = new google.maps.InfoWindow({
					content: model.get('name')
				});
				
				google.maps.event.addListener(marker, 'click', function() {
					infowindow.open(this.map,marker);
				});
            }
        });

		
		
        // app init
        $(function(){
			var defaultMapData = new defaultMapDataModel();
            var dataCollection = new placeCollection();
            var navigation = responsiveNav('.nav-collapse');

			$.when(dataCollection.fetch(), defaultMapData.fetch()).done(function(){
			
				var mapview = new mapView({
					mapData: defaultMapData,
					collection: dataCollection,
					el: 'div#map-canvas'
					//inputField: '#searchTextField'
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