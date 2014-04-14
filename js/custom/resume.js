define(
	[
		"jquery", 
		"masonry"
	], 
	function($, masonry) { 	
	//	$(function () {
			console.log("testsss");
			
			/*
			var container = document.querySelector('.employment-history');
			var msnry = new Masonry( container, {
			  // options
			  columnWidth: 200,
			  itemSelector: '.columns'
			});
			*/
			
			var $container = $('.employment-history');
		 
			$container.masonry({
				columnWidth: 1,
				itemSelector: '.role',
				isAnimated: true
			});
	//	});
		 
	}
);






