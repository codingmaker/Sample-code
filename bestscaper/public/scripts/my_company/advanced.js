var Advanced = (function(company){
	/*
	Advanced Setting with init 
	*/
	var addressComponentForm = {
	  street_number: 'short_name',
	  route: 'long_name',
	  locality: 'long_name',
	  administrative_area_level_1: 'short_name',
	  country: 'long_name',
	  postal_code: 'short_name'
	};

	var totalServices = [];
	var totalCoveredAreas = [];
	var $displayService =  $("#displayServices");
	var $displayArea = $("#displayCoveredArea");
	var $inputService = $('#services');
	var isInitAdvanced = false;

	function CompleteCoverdArea(city, state, country){
		this.city = city;
		this.state = state;
		this.country = country;
	}

	var completeCoverdAddress ={
		locality: null,
		administrative_area_level_1: null,
		country: null,
	}

	function fillInCoveredArea(place){
		for (var i = 0; i < place.address_components.length; i++) {

		    var addressType = place.address_components[i].types[0];
		    if (addressComponentForm[addressType]) {
		    	var val = place.address_components[i][addressComponentForm[addressType]];
		    	completeCoverdAddress[addressType] = val;
		    }
		}

		return new CompleteCoverdArea(completeCoverdAddress['locality'],completeCoverdAddress['administrative_area_level_1'],completeCoverdAddress['country'])
	}

	$('#serviceForm').on('submit',function(e){
		e.preventDefault();
		var serviceContent = $inputService.val();
		totalServices.push(serviceContent);
		$inputService.val('');
		renderServices();
	})
	
	// company coveredarea 
		if(company.coveredAreas){
			company.coveredAreas.forEach(function(area){
				
				totalCoveredAreas.push({
						'city' : area.city,
						'state' : area.state,
						'country' : area.country
					});
				
			})
		}

		if(company.services){
			company.services.forEach(function(service){
				totalServices.push(service);
			})
		}

	

	//categories 
	if(company.categories){
		company.categories.forEach(function(category){
			$('input[value="'+category+'"]').prop('checked',true);
		})
	}
	
	function renderServices(){
		$displayService.html('');
		totalServices.forEach(function(service){
			var close = $('<i/>',{
				"class" : "fa fa-times remove-btn",
			}).click(function(){
		        removeService(service);
		    })

			var newService = $("<li/>",{
				"class" : "col-xs-6",
				"text": service
			})
			close.appendTo(newService);
			newService.appendTo($displayService);
		})
	}

	function removeService(service){
		totalServices.splice(totalServices.indexOf(service),1);
		renderServices();
	}
	
	function initAdvancedSetting(){
		if(!isInitAdvanced){
			isInitAdvanced = true; 
			var input = document.getElementById('coveredArea');
		    var coveredCity = new google.maps.places.Autocomplete(input);

		    google.maps.event.addListener(coveredCity, 'place_changed', function() {
		        var place = coveredCity.getPlace();
		        var complete = fillInCoveredArea(place);
				// if the city is already exist in the array, don't render and pop up the alert
				if(totalCoveredAreas.indexOf(complete) === -1){
					console.log(totalCoveredAreas);
					totalCoveredAreas.push(complete);
					input.value="";
					renderCoveredAreas();
					// console.log(totalCoveredAreas);
				}else{
					alert('This location is already on the list.')
				}
			})
		}
	}

	function renderCoveredAreas(){
		
		// div has to be empty before fill it up the covered area.
		$displayArea.html('');
		totalCoveredAreas.forEach(function(area){
			// console.log(area);
			var close = $('<i/>',{
				"class" : "fa fa-times remove-btn",
			}).click(function(){
		        removeCoveredArea(area);
		    })
			var city = $('<div>'+area.city+'</div>')
			.addClass("coveredArea");
			close.appendTo(city);
			city.appendTo($displayArea);
		})
	}
	function removeCoveredArea(obj){
		totalCoveredAreas.splice(totalCoveredAreas.indexOf(obj), 1);
		renderCoveredAreas();
	}

	function updateAdvancedSetting(){
		var categories = [];
		$("input[name='categories']:checked").each(function(checkbox){
			categories.push($(this).val());
		})
		var formData = {
			coveredAreas : totalCoveredAreas,
			services : totalServices,
			categories : categories,
			description : $('#description').val()
		}

		jQuery.ajax({
		    url: "/companies/my_company/setting/update_advanced", 
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
	    			$('#advancedMessage').css("display",'none')

	    		}else if(data.status == 'fail'){
	    			
	    			$('#advancedMessage').html(data.message);
	    			$('#advancedMessage').css("display",'block')
	    		}
		        
		    }
		});
	}

	initAdvancedSetting();
	renderCoveredAreas();
	renderServices();
	return {
		initAdvancedSetting : initAdvancedSetting,
		updateAdvancedSetting : updateAdvancedSetting

	}
})(CompanyObj)