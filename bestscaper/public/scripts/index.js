var Scaper = (function($,window,document,undefined) {
	'use strict';
	// when user select new location from google auto complete, object is filled with via data.
	var _addressComponentForm = {locality: 'long_name', administrative_area_level_1: 'short_name', country: 'long_name'};
	var _completeAddress = {locality: null,administrative_area_level_1: null,country: null};
	var _address = { city : null, state : null, country : null }
	// map,marker,markerArray,informationwindow on google map, autocomplete. init.
	var _map, _marker, _markerArray = [], _infowindow = new google.maps.InfoWindow(),_autocomplete;
	// timer for map
	var _timer;
	// rendering document objects.
	var _postRenderArea, _companyRenderArea, _postPagination, _companyPagination;
	// pagination value.
	var _postMaxPage, _companyMaxPage;
	// fill the address form with autocomplete Place obj
	var _util = {
		getQuery : function() {
		    var j = {}
		    var q;
		    if(location.href.indexOf("?") != -1){
		        q = location.href.split("?")[1].split("&");
		        $.each(q, function(i, arr) {
		            arr = arr.split('=');
		            return j[arr[0]] = arr[1];
		        });
		    }
		    return j;
		},
		_fillInAddress : function(place){
			for (var i = 0; i < place.address_components.length; i++) {
			    var addressType = place.address_components[i].types[0];
			    if (_addressComponentForm[addressType]) {
			    	var val = place.address_components[i][_addressComponentForm[addressType]];
			    	_completeAddress[addressType] = val;
			    }
			}
		}
	};
	var _setting = {
		localStorage : {
			setLastSearch : function(){
				var lastSearch = {
			      	'country': _completeAddress.country,
			      	'state' : _completeAddress.administrative_area_level_1,
			      	'city' : _completeAddress.locality
			  	}
			  	localStorage.setItem('lastSearch', JSON.stringify(lastSearch));
			},
			setLastMap : function(){
				localStorage.setItem('lastMapData',JSON.stringify({
			  		'lat' : _map.getCenter().lat(),
			  		'lng' : _map.getCenter().lng(),
			  		'zoom' : _map.zoom
			  	}));
			},
			getLastSearch : function(){
				return JSON.parse(localStorage.getItem('lastSearch') )|| {}
			},
			getLastMap : function(){
				return JSON.parse(localStorage.getItem('lastMapData') )|| {}
			}
		},
		location : {
			setLocation : function(state){
				var address = _setting.localStorage.getLastSearch();
				var mapData = _setting.localStorage.getLastMap();
				var newLoc = $.extend({}, address, mapData);;
				newLoc = $.param(newLoc);
				// only when place is changed. it has to be pushState.
				if(state == 'place_changed'){
					window.history.pushState(state,"pageTitle",'?' + newLoc);
				}else{
					window.history.replaceState(state,"pageTitle",'?' + newLoc)
				}
			}
		},
		local : {
			setAddressByLocation : function(){
				var query = _util.getQuery();
				_address = {
			      	'country': query.country,
			      	'state' : query.state,
			      	'city' : query.city
			  	}
			},
			setAddress :function(){
				_address = {
			      	'country': _completeAddress.country,
			      	'state' : _completeAddress.administrative_area_level_1,
			      	'city' : _completeAddress.locality
			  	}
			}
		}

		
	};

	var render = {
		setLoading :function(option){
			if(option.status == 'doing'){
				var loading = $('<i class="fa-spin fa fa-spinner loading-icon"></i>');
				$(option.target).addClass('loading');
				loading.appendTo($(option.target));
			}else if(option.status == 'done'){
				$(option.target).removeClass('loading');
			}
		},
		renderPosts: function (postResult){
			var target = _postRenderArea;
			var html = new EJS({url: '/templete/index/post'}).render({postResult : postResult})
			target.html(html);
			render.renderReadMore();
		},
		renderCompanies : function(companyResult){
			var target = _companyRenderArea;
			var html = new EJS({url: '/templete/index/company'}).render({companyResult : companyResult})
			target.html(html);
			render.renderRating();
		},
		renderRating : function (){
			$('.company-rating').raty({
				path: '/libs/raty/lib/images',
				score : function(){
					return $(this).attr('data-score');
				},
				half : true,
				readOnly : true
			})
		},
		renderReadMore : function(){
			var showChar = 200;  // How many characters are shown by default
		    var ellipsestext = "...";
		    var moretext = "Show more";
		    var lesstext = "Show less";
		    $('.more').each(function() {
		        var content = $(this).html();
		 
		        if(content.length > showChar) {
		            var c = content.substr(0, showChar);
		            var h = content.substr(showChar, content.length - showChar);
		            var html = c + '<span class="moreellipses">' + ellipsestext+ '&nbsp;</span><span class="morecontent"><span>' + h + '</span>&nbsp;&nbsp;' ;
		            // var html = c + '<span class="moreellipses">' + ellipsestext+ '&nbsp;</span><span class="morecontent"><span>' + h + '</span>&nbsp;&nbsp;<a href="" class="morelink">' + moretext + '</a></span>';
		            $(this).html(html);
		        }
		 
		    });
		 
		    // $(".morelink").on('click',function(){
		    //     if($(this).hasClass("less")) {
		    //         $(this).removeClass("less");
		    //         $(this).html(moretext);
		    //     } else {
		    //         $(this).addClass("less");
		    //         $(this).html(lesstext);
		    //     }
		    //     $(this).parent().prev().toggle();
		    //     $(this).prev().toggle();
		    //     return false;
		    // });
		},
		renderCompanyPagination : function(){
			_companyPagination.twbsPagination({
		        totalPages: _companyMaxPage,
		        visiblePages: 5,
		        onPageClick: function (event, page) {
		            // $('#page-content').text('Page ' + page);
		            _search.getCompanyByPage(page);
		        }
		    });
		},
		renderPostPagination : function(){
			_postPagination.twbsPagination({
		        totalPages: _postMaxPage,
		        visiblePages: 5,
		        onPageClick: function (event, page) {
		            // $('#page-content').text('Page ' + page);
		            _search.getPostByPage(page);
		        }
		    });
		}
	};

	var _search = {
		findByAddress :function(){

			render.setLoading({
				target : _postRenderArea,
				status : 'doing'
			});
			// 
			render.setLoading({
				target : _companyRenderArea,
				status : 'doing'
			});

			jQuery.ajax({
			    url: "/search/findByAddress", 
			    type: "GET",
			    statusCode : {
			    	500 : function(err){
			    	},
			    	400 : function(err){
			    	}
			    },
			    data: _address, 
			    success: function (data, textStatus, jqXHR) { 
			    	if(data.status == 'success'){
			    		render.setLoading({
							target : _postRenderArea,
							status : 'done'
						});
						// 
						render.setLoading({
							target : _companyRenderArea,
							status : 'done'
						});

						// render the page
						render.renderPosts(data.postResult);
						render.renderCompanies(data.companyResult);
						
						// unbind and reinit pagination.
						$(_companyPagination).empty().removeData("twbs-pagination").unbind("page");
						$(_postPagination).empty().removeData("twbs-pagination").unbind("page");
						_postMaxPage = data.postResult.maxPage;
						render.renderPostPagination();
						_companyMaxPage = data.companyResult.maxPage;
						render.renderCompanyPagination();
			    	}
			    }
			});
		},findOnMap : function(){
			console.log('map');
			// ajax data for dynamic performance 
			var formData = _setting.localStorage.getLastMap();
			jQuery.ajax({
			    url: '/search/findOnMap', 
			    type: "GET",
			    statusCode : {
			    	500 : function(err){
			    		console.log(err);
			    	},
			    	400 : function(err){
			    		console.log(err);
			    	}
			    },
			    data: formData, 
			    success: function (data, textStatus, jqXHR) { 
			    	console.log(data);
					if(data.status == 'success'){
						
						data.houses.forEach(function(house){
							_mapSetting.setHouseMarker(house);
						});
						data.companies.forEach(function(company){
							_mapSetting.setCompanyMarker(company);
						});
					}				    	
			    }
			});
		},
		getPostByPage : function(page){
			var formData = _address;
			formData.pPage = page;
			// before search represent loading icon.
			render.setLoading({
				target : _postRenderArea,
				status : 'doing'
			});
			jQuery.ajax({
			    url: "/search/getPostByPage", 
			    type: "GET",
			    statusCode : {
			    	500 : function(err){
			    		console.log(err);
			    	},
			    	400 : function(err){
			    		console.log(err);
			    	}
			    },
			    data: formData, 
			    success: function (data, textStatus, jqXHR) { 

			    	if(data.status == 'success'){
			    		render.setLoading({
							target : _postRenderArea,
							status : 'done'
						});
			    		render.renderPosts(data.postResult);
			    	}
			    }
			});

		},
		getCompanyByPage : function(page){
			var formData = _address;
			formData.cPage = page;
			// before search represent loading icon.
			render.setLoading({
				target : _companyRenderArea,
				status : 'doing'
			});
			jQuery.ajax({
			    url: "/search/getCompanyByPage", 
			    type: "GET",
			    statusCode : {
			    	500 : function(err){
			    		console.log(err);
			    	},
			    	400 : function(err){
			    		console.log(err);
			    	}
			    },
			    data: formData, 
			    success: function (data, textStatus, jqXHR) { 

			    	if(data.status == 'success'){
			    		render.setLoading({
							target : _companyRenderArea,
							status : 'done'
						});
			    		render.renderCompanies(data.companyResult);
			    	}
			    }
			});
		}

	};
	// mapSetting object.
	var _mapSetting = {
		setHouseContent : function(house){
			var content = '<table class="table" style="width:300px;">';
			content+= '<tr class="info">';
			content+= '<td>Post</td>';
			content+= '<td>Date</td>';
			content+= '</tr>';
			house.posts.forEach(function(post){
				content += '<tr>';
				content+= '<td><a href="/h/'+house._id.house+'/p/'+post._id+'" target="_blank">' + post.title + '</a></td>';
				content+= '<td>' + moment(post.posted).format('YYYY-MM-DD') + '</td>';
				content += '</tr>';
			})
			content+= '</table>'
			return content; 
		},
		setCompanyContent : function(company){
			
			var content = '';
			if(company._id.companyLogo){
				content = '<img src="' + company._id.companyLogo.url + '" style="width:150px; height:100px; border:1px solid #ccc;">';
			}else{
				content = '<img src="/images/noimage.png" style="width:150px; height:100px; border:1px solid #ccc;">'
			}
			content += '<div style="display:inline-block; margin-left:10px; font-size:1.3em; font-weight:bold; line-height:1.3">';
			content += '<a href="/c/' +company._id.id + '" target = "_blank">' +company._id.companyName+ '</a>';
			company._id.companyContactNumber.forEach(function(contact){
				content += '<p style="font-size:0.8em">'+contact.number+'</p>';
			})
			content += '<p class="company-rating" data-score="'+company.avgRating+'"></p>';

			content += '</div>';
			return content; 
		
		},
		setCompanyMarker : function(company){
			var marker = new google.maps.Marker({
		    	map: _map,
		    	anchorPoint: new google.maps.Point(0, -29),
		    	title : company.companyName,
		    	icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
		    	position : new google.maps.LatLng(company._id.location.coordinates[1], company._id.location.coordinates[0])
		  	});
		  	marker.addListener('click', function() {
		  		_infowindow.setContent(_mapSetting.setCompanyContent(company));
			    _infowindow.open(_map, this);
			    render.renderRating();
			});
			if( _markerArray.indexOf(marker) == -1 ){
			}else{
				_markerArray.push(marker);
			}
		},
		setHouseMarker : function(house){
			var marker = new google.maps.Marker({
		    	map: _map,
		    	anchorPoint: new google.maps.Point(0, -29),
		    	title : house._id.postTitle,
		    	icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
		    	position : new google.maps.LatLng(house._id.location.coordinates[1], house._id.location.coordinates[0])
		  	});
		  	marker.addListener('click', function() {
		  		_infowindow.setContent(_mapSetting.setHouseContent(house));
			    _infowindow.open(_map, this);
			    
			});
		  	if( _markerArray.indexOf(marker) == -1 ){

			}else{
				_markerArray.push(marker);
			}

		  	_markerArray.push(marker);
		},
		restoreMap : function(){
			var query = _util.getQuery();
			// _map.setCenter( new google.maps.LatLng(parseFloat(query.lat),parseFloat(query.lng) ) );
			// _map.setZoom( parseInt( query.zoom )) ;
		},
		restoreAutoComplete : function(){
			$("#autocomplete").geocomplete("find", _address.city +', '+ _address.state +', '+ _address.country)
			
		}
	};

	var init = {
		initArea : function(objs){
			_postRenderArea = objs.renderArea.post; 
			_companyRenderArea = objs.renderArea.company;
			_postPagination = objs.pagination.post;
			_companyPagination = objs.pagination.company;

		},
		initPagination : function(max){
			_postMaxPage = max.post;
			_companyMaxPage = max.company;
			Scaper.render.renderPostPagination();
			Scaper.render.renderCompanyPagination();
		},
		initLast : function(){
			// when user push back button. 
			render.renderReadMore();
			render.renderRating();
			_setting.local.setAddressByLocation();
		    _mapSetting.restoreAutoComplete();
			
			$(window).on("popstate", function (){
				// if the state is the page you expect, pull the name and load it.
				var query = _util.getQuery();
				_setting.local.setAddressByLocation();
				_search.findByAddress();
				_mapSetting.restoreMap();
			    _mapSetting.restoreAutoComplete();


			});
		},
		initMap :function(){
			var mapOptions;
			var last = _setting.localStorage.getLastMap();
			if(last.lat){
				mapOptions = {
			    	center: new google.maps.LatLng(last.lat, last.lng),
			    	zoom: last.zoom
			  	};
			}else{
				mapOptions = {
			    	center: new google.maps.LatLng(49.8879519, -119.49601059999998),
			    	zoom: 13
			  	};
			}
			
		  	
		  	var query = _util.getQuery();
		  	if(query.lng){
		  		mapOptions.center = new google.maps.LatLng( parseFloat(query.lat),  parseFloat(query.lng) );
		  		mapOptions.zoom = parseInt(query.zoom);
		  	}

		  	_map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

		  	google.maps.event.addListener(_map, 'zoom_changed', function() {
		  		_setting.localStorage.setLastMap();
		        _setting.location.setLocation('zoom_changed');
			})

			// google.maps.event.addListener(_map, 'center_changed', function() {
			// 	window.clearTimeout(_timer);
			// 	_timer = window.setTimeout(function(){
			// 		var mapCenter = _map.getCenter();
			// 		_setting.localStorage.setLastMap();
			// 		_setting.location.setLocation('center_changed');
			// 		_search.findOnMap();
			// 	},500);
			// });

			google.maps.event.addListener(_map, 'idle', function() {
				window.clearTimeout(_timer);
				_timer = window.setTimeout(function(){
					var mapCenter = _map.getCenter();
					_setting.localStorage.setLastMap();
					_setting.location.setLocation('center_changed');
					_search.findOnMap();
				},500);
			
			})
		},

		initAutoComplete :function(){
			// var input = /** @type {HTMLInputElement} */(document.getElementById('autocomplete'));
			// _autocomplete = new google.maps.places.Autocomplete(input);
		 //  	_autocomplete.bindTo('bounds', _map);

		 //  	google.maps.event.addListener(_autocomplete, 'place_changed', function() {
			//     var place = _autocomplete.getPlace();
			//     if (!place.geometry) {
			//       	window.alert("Please select the location with google autoComplete");
			//       	return;
			//     }
			//     // If the place has a geometry, then present it on a map.
			//     if (place.geometry.viewport) {
			//       	_map.fitBounds(place.geometry.viewport);
			//     } else {
			//       	_map.setCenter(place.geometry.location);
			//       	_map.setZoom(17);  // Why 17? Because it looks good.
			//     }

			//     if (place.address_components) {
			//         _util._fillInAddress(place);
			//         _setting.localStorage.setLastSearch();
			//         _setting.localStorage.setLastMap();
			//         _setting.local.setAddress();
			//         _setting.location.setLocation('place_changed');
			//       	_search.findByAddress();
			//     }
			// });
			$("#autocomplete").geocomplete()
			.bind('geocode:result',function(event,place){
				if (!place.geometry) {
			      	window.alert("Please select the location with google autoComplete");
			      	return;
			    }
			    // If the place has a geometry, then present it on a map.
			    if (place.geometry.viewport) {
			      	_map.fitBounds(place.geometry.viewport);
			    } else {
			      	_map.setCenter(place.geometry.location);
			      	_map.setZoom(17);  // Why 17? Because it looks good.
			    }

			    if (place.address_components) {
			        _util._fillInAddress(place);
			        _setting.localStorage.setLastSearch();
			        _setting.localStorage.setLastMap();
			        _setting.local.setAddress();
			        _setting.location.setLocation('place_changed');
			      	_search.findByAddress();
			    }

			})
			// _mapSetting.restoreAutoComplete();
		}
	};
	return {
		init : init,
		render : render
	}
})(jQuery, window, document);