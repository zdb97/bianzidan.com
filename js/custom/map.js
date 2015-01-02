define(
    [
        "jquery",
        "underscore",
        "backbone",
        "responsivenav",
        "modernizr",
        "foundation",
        "accordion",
        "async!//maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&libraries=places"
    ],

    function($, _, Backbone, responsiveNav, Modernizr, foundation, accordion) {
        /*
        * place model
        */
        var placeModel = Backbone.Model.extend({
            defaults: {
                name: "",
                lat: "",
                lng: "",
                time_of_first_arrival: "",
                region: "",
                region_id: "",
                image: "",
                index: "",
                show_on_map: "",
                zoom: ""
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
            url: "json/map.json", // url ralative to html page
          
            initialize: function() {
                console.log('placeCollection initialized');

                this.on("add", this.addModel, this);
                this.on("remove", this.removeModel, this);
                this.on("reset", this.resetModel, this);
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
                console.log("placeCollection model removed, models count: ", this.models.length);
            },

            resetModel: function() {
                console.log("placeCollection model re-set.");
            }
        });


        /*
        * region list view
        */
        var regionListView = Backbone.View.extend({
            template: _.template($("#region-template").html()),

            events: {
				"click .accordion-item": "accordionItemClick"
            },

            initialize: function(options) {
                console.log("region view initialized: ", options);

                this.collection = options.collection;
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
                var html = "";
                var regions = [];

                // fill list "regions" e.g: [{"region":"region", "region_id": "region_id"}]
                _.each(self.collection.models, function(model, index) {
                    regions.push({
                        "region": model.get("region"),
                        "region_id": model.get("region_id")
                    });
                });

                // find the unique collections from the list (unique region list)
                regions = _.uniq(regions, function(region) { return region.region_id; })

                _.each(regions, function(region, index) {
                    html += self.template({
                        "region": region.region,
                        "region_id": region.region_id
                    });
                });

                self.$el.append(html);
            }, 
			
			accordionItemClick: function (e) {
				e.preventDefault();
			}
        });

        /*
        * place list view
        */
        var placeListView = Backbone.View.extend({
            template: _.template($("#place-template").html()),

            events: {
                "click .map-link": "listItemClick"
            },

            initialize: function(options) {
                //console.log("place view initialized: ", options);

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
                var html = "";
                var selected = false;

                _.each(self.collection.models, function(model, index) {
                    if (self.$el.hasClass('place-list-' + model.get('region_id'))) {
                        // set index value of model at run time
                        // fixme: index not needed any more??
                        model.set({
                            index: self.collection.indexOf(model)
                        });

                        html += self.template(model.toJSON());

                        if (model.get('show_on_map') === true) {
                            selected = true;
                        }
                    }

                });

                self.$el.append(html);
                //FIXME: not ideal, better put region as a standalone model
                self.setActivePanel(selected, self.$el);
                
            },

            //FIXME: not ideal, better put region as a standalone model
            setActivePanel: function (selected, $obj) {
                if (selected === true) {
                    $obj.closest('div.content').addClass('active');
                    $obj.closest('dd.region').addClass('active');
                }
            },

            getDisplayModel: function() {
                return _.find(this.collection.models, function(model, index) {
                    return (model.get("show_on_map") === true);
                });
            },

            getClickModel: function(e) {
                return _.find(this.collection.models, function(model, index) {
                    return (parseInt(model.get("index")) === parseInt($(e.target).attr("index")));
                });
            },

            updateModels: function(currentDisplayModel, clickModel) {
                if (clickModel !== currentDisplayModel) {
                    currentDisplayModel.set("show_on_map", false);
                    clickModel.set("show_on_map", true);
                }
            },

            listItemClick: function(e) {
				e.preventDefault();
                var currentDisplayModel = this.getDisplayModel();
                var clickModel = this.getClickModel(e);
                this.updateModels(currentDisplayModel, clickModel);

                this.map.render();
            }
        });

        /*
         * map view
         */
        var mapView = Backbone.View.extend({

            map: null,

            //constant
            DEFAULT_ZOOM: 12,

            initialize: function(options) {
                console.log("map view initialized.");

                this.collection = options.collection;
                this.el = options.el;
                this.inputField = options.inputField;
				
				// new
				this.render();
            },

            render: function() {
                var currentDisplayModel = this.getDisplayModel();
                var myPosition = new google.maps.LatLng(parseFloat(currentDisplayModel.toJSON().lat), parseFloat(currentDisplayModel.toJSON().lng));
                var zoom = currentDisplayModel.toJSON().zoom == "" ? this.DEFAULT_ZOOM : currentDisplayModel.toJSON().zoom; //this.ZOOM,


                var mapOptions = {
                    center: myPosition,
                    zoom: parseInt(zoom),
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };

                //initialize google map
                this.map = new google.maps.Map(this.$el.get(0), mapOptions);
                // initialize google map marker
                this.addMarkerToMap(myPosition);

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

            setMapCenter: function(index) {
                var lat = this.collection.models[index].get("lat");
                var lng = this.collection.models[index].get("lng");
                var myPosition = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));

                this.map.setCenter(myPosition);
                this.addMarkerToMap(myPosition);
            },

            addMarkerToMap: function(position) {
                var currentDisplayModel = this.getDisplayModel();

                var marker = new google.maps.Marker({
                    position: position,
                    map: this.map,
                    title: currentDisplayModel.toJSON().city
                });
            },

            getDisplayModel: function() {
                return _.find(this.collection.models, function(model, index) {
                    return (model.get("show_on_map") === true);
                });
            }
        });

		
		
        // app init
        $(function(){
            var dataCollection = new placeCollection();
            var navigation = responsiveNav(".nav-collapse");

            dataCollection.fetch({
                // fetch the json url and returns the collection by (collection.parse)
                success: function(data, response) {
                    console.log("fetch success: ", data, " ", response);
                },
                error: function() {
                    console.error("fetching error....");
                },
                complete: function(xhr, response) {
                    console.log("fetch complete: ", xhr, response);

                    var mapview = new mapView({
                        collection: dataCollection,
                        el: "div#map-canvas",
                        inputField: "#searchTextField"
                    });

                    var regionlistview = new regionListView({
                        collection: dataCollection,
                        el: ".region-list"
                    });

                    var regionLists = regionlistview.$el.find('dd.region');
                    $.each(regionLists, function(regionList) {
                        var dataRegion = $(this).attr('data-region');

                        var placelistview = new placeListView({
                            collection: dataCollection,
                            map: mapview,
                            el: "ul.place-list-" + dataRegion
                        }); 
                    });
                }
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