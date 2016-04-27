var Marketing = (function(company){
	var $displayTags = $('#displayTags');
	var totalKeywords = [];
	$('#title').val(company.seo.title);
	$('#id').val(company.id);
	$('#seoDescription')
	.on('keydown',function(){
		var count = $(this).val().length;
		$('#descriptionCount').html(count);
	})
	.on('change',function(){
		var count = $(this).val().length;
		$('#descriptionCount').html(count);
	})
	company.seo.keywords.forEach(function(tag){
		totalKeywords.push(tag);
	})

	$('#seoKeywords').on('submit',function(e){
		e.preventDefault();
		totalKeywords.push($('#keyword').val());
		renderKeyword();
	})

	function renderKeyword(){
		
		// div has to be empty before fill it up the covered area.
		$displayTags.html('');
		totalKeywords.forEach(function(keyword){
			var close = $('<i/>',{
				"class" : "fa fa-times remove-btn",
			}).click(function(){
		        removeKeyword(keyword);
		    })
			var city = $('<div>'+keyword+'</div>')
			.addClass("keyword");
			close.appendTo(city);
			city.appendTo($displayTags);
			
		})
	}
	function removeKeyword(keyword){
		totalKeywords.splice(totalKeywords.indexOf(keyword), 1);
		renderKeyword();
	}

	renderKeyword();

	function updateMarketingSetting(){
		$('#idMessage').html('');
		var formData = {
			id : $('#id').val(),
			title : $('#title').val(),
			keywords : totalKeywords,
			description : $('#seoDescription').val()
		}

		jQuery.ajax({
		    url: "/companies/my_company/setting/update_marketing", 
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
	    		if(data.status == 'fail'){
	    			$('#idMessage').html(data.reason);
	    		}
		        
		    }
		});
	}
	return {
		updateMarketingSetting : updateMarketingSetting
	}
})(CompanyObj)
