var LI = {
	lastscrollpos : 0
	, child_added_index : 0
	, count : 0
	, delay : 0	
    , settings : {
        defaultRoom : "LifeIn"
    }
    , initAutocomplete : function (name, global){
        var input = document.getElementById(name)
        var autocomplete = new google.maps.places.Autocomplete(input)

        autocomplete.addListener('place_changed', function() {
            var place = autocomplete.getPlace();
            if (!place.geometry) {
              // User entered the name of a Place that was not suggested and
              // pressed the Enter key, or the Place Details request failed.
              window.alert("No details available for input: '" + place.name + "'");
              return;
            }
            if (place.geometry.viewport) {
              var latlng = place.geometry.location.toJSON()
              $('#'+name)
                .attr('lat',latlng.lat)
                .attr('lng',latlng.lng)
            }
        })
    }

    , createAccount : function(tpl, data){
        return $.Deferred(function(def) {
            secondaryApp.auth().createUserWithEmailAndPassword(data.email, data.password).then(function(user) {
                user.updateProfile({
                    displayName: data.nombre + ' ' + data.apellido,
                    photoURL: ''
                }).then(function() {
                    $.ajax({
                        method :'get',
                        url : '/sharer',
                        data : { 
                            email_to: data.email, 
                            name_to: data.nombre, 
                            subject: $.templates('#'+tpl+'_subject').render(data),
                            title: $.templates('#'+tpl+'_title').render(data),
                            content : $.templates('#'+tpl+'_message').render(data)
                        },
                        success : function(resp){
                            if(resp.status!='success') swal("Error","Error al enviar notificación","error")
                            def.resolve()
                        }
                    })
                }, function(error) {
                    swal('Error',error,'error')
                    def.reject()
                });        
            }, function(error) {
                var errorCode = error.code
                , errorMessage = error.message
                if (errorCode == 'auth/weak-password') {
                    swal('Error','La contraseña es demasiado débil.','error');
                } else {
                    swal('Error',error,'error')
                }
                def.reject()
            })
        })
    }
    , tools : {
        getResource : function(url){
            firebase.database().ref(url).once('value', function(snap) {
                console.log(snap.val())
            })
        }
    }
	, resetScroll : function(){
		$('body,html').scrollTop(this.lastscrollpos)
	}
	, resetWebflow : function(){
		Webflow.require('ix').init([
		  {"slug":"showmodal","name":"ShowModal","value":{"style":{},"triggers":[{"type":"click","selector":".modalcontainer","stepsA":[{"display":"block","opacity":0},{"display":"block","opacity":1,"transition":"opacity 500ms ease 0"}],"stepsB":[]}]}},
		  {"slug":"hidemodal","name":"HideModal","value":{"style":{},"triggers":[{"type":"click","selector":".modalcontainer","stepsA":[{"opacity":0,"transition":"opacity 250ms ease 0"},{"display":"none"}],"stepsB":[]}]}}
		])
		Webflow.ready()
	}	
	, setScroll : function(){
		var scrollpos = $(window).scrollTop()
		this.lastscrollpos = scrollpos
	}
	, checkUser : function(user){
		if(!user) return 
        if(typeof user.scope == 'object' && user.scope[0] != key && location.href != '/' + user.scope + '/menu'){
            return location.href = '/' + user.scope + '/menu'
        }

        $('.session-status').html(user.email)
        
        if(key && user.layouts && user.layouts[key]){
            var layout = user.layouts[key]
            , title = $(document).prop('title')
	        $(document).prop('title', title.replace(user.room))
            this.setStyleSheet($.templates('#layout').render(layout)) 
        }
	}
	, setStyleSheet : function(css){
		var head = document.head || document.getElementsByTagName('head')[0]
		, style = document.createElement('style')
		style.type = 'text/css'

		if (style.styleSheet){
		  style.styleSheet.cssText = css
		} else {
		  style.appendChild(document.createTextNode(css))
		}

		head.appendChild(style)
	}
	, aux : {
		humanTime : function(date){
			return moment(date).fromNow()
		}
		, getMimeType : function(url){
			var extension = url.substr( (url.lastIndexOf('.') +1) )
			, extension = extension.indexOf('?') > -1 ? extension.split("?")[0] : extension
			, mimetype = extension

			switch(extension) {
			        case 'au':
			        case 'snd':
			        mimetype = "basic"
			        break;
			        case 'rmi':
			        mimetype = "mid"
			        break;
			        case 'mp3':
			        mimetype = "mpeg"
			        break;
			        case 'mp4':
			        mimetype = "mp4"
			        break;
			        case 'aif':
			        case 'aifc':
			        case 'aiff':
			        mimetype = "x-aiff"
			        break;
			}

			return mimetype
		}
		, commaList: function(list){
			return list.join(", ")
		}
		, formatNumber : function (number){
			return typeof Intl=='object' ? new Intl.NumberFormat().format(number) : number
		}			
	}
    , animation : {
    	transition : {
    		factor : 2
    		, fadeIn : 150
    		, fadeOut : 150
    		, delay : 150
    		, delayed : 250
    	}
		, delayed : function(sel,delay) {
			if(delay==undefined) delay = this.transition.delayed
		  	$($(sel).eq(LI.count)).fadeIn()
		  	LI.count += 1
		  	delay = delay - LI.count/$(sel).length*delay
			if (LI.count < LI.child_added_index) {
				setTimeout(function(){
					LI.animation.delayed(sel)
				}, delay)
			}
		}
    }
	, randomString : function(a) {
	  var text = ""
	  , possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

	  for (var i = 0; i < a; i++)
	    text += possible.charAt(Math.floor(Math.random() * possible.length))

	  return text
	}    
	, sameString : function(a,b){
		return $.trim(a.toUpperCase()) === $.trim(b.toUpperCase())
	}
	, inArray : function(index,arr){
		return $.inArray(index,arr) > -1
	}
	, toJSON : function(json){
		return JSON.stringify(json)
	}
	, setParameterByName : function(name,value,url){
        if(!url) url = window.location.hash.split('#').join('')
        if(value == null) value = ''
        var pattern = new RegExp('\\b('+name+'=).*?(&|$)')
        if(url.search(pattern)>=0){
            return url.replace(pattern,'$1' + value + '$2')
        }
        return url + '&' + name + '=' + value 
    }
    , getParameterByName : function(name,url) {
        if(!url) url = window.location.hash
        name = name.replace(/[\[\]]/g, "\\$&")
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url)
        if(!results) return ''
        if(!results[2]) return ''
        return decodeURI(results[2].replace(/\+/g, " "))
    }
}