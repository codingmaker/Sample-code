var Basic = (function(company){
	// upload url
	var url = '/uploadImage/company/' + company._id;
	var telOption = {
		"allowExtensions" : true,
		"autoFormat" : true
	}

	$("[data-toggle=popover]").popover({
		html : true
	});
	// image uploader.
    $('#fileupload').fileupload({
        url: url,
        dataType: 'json',
        formData: {
            company : company._id
      	},
        add: function(e, data) {
            var uploadErrors = [];
            var acceptFileTypes = /^image\/(gif|jpe?g|png)$/i;
            if(data.originalFiles[0]['type'].length && !acceptFileTypes.test(data.originalFiles[0]['type'])) {
                uploadErrors.push('Not an accepted file type');
            }
            // console.log(data.originalFiles[0]['size']);
            if(data.originalFiles[0]['size'] > 4194304) {
                uploadErrors.push('Filesize is too big');
            }
            if(uploadErrors.length > 0) {
                alert(uploadErrors.join("\n"));
            } else {
                data.submit();
            }
        },
        done: function (e, data) {
            $.each(data.result.files, function (index, file) {
				$('#companyLogo').attr("src",file.url)

				updateLogo(file);	                
            });
        }
       
    })
	// init the value from the server.
	$('#companyName').val(company.companyName);
	$('#companyEmail').val(company.companyEmail);
	$('#companyAddress2').val(company.companyAddress.other);
	$(".companyNumber").intlTelInput(telOption);


	var marker;
	var map = null;
	var initMap = false;
	var $contactNumberArea = $('#contactNumbersArea');

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
	};


	
	var addContactNumber = function(){
		console.log('hah')
		var telInput = $('<input>').attr({
			type : 'text',
			class : 'companyNumber form-control number'
		})
		var noteInput = $('<input>').attr({
			type : 'text',
			class : 'form-control text-inline-block note',
			placeholder : 'Branch of city or name of phone owner.'
		})
		
		var removeBtn = $('<i></i>',{
			class : "fa fa-times remove-contact-number"
		})  

		var inputs = $('<div></div>').css('margin-bottom','10px').append(telInput).append(noteInput).append(removeBtn);
		$contactNumberArea.append(inputs);
		var number = $(".companyNumber").intlTelInput(telOption);

		$('.fa-times.remove-contact-number').on('click',removeContactNumber);

	}

	var removeContactNumber = function(event){
		$(event.target).parent().remove();
	}

	var fillInAddress = function(place){
		for (var i = 0; i < place.address_components.length; i++) {

		    var addressType = place.address_components[i].types[0];
		    if (addressComponentForm[addressType]) {
		    	var val = place.address_components[i][addressComponentForm[addressType]];
		    	completeAddress[addressType] = val;
		    }
		}
	}

	$('#addContactNumberButton').on('click',addContactNumber);
	$('.fa-times.remove-contact-number').on('click',removeContactNumber);


	// update database after uploading  
	function updateLogo(file){
		jQuery.ajax({
		    url: "/companies/my_company/setting/update_logo", 
		    type: "POST",
		    statusCode : {
		    	500 : function(err){
		    		console.log(err);
		    	},
		    	400 : function(err){
		    		console.log(err);
		    	}
		    },
		    data: file,
		    success: function (data, textStatus, jqXHR) { 
	    		if(data.status == 'success'){
	    			saveComplete();
	    		}
		        
		    }
		});
	}

	var initBasicSetting = function(){
		if(map === null){
			var mapOptions = {
		        center: new google.maps.LatLng(company.location.coordinates[1] + ',' + company.location.coordinates[0]),
		        zoom: 15
		    };
		    
		    map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
		
	    
	    
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

		    $("#companyAddress").geocomplete("find", company.companyAddress.findAddress)
		    .bind("geocode:result", function(event, place){

			    fillInAddress(place);
			    // console.log(place);
			    if (!place.geometry) {
		          return ;
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
			        if(!initMap){
			    		marker.setPosition(new google.maps.LatLng(parseFloat(company.location.coordinates[1]),parseFloat(company.location.coordinates[0])) );
			    		initMap = true;
			    	}
			        marker.setVisible(true);
		        }
			});
		}

	}
	
	// update Basic Setting
	var updateBasicSetting = function(){
		var numbers = $('.number');
		var notes = $('.note');
		var companyNumbers = [];
		for(var i =0; numbers.length > i; i++){
			var num = {
				number : $(numbers[i]).val(),
				note : $(notes[i]).val()
			}
			companyNumbers.push(num);
		}
		if($('#companyName').val().length < 50){
			
			var formData = {
				companyName : $('#companyName').val(),
				companyContactNumber : companyNumbers,
				companyEmail : $('#companyEmail').val(),
				companyAddress : completeAddress,
				changedAt : new Date(),
				location : {}
			}

			formData.companyAddress = completeAddress;
			formData.companyAddress.findAddress = $('#companyAddress').val();
			formData.companyAddress.other = $('#companyAddress2').val();
			console.log(marker.getPosition().lng()+','+ marker.getPosition().lat());
			formData.location.coordinates = [marker.getPosition().lng(), marker.getPosition().lat()];
			console.log(formData);
			jQuery.ajax({
			    url: "/companies/my_company/setting/update_basic", 
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
		    			saveComplete();
		    		}
			        
			    }
			});

		}else{
			$('#companyName').focus();
			$('#companyNameHint').html('company name can\'t be over 40 characters');
		}
		
	}


	return {
		initBasicSetting : initBasicSetting,
		updateBasicSetting : updateBasicSetting
	}


})(CompanyObj);