
var helpMessage = 'message';
var marker = null;
var addressComponentForm = {
  street_number: 'short_name',
  route: 'long_name',
  locality: 'long_name',
  administrative_area_level_1: 'short_name',
  country: 'long_name',
  postal_code: 'short_name'
};

var completeAddress = {
	street_number: null,
	route: null,
	locality: null,
	administrative_area_level_1: null,
	country: null,
	postal_code: null
}
function helper(message){
	$('#help').html(message);
}


$('#title').on('focus',function(event){
	helpMessage = 'Name of the place of business/residence <br/> that is looking for lanscaping.';
	helper(helpMessage);
})
$('#address').on('focus',function(event){
	helpMessage = 'Type your Street and Street number and select the autocomplete. <br/> ex) 450 Yates Road Canada <br/> and Check the map and marker, if marker suggest wrong place, move your marker to right place.';
	helper(helpMessage);
})
$('#address2').on('focus',function(event){  
	helpMessage = 'Write your another address';
	helper(helpMessage);
})
$('#houseContactNumber').on('focus',function(event){
	helpMessage = 'Write your Contactable phone number this number will be used when Landscaper contact you';
	helper(helpMessage);
})
$('#email').on('focus',function(event){
	helpMessage = 'Write your Contactable phone email this number will be used when Landscaper contact you';
	helper(helpMessage);
})


function fillInAddress(place){
	
	for (var i = 0; i < place.address_components.length; i++) {

	    var addressType = place.address_components[i].types[0];
	    if (addressComponentForm[addressType]) {
	    	var val = place.address_components[i][addressComponentForm[addressType]];
	    	completeAddress[addressType] = val;
	    }
	}
	
}

// when use click + button trigger initAddHouse(); because of google map is not showed in the modal without trigger.
function initAddHouse (){
	var option = {
		"allowExtensions" : true,
		"autoFormat" : true
	}
	var number = $("#houseContactNumber").intlTelInput(option);
	var input = document.getElementById('address');
    var mapOptions = {
        center: new google.maps.LatLng(-33.8688, 151.2195),
        zoom: 13
    };
    var map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    // var infowindow = new google.maps.InfoWindow();
    marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29),
        draggable : true
    });
    
    //init marker
    marker.setIcon(/** @type {google.maps.Icon} */({
        url: 'http://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png',
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(35, 35)
    }));
    marker.setPosition(new google.maps.LatLng(parseFloat(-33.8688),parseFloat(151.2195)) );


    


    //when client type the address 
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        var place = autocomplete.getPlace();
		
		// when place is not exist on the auto complete form.
		if (!place.geometry) {
          window.alert("Please click the suggestion from autocomplete");
          return;
        }else{
    		// If the place has a geometry, then present it on a map.
        	fillInAddress(place);
        	if (place.geometry.viewport) {
	          map.fitBounds(place.geometry.viewport);
	        } else {
	          map.setCenter(place.geometry.location);
	          map.setZoom(17);  // Why 17? Because it looks good.
	        }
	        
	        marker.setPosition(place.geometry.location);
	        marker.setVisible(true);
        }
        
    })
}


$("#add-house").on('shown.bs.modal',function(e){
	initAddHouse();
})



function addHouse() {
	var formData = {
		title : $('#title').val(),
		contactNumber : $('#houseContactNumber').val(),
		email : $('#HouseEmail').val(),
		location : {
			coordinates : []
		}
	}


	var markerPosition = marker.getPosition();
	formData.address = completeAddress;
	formData.address.findAddress = $('#address').val();
	formData.address.other = $('#address2').val();
	var coordinates = [markerPosition.lng(),markerPosition.lat()]
	formData.location.coordinates = coordinates
	if(formData.title){

		if(formData.contactNumber){
			
			if(completeAddress.locality){
				// Good to go
				jQuery.ajax({
				    url: "/users/me/house/add_house", 
				    type: "POST",
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
			    			location.reload();
			    		}
				        
				    }
				});


			}else{
				$('#address').focus();
			}

		}else{
			$('#houseContactNumber').focus();
		}
	}else{
		$('#title').focus();

	}
	
}
