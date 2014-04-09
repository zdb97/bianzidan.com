$(function () {  

	/*
	* genre model
	*/
	var GenreModel = Backbone.Model.extend({ 
		defaults: { 
			genre: ''
		},
		
		initialize: function () {
			console.log('genreModel initialized: ', this.toJSON());
		}
	});
	
	
	/* 
	 * genre collection 
	 */
	var GenreCollection = Backbone.Collection.extend({
		model: GenreModel,

		// Save all of the todo items under the `"todos"` namespace. 
		localStorage: new Backbone.LocalStorage('genre-localStorage'),		//zidan added
		
	 	initialize: function () { 
		 
	 	}
		 
	});


	/* 
	 * book model 
	 */
	var BookModel = Backbone.Model.extend({
		defaults: {
	  		title: '',
            isbn: '',
            author: '',
            genre: '',
            shelf: ''
		},
		
		initialize: function () {
			console.log('bookModel initialized: ', this.toJSON());
		},

		changeShelf: function (newShelf) {
			this.set('shelf', newShelf);

			console.log('book moved to new shelf: ', this.toJSON());
		}
	});


	/* 
	 * book collection 
	 */
	var BookCollection = Backbone.Collection.extend({
	    model: BookModel,

	    initialize: function (options) {
			this.genres = options.genres; 
		},
		
		loadData: function(callback) {
			var self = this; 
		
			/* to fetch a collection, getting an "add" event for every new model, and a "change" event for every changed existing model */
			self.fetch({
				url: 'model/case.json',
				
				success: function (self, response) {
					self.fillGenreCollection();
					callback();
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					 console.error('Status: ', textStatus); 
					 console.error('Error: ', errorThrown); 
				}
			}); 
		},
			
		parse: function (response) {
			var books = [];

			//extract books data from response to form new object colelction
	 		_.each(response.bookcase, function(shelf) {
 			 	var shelfId = shelf.id;
 				  _.each(shelf.books, function (book) { 
	 				 book['shelf'] = shelfId;
	 				 books.push(book);
	 			});	
 			});
 
			return books;
		},
		
		/*
		* add models into genre collection
		*/
		fillGenreCollection: function () {
			var self = this;
			
			// extract genres into an array
			var genres = _.pluck(this.toJSON(), 'genre');
			// get unique genres
			genres = _.uniq(genres);
			
			_.each(genres, function (genre) {
				self.genres.add({'genre': genre}); 

				//self.genres.create({'genre': genre}); 		// zidan added
			});
		}
	});
	

	/*
	* shelf model
	*/	
	var ShelfModel =  Backbone.Model.extend({
		defaults: {
			title: '',
			id: ''
		},
		
		initialize: function () {   
			console.log('shelfModel initialized: ', this.toJSON());
		}
	});


	/*
	* shelf collection
	*/
     var ShelfCollection = Backbone.Collection.extend({

        model: ShelfModel,
		 
		initialize: function (options) { 
			this.books = options.books;
			this.genres = options.genres;
		},
		
		loadData: function (callback) { 
			var self = this;
			
			self.fetch({
				url: 'model/case.json',
			
				success: function (self, response) {
					callback();
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					 console.error('Status: ', textStatus); 
					 console.error('Error: ', errorThrown); 
				}
			});
		},
		 
		parse: function (response) {
 			var shelves = _.map(response.bookcase, function (item) { 
 				return {'title': item.title, 'id': item.id};
 			});

			return shelves;
		},

		/*
		* sort book collection by genre
		*/
		organizeBookShelfByGenre: function (val) {
			var self = this;			
			
			// extract genres into an array
			var genres = _.pluck(self.genres.toJSON(), 'genre');
			// sort array  
			if (val === 'asc') {
				genres.sort();
			}
			else if (val === 'desc') {
				genres.sort().reverse();
			}
			
			self.each(function (shelf, index) {
				var booksByGenre = self.books.where({'genre': genres[index]});
				
				_.each(booksByGenre, function (book) {
					book.changeShelf(shelf.id);
				});
			});
		}
	});
	

	/*
	 * book view
	 */
	 var BooksView = Backbone.View.extend({
	 	
	 	events: {
 			'dragstart li.book a': 'dragBookStart',
 			'drop ol': 'dropBook',
			'dragover ol': 'dragBookOver',
			'dragenter ol': 'dragBookOver'	//for IE
	 	},

	 	initialize: function (options){
			this.books = options.books;  
			this.el = options.el; 
			this.shelfId = options.shelfId;

			this.template = _.template($('#books').html()); 			
			//listener on model change/add/remove
			this.listenTo(this.books, 'change', this.render);
			this.listenTo(this.books, 'add', this.render);
			this.listenTo(this.books, 'remove', this.render);

			this.render();   
		},

		render: function () { 
			this.$el.html('');

			var booksObj = {'books': this.books.toJSON()};
			var html = this.template(booksObj); 
			this.$el.append(html);

			return this;
		},

		/*
		*	handle ondragstart event
		*/
		dragBookStart: function (e) {
			e.originalEvent.dataTransfer.setData('text', $(e.target).parent().attr('id'));
		},

		/*
		 * handle ondrop event
		*/
		dropBook: function (e) {
			e.preventDefault(); 
			
			var data = e.originalEvent.dataTransfer.getData('text');

			if(e.originalEvent.target.localName !== 'ol') {
				$(this.el).find('ol').append(document.getElementById(data));	
			}
			else {
				$(e.originalEvent.target).append(document.getElementById(data));	
			}

			var $selectedBook = $(document.getElementById(data));
			var selectedBookModel = this.books.findWhere({isbn: $selectedBook.attr('isbn')});
		
			selectedBookModel.changeShelf(this.shelfId);
		},

		/*
		* handle ondragover event
		*/
		dragBookOver: function (e) {
			e.preventDefault(); 
		}
	 });


	/*
	 * shelf view
	 */
	 var ShelfView = Backbone.View.extend({
		  
		initialize: function (options){ 
			this.shelf = options.shelf;  
			this.books = options.books; 

			this.template = _.template($('#shelves').html());
 
			this.render(); 
			this.createBookViews(); 
		},
		
		render: function () { 
			var html = this.template(this.shelf.toJSON()); 
			this.$el.append(html);

			// append shelf view to $appElem 
			$appElem.append(this.el);

			return this;
		},

		/*
		* create sub views (book view)
		*/
		createBookViews: function () {
			var self = this;

			var bookView = new BooksView({
				books: self.books,
				el: 'li#' + this.shelf.attributes.id + ' .shelf-books',
				shelfId : this.shelf.attributes.id
			});
		} 
	 });
	 

 	/*
	* control panel view
	*/
	var ControlPanelView = Backbone.View.extend({
		events: {
			'change .sort-shelf select.organize': 'organizeShelves',
			'click .add-book .add-book-button': 'addBook',
			'click .remove-book .remove-book-button': 'removeBook'
		},

		initialize: function (options) {
			this.genres = options.genres;
			this.books = options.books;
			this.shelves = options.shelves;
			this.el = options.el;
			
			//listener on bool model add/remove
			this.listenTo(this.books, 'add', this.populateBookSelection);
			this.listenTo(this.books, 'remove', this.populateBookSelection);
			
			this.render();
		}, 
		
		render: function () {   
			this.populateGenreSelection();
			this.populateShelfSelection();
			this.populateBookSelection();
			 
			return self;
		},
		
		populateGenreSelection: function () {
			var self = this; 
			
			var $genreSelect = $(self.el).find('.add-book select.genre'); 
			var genres = _.pluck(self.genres.toJSON(), 'genre');
			genres.sort();
			
			_.each(genres, function (genre) {
				$genreSelect.append('<option value="' + genre + '">' + genre + '</option>');
			})
		},
		
		populateShelfSelection: function () {
			var self = this; 
			
			var $shelfSelect = $(self.el).find('.add-book select.shelf');
			var shelves = _.pluck(self.shelves.toJSON(), 'id');
			shelves.sort();
			
			_.each(shelves, function (shelf) {
				$shelfSelect.append('<option value="' + shelf + '">' + shelf + '</option>');
			})
		},
		
		populateBookSelection: function () {
			var self = this; 
			 
			var $BookSelect = $(self.el).find('.remove-book select.book-to-remove');
			var books = _.pluck(self.books.toJSON(), 'isbn');
			books.sort();
			
			$BookSelect.html('<option value="" selected="selected">--select ISBN--</option>');
			
			_.each(books, function (book) {
				$BookSelect.append('<option value="' + book + '">' + book + '</option>');
			});
		},
		
		organizeShelves: function (e) {
			if (e.target.value.toLowerCase() === 'asc') {
				this.shelves.organizeBookShelfByGenre('asc'); 
			}
			else if (e.target.value.toLowerCase() === 'desc') { 
				this.shelves.organizeBookShelfByGenre('desc'); 
			} 
		},
		
		addBook: function (e) {
			var $title = $(this.el).find('.add-book input.title'); 
			var $isbn = $(this.el).find('.add-book input.isbn'); 
			var $author = $(this.el).find('.add-book input.author'); 
			var $genre = $(this.el).find('.add-book select.genre'); 
			var $shelf = $(this.el).find('.add-book select.shelf');
			var $msg = $(this.el).find('.add-book .msg');
			
			if ($.trim($title.val()).length !== 0 && $.trim($isbn.val()).length !== 0 && $.trim($author.val()).length !== 0 
				&& $.trim($genre.val()).length !== 0 && $.trim($shelf.val()).length !== 0) { 
			
				var duplicateISBN = this.books.where({isbn: $.trim($isbn.val())});
				// if the isbn entered is already in the collection, do not add 
				if (duplicateISBN.length > 0) {
					$msg.html('error, duplicate isbn.');
					return;
				}
				
				// add book model to book collection
				this.books.add({
					'title': $.trim($title.val()),
					'isbn': $.trim($isbn.val()),
					'author': $.trim($author.val()),
					'genre': $.trim($genre.val()),
					'shelf': $.trim($shelf.val())
				});
				
				$msg.html('new book added.');
			}
			else {
				$msg.html('error, please fill all fields.');
			}
		},
		
		removeBook: function () {
			var $book = $(this.el).find('.remove-book select.book-to-remove'); 
				var $msg = $(this.el).find('.remove-book .msg');
			
			if ($.trim($book.val()).length !== 0) { 
				var bookToRemove = this.books.where({isbn: $.trim($book.val())}); 
				this.books.remove(bookToRemove);
				$msg.html('selected book is removed.');
			}
			else {
				$msg.html('please make a selection.');
			}
		}
	});

	

	//global variables
	var $appElem = $('ul.book-case'); 

	var genreCollection = new GenreCollection(); 
	var booksCollection = new BookCollection({
		genres: genreCollection
	});
	var shelfCollection = new ShelfCollection({
		books: booksCollection,
		genres: genreCollection
	});  	
	


	// TODO: or change cookie to localstorage
	// load from json if no cookie is found
	if (typeof($.cookie("localData")) === 'undefined') {
		$.cookie("localData", "1", { expires: 7 });
		console.log($.cookie("localData"));
	}
	// if there's local data, load from localstorage
	else {

	}
	


	
	// fetch data for books collection
	booksCollection.loadData(function () {
		// fetch data for shelf collection 
		shelfCollection.loadData(function () { 
			// create views after data is properly loaded
			shelfCollection.each(function (shelfModel, index) {
				var shelfView = new ShelfView({
					shelf: shelfModel,
					books: booksCollection,
					tagName: 'li',
					className: 'large-3 small-12 columns shelf',
					id: shelfModel.attributes.id
				});
			});
			
			var controlPanel = new ControlPanelView({
				genres: genreCollection,
				books: booksCollection,
				shelves: shelfCollection,
				el: '#control-panel'
			});
		});
	});
	 
	
});
 
	
 






