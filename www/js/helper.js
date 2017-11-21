var LI = {
	lastscrollpos : 0
    , date_format : 'YYYY-MM-DD'
	, child_added_index : 0
	, count : 0
	, delay : 0	
    , settings : {
        defaults : {
            layout : {
                colorfondo : "#ffffff",
                colortexto : "#222",
                colorboton : "#222",
                colortextoboton : "#223c61",
                font : "Poppins",
                foto : "/images/foto-medidas.png",
                //foto : "/images/LifeIn-White.png",
                fondo : "/images/fondo-medidas.png"
            },
            room : "LifeIn"
        }
    }
    , get_date_format : function(format){
        return format||LI.date_format;
    }
    , controls : function(){
        $('body,html').scrollTop(0);
    }
    , getLayoutProp : function(name,prop){
        return prop && prop != "" ? prop : LI.settings.defaults.layout[name];
    }
    , initAutocomplete : function (name){
        var input = document.getElementById(name);
        var autocomplete = new google.maps.places.Autocomplete(input);

        autocomplete.addListener('place_changed', function() {
            var place = autocomplete.getPlace();
            if (!place.geometry) {
              window.alert("No details available for input: '" + place.name + "'");
              return;
            }
            if (place.geometry.viewport) {
              var latlng = place.geometry.location.toJSON();
              $('#'+name)
                .attr('lat',latlng.lat)
                .attr('lng',latlng.lng);
            }
        })
    }
    , notify : function(data){
        var noti =  {
            fecha: moment().format(),
            tipo : data.type,
            destino : data.user_id,
            titulo : data.title,
            texto : data.text
        };

        if(!data.status_ref && data.status){
          noti.icon = 'success';
        } else if(data.status_ref && !data.status){
          noti.icon = 'error';
        }

        var notificaciones = firebase.database().ref('/notificaciones/' + key);
        return notificaciones.child(notificaciones.push().key).set(noti);
    }
    , createAccount : function(tpl, data){
        return secondaryApp.auth().createUserWithEmailAndPassword(data.email, data.password).then(function(user) {
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
                        if(resp.status!='success') swal("Error","Error al enviar notificación","error");
                        return resp;
                    }
                })
            }, function(error) {
                swal('Error',error,'error');
                return error;
            });        
        }, function(error) {
            var errorCode = error.code
            , errorMessage = error.message;
            if (errorCode == 'auth/weak-password') {
                swal('Error','La contraseña es demasiado débil.','error');
            } else {
                swal('Error',error,'error');
            }
            return error;
        })
    }
    , tools : {
        getResource : function(url){
            firebase.database().ref(url).once('value', function(snap) {
                console.log(snap.val());
            });
        }
    }
	, resetScroll : function(){
		$('body,html').scrollTop(this.lastscrollpos);
	}
	, resetWebflow : function(){
		Webflow.require('ix').init([
		  {"slug":"showmodal","name":"ShowModal","value":{"style":{},"triggers":[{"type":"click","selector":".modalcontainer","stepsA":[{"display":"block","opacity":0},{"display":"block","opacity":1,"transition":"opacity 500ms ease 0"}],"stepsB":[]}]}},
		  {"slug":"hidemodal","name":"HideModal","value":{"style":{},"triggers":[{"type":"click","selector":".modalcontainer","stepsA":[{"opacity":0,"transition":"opacity 250ms ease 0"},{"display":"none"}],"stepsB":[]}]}}
		]);
        $('.minicolors').each(function(){
          if( ! $(this).hasClass('minicolors-theme-default')){
            $(this).minicolors({format:'rgba'});
          }
        });
		Webflow.ready();
	}	
	, setScroll : function(){
		var scrollpos = $(window).scrollTop();
		this.lastscrollpos = scrollpos;
	}
	, checkUser : function(user){
		if(!user) return;
        if(user.rol != 'super' && typeof user.scope == 'object' && user.scope[0] != key && location.href != '/' + user.scope + '/menu'){
            return location.href = '/' + user.scope + '/menu';
        }

        $('.session-status').html(user.email);
        
        if(key && user.layouts && user.layouts[key]){
            var layout = user.layouts[key]
            , title = $(document).prop('title');
	        $(document).prop('title', title.replace(user.room));

            this.setStyleSheet($.templates('#layout').render(layout,LI));
            this.setExternalStyleSheet("https://fonts.googleapis.com/css?family=" + layout.font + ":300,400,500,700");
        }
	}
    , setExternalStyleSheet : function(css){
        $("head").append("<link rel='stylesheet' type='text/css' href='"+css+"' />");
    }
	, setStyleSheet : function(css){
		var head = document.head || document.getElementsByTagName('head')[0]
		, style = document.createElement('style');
		style.type = 'text/css';

		if (style.styleSheet){
		  style.styleSheet.cssText = css;
		} else {
		  style.appendChild(document.createTextNode(css));
		}

		head.appendChild(style);
	}
	, aux : {
        toJSON : function(obj){
            return JSON.stringify(obj);
        },
        getKey : function(){
            return key;
        },
        isURL : function(str){
            return str.indexOf('http://') > -1 || str.indexOf('https://') > -1;
        },
        easyDate : function(date,format){
            return moment(date,LI.get_date_format(format)).format('DD/MM HH:MM');
        },
        dateDay : function(date,format){
            return moment(date,LI.get_date_format(format)).format('DD');
        },
        dateMon : function(date,format){
            return moment(date,LI.get_date_format(format)).format('MMMM');
        },
        dateWDay : function(date,format){
            return moment(date,LI.get_date_format(format)).format('ddd');
        },        
        dateHour : function(date,format){
            return moment(date,LI.get_date_format(format)).format('HH:MM');
        },
        dateDue : function(date,format){
            return moment().format('x') > moment(date,LI.get_date_format(format)).format('x');
        },        
		humanTime : function(date,format){
			return moment(date).fromNow()
		}
		, getMimeType : function(url){
			var extension = url.substr( (url.lastIndexOf('.') +1) )
			, extension = extension.indexOf('?') > -1 ? extension.split("?")[0] : extension
			, mimetype = extension;

			switch(extension) {
			        case 'au':
			        case 'snd':
			        mimetype = "basic";
			        break;
			        case 'rmi':
			        mimetype = "mid";
			        break;
			        case 'mp3':
			        mimetype = "mpeg";
			        break;
			        case 'mp4':
			        mimetype = "mp4";
			        break;
			        case 'aif':
			        case 'aifc':
			        case 'aiff':
			        mimetype = "x-aiff";
			        break;
			}

			return mimetype;
		}
		, commaList: function(list){
			return list.join(", ");
		}
		, formatNumber : function (number){
			return typeof Intl=='object' ? new Intl.NumberFormat().format(number) : number;
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
			if(delay==undefined) delay = this.transition.delayed;
		  	$($(sel).eq(LI.count)).fadeIn();
		  	LI.count += 1;
		  	delay = delay - LI.count/$(sel).length*delay;
			if (LI.count < LI.child_added_index) {
				setTimeout(function(){
					LI.animation.delayed(sel)
				}, delay);
			}
		}
    }
	, randomString : function(a) {
	  var text = ""
	  , possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	  for (var i = 0; i < a; i++){
	    text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

	  return text;
	}    
	, sameString : function(a,b){
		return $.trim(a.toUpperCase()) === $.trim(b.toUpperCase());
	}
	, inArray : function(index,arr){
		return $.inArray(index,arr) > -1;
	}
	, toJSON : function(json){
		return JSON.stringify(json);
	}
	, setParameterByName : function(name,value,url){
        if(!url) url = window.location.hash.split('#').join('');
        if(value == null) value = '';
        var pattern = new RegExp('\\b('+name+'=).*?(&|$)');
        if(url.search(pattern)>=0){
            return url.replace(pattern,'$1' + value + '$2');
        }
        return url + '&' + name + '=' + value;
    }
    , getParameterByName : function(name,url) {
        if(!url) url = window.location.hash;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
        if(!results) return '';
        if(!results[2]) return '';
        return decodeURI(results[2].replace(/\+/g, " "));
    }
}