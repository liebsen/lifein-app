var helper = {
	lastscrollpos : 0
	, child_added_index : 0
	, count : 0
	, delay : 0	
	, resetScroll : function(){
		$('body,html').scrollTop(this.lastscrollpos)
	}
	, setScroll : function(){
		var scrollpos = $(window).scrollTop()
		this.lastscrollpos = scrollpos
	}
	, checkUser : function(user){
		if(!user) return 
        if(user.scope != 'super' && user.scope != id && location.href != '/' + user.scope + '/menu'){
            return location.href = '/' + user.scope + '/menu'
        }
        $('.session-status').html(user.email)
        if(id && user.layouts && user.layouts[id]){
            var layout = user.layouts[id]
            , title = $(document).prop('title')
	        $(document).prop('title', title.replace("LifeIn",user.area))
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
		audios : {
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
		}
		, consultas : {
			humanTime : function(date){
				return moment(date).fromNow()
			}
		}
		, cotizaciones : {
			humanTime : function(date){
				return moment(date).fromNow()
			}
			, commaList: function(list){
				return list.join(", ")
			}
			, formatNumber : function (number){
				return typeof Intl=='object' ? new Intl.NumberFormat().format(number) : number
			}			
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
		  	$($(sel).eq(helper.count)).fadeIn()
		  	helper.count += 1
		  	delay = delay - helper.count/$(sel).length*delay
			if (helper.count < helper.child_added_index) {
				setTimeout(function(){
					helper.animation.delayed(sel)
				}, delay)
			}
		}
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
    , spotify : {
    	getArtists : function(artists){
    		var parts = []
    		for(var i in artists){
    			parts.push(artists[i].name)
    		}
    		return parts
    	}
		, isActive : function(id){
			var jsonstr = $('.song.active').attr('json')
			var json = $.parseJSON(jsonstr)
			return json.data.id == id
		}
		, toJSON : function(json){
			return JSON.stringify(json)
		}
    }
}