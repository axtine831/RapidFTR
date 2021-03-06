/* 		
	Beware:	
	
	parameters sent with the ajax calls are written like this:
	
	child[parameter1]:something
	
	This is because JSpec apparently can't handle when you write the parameters in real object syntax:
	
	child { parameter1: something }
	
	Real object notation will work fine when doing pure JQuery calls. Annoying, but true
	 
____________________________________________________________________________ */

describe 'API Test'

    urlPrefix = "http://" + window.location.host;

	var token;
	var childid;
	var responseBody = {};
	var parameters = {};
    var response = {};

	$.ajaxSetup({async:false});
	
	before_each
		responseBody = {};
		parameters = {};
        response = {};
	end
	
		it 'should return a autentication token'

		parameters = {user_name: "rapidftr", password: "rapidftr"}

		$.ajax({
			url: urlPrefix + "/sessions",
			dataType: 'json',
			data: parameters,
			type: 'POST',
			cache: false,
			success: function(data)
			{
				responseBody = data
		    },
			complete: function(xmlHttpRequest)
			{
                response = xmlHttpRequest;
                token = responseBody.session.token

			}
		});

        response.status.should.eql 201
		responseBody.should.not.be_empty
		token.should.not.be_empty

	end

    it 'should return 401 not authorized when authenticating with invalid password'

		parameters = {user_name: "rapidftr", password: "wrongpassword"};

		$.ajax({
			url: urlPrefix + "/sessions",
			dataType: 'json',
			data: parameters,
			type: 'POST',
			cache: false,
			complete: function(xmlHttpRequest)
			{
                response = xmlHttpRequest;

			}
		});

        response.status.should.eql 401
	end

	it 'should return a list of forms that specify the details to be collected about a child'

		$.ajax({
			url: urlPrefix + "/published_form_sections",
		  	dataType: 'json',
			cache: false,
			beforeSend: function(request)
			{
				request.setRequestHeader('Authorization', "RFTR_Token " + token)
			},
		  	success: function(data)
			{
				//alert(data.toSource());

				responseBody = data
		    }
		})

		responseBody.should.not.be_empty
		responseBody.should.be_a Array
        firstForm = responseBody[0]
        firstForm.name.should.not.be_empty
        firstForm.fields.should.not.be_empty
        firstForm.fields.should.be_a Array

	end

	it 'should create a new child record'

		parameters = { "child[name]": "apichild", "child[last_known_location]": "New York City"}

		$.ajax({
			url: urlPrefix + "/children",
			dataType: 'json',
			type: 'POST',
			cache: false,
			data: parameters,
			beforeSend: function(request)
			{
				request.setRequestHeader('Authorization', "RFTR_Token " + token)
			},
			success: function(data)
			{
				responseBody = data
		    }
		})
		
		responseBody.should.not.be_empty
		responseBody.should.have_property "name"
		responseBody.should.have_property "last_known_location"
		responseBody.name.should.eql parameters["child[name]"]
		responseBody.last_known_location.should.eql parameters["child[last_known_location]"]
		
		childid = responseBody._id
		
	end

	it 'should return list of all children in database'

		$.ajax({
			url: urlPrefix + "/children",
		  	dataType: 'json',
			cache: false,
			beforeSend: function(request)
			{
				request.setRequestHeader('Authorization', "RFTR_Token " + token)
			},
		  	success: function(data)
			{
				//alert(data.toSource());
				
				responseBody = data
		    }
		})
		
		responseBody.should.not.be_empty
		responseBody.should.be_a Array
		
	end

	it 'should return record of child with specified id'

		$.ajax({
			url: urlPrefix + "/children/" + childid,
		  	dataType: 'json',
			cache: false,
			beforeSend: function(request)
			{
				request.setRequestHeader('Authorization', "RFTR_Token " + token)
			},
		  	success: function(data)
			{
				//alert(data.toSource());

				responseBody = data
		    }
		})

		responseBody.should.not.be_empty
		responseBody.should.have_property "name"
		responseBody.should.have_property "last_known_location"

	end

    it 'should return 401 not authorized when making a request with invalid token'

        $.ajax({
            url: urlPrefix + "/children/" + childid,
              dataType: 'json',
            cache: false,
            beforeSend: function(request)
            {
                request.setRequestHeader('Authorization', "RFTR_Token " + "Invalid token")
            },
            complete: function(xmlHttpRequest)
            {
                response = xmlHttpRequest;
            }
        })

        response.status.should.eql 401
    end

	it 'should update record of child with specified id'

		$.ajax({
			url: urlPrefix + "/children/" + childid,
			dataType: 'json',
			type: 'PUT',
			cache: false,
			data: { "child[name]": "apichild renamed" },
			beforeSend: function(request)
			{
				request.setRequestHeader('Authorization', "RFTR_Token " + token)
			},
			success: function(data)
			{
				//alert(data.toSource());
				
				responseBody = data
		    }
		})
		
		responseBody.should.not.be_empty
		responseBody.should.have_property "name"
		responseBody.should.have_property "last_known_location"
		
	end

	it 'should delete record of child with specified id'
	
		$.ajax({
			url: urlPrefix + "/children/" + childid,
			dataType: 'json',
			type: 'DELETE',
			cache: false,
			beforeSend: function(request)
			{
				request.setRequestHeader('Authorization', "RFTR_Token " + token)
			},
			success: function(data)
			{
				//alert(data.toSource());
				
				responseBody = data
		    }
		})
		
		responseBody.should.not.be_empty
		responseBody.response.should.eql "ok"
	
	end

end
