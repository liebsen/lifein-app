var ismobile=navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i)
, authmessages={"auth/user-not-found":"Usuario no válido","auth/wrong-password":"La contrseña es inválida. Tal vez mayúsculas?"}
, anim = helper.animation
, datosdeapoyo = {}  

jQuery.fn.insertAt = function(index, element) {
  var lastIndex = this.children().size()
  if (index < 0) {
    index = Math.max(0, lastIndex + 1 + index)
  }
  this.append(element);
  if (index < lastIndex) {
    this.children().eq(index).before(this.children().last())
  }
  return this
}

jQuery.fn.animateAdded = function (cb) {
    var that = this
    this.addClass('saving')
    setTimeout(function(){
        that.removeClass("saving")
    },1500)
}

jQuery.fn.animateRemoved = function (cb) {
    this.show().addClass('saving').fadeOut(1500,function(){
        if(typeof cb == 'function') cb.call(this)
    })
}

jQuery.fn.animateChanged = function (cb) {
    var that = this
    this.removeClass("unsaved").removeClass("saved").removeClass("saving")
    setTimeout(function(){
        that.addClass("saving")
    },10)
    setTimeout(function(){
        that.removeClass("saving").addClass("saved")
        if(typeof cb == 'function') cb.call(this)
    },1010)
}

jQuery.fn.serializeObjectMultiple = function() {
    var o = []
    , c = []
    , d = {}
    , a = this.serializeArray()

    $.each(a, function(i,arr) {
    	if(d[this.name]) d = {}
    	d[this.name] = this.value
    	if($.inArray(this.name,c) == -1){
    		c.push(this.name)
    	} 
    	if(i%c.length==0){
	    	o.push(d)
	    }
    })
    return o
}

jQuery.fn.serializeObject = function() {
    var o = {}
    , a = this.serializeArray()
    $.each(a, function() {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]]
            }
            o[this.name].push(this.value || '')
        } else {
            o[this.name] = this.value || ''
        }
    })
    return o
}

$(function(){
    $('.w-nav-link').not('.custom').click(function(e){
      e.preventDefault()
      var that = this
      $('body').fadeOut(helper.animation.transition.fadeOut*helper.animation.transition.factor,function(){
        location.href = $(that).attr('href')
      })
      return false
    })
    $('.show-profile-dropdown').click(function(){
        $('.profile-dropdown').toggle()
    })
})


$(document).on('click','.preferencias',function(){
    helper.setScroll()
    $('.spinner').fadeIn(anim.transition.fadeIn*anim.transition.factor, function(){
        firebase.database().ref('implementaciones/'+key).once('value').then(function(grupo) {
            $('.modalcontainer').html($.templates('#preferencias').render({key:grupo.key,data:grupo.val(),datosdeapoyo:datosdeapoyo},helper)).promise().done(function(){
                helper.resetWebflow()
                $('.spinner').fadeOut(anim.transition.fadeOut*anim.transition.factor,function(){
                    $('body,html').scrollTop(0)
                })
            })
        })
    })
})


$(document).on('submit','#preferencias-form',function(e){
    e.preventDefault()
    var data = $(this).serializeObject()
    , updates = {}
    , layout = {
      foto : data.foto
      , fondo : data.fondo
      , colorfondo : data.colorfondo
      , colortexto : data.colortexto
      , colorboton : data.colorboton
      , colortextoboton : data.colortextoboton
    }

    delete data.foto
    delete data.fondo
    delete data.colorfondo
    delete data.colortexto
    delete data.colorboton
    delete data.colortextoboton

    data.layout = layout

    // text
    if(key){
      updates['/implementaciones/' + key] = data
    } else {
      key = implementaciones.push().key
      updates['/implementaciones/' + key] = data
    }

    $('.spinner').fadeIn(anim.transition.fadeIn, function(){

      return new Promise(function(resolve, reject) {

        // files
        var until = 0
        , reach = 0

        $('.photo').each(function(){
          if($(this).get(0).files.length) {
            until++
          }
        })

        if(until === 0){
          resolve(updates)
        }

        $('.photo').each(function(){
          if($(this).get(0).files.length) {

            var name = $(this).attr('name')
            , file = $(this).get(0).files[0]
            , metadata = {
              customMetadata : {
                'name' : name
              }
            }

            firebase.storage().ref().child('images/' + file.name).put(file,metadata).then(function(snapshot){
              reach++
              var prop = snapshot.metadata.customMetadata.name.replace('_',' ')
              , value = snapshot.downloadURL

              data.layout[prop] = value
              updates['/implementaciones/' + key] = data

              if(reach === until){
                resolve(updates)    
              }
            })
          }
        })
      }).then(function(updates){
        var fbuser = localStorage.getItem("firebaseuser")
        , fbuser = $.parseJSON(fbuser)

        fbuser.layouts[key] = data.layout
        localStorage.setItem("firebaseuser",JSON.stringify(fbuser))

        return firebase.database().ref().update(updates, function(error){
          if(error){
            console.log(error)
            return false
          }else{
            $('#detail').fadeOut(anim.transition.fadeOut,function(){
              $('.lista').delay(anim.transition.delay).fadeIn(anim.transition.fadeIn,function(){
                helper.resetScroll()
                $('.spinner').fadeOut(anim.transition.fadeOut)
              })
            }) 
          }
        })
      }).then(function(udpates){

      })
    })

    return false  
})

$(document).on('click','.salir',function(){
    $('.spinner').fadeIn(helper.animation.transition.fadeIn*helper.animation.transition.factor,function(){
        firebase.auth().signOut().then(function() {
            localStorage.clear()
            location.href = '/'
        }).catch(function(err) {
            alert(err.message)
        })
    })
})

$(document).on('click','.login',function(){
    var email = $.trim($('#email').val())
    , pass = $.trim($('#password').val())
    , that = this

    $(this).prop('disabled',true).animate({opacity:0.7}).text("Por favor espere ... ")
    firebase.auth().signInWithEmailAndPassword(email, pass).catch(function(err) {
        if(err){
            $(that).prop('disabled',false).animate({opacity:1}).text("Continuar")
            swal("No se pudo iniciar sesión", authmessages[err.code], "error")
        }
    })      
})

$(document).on('click touchend','.export',function(){
    $("#list").html2csv({
        filename: $(this).attr('name') + '.csv',
        excludeColumns : '.csv-exclude',
        excludeRows : '.csv-exclude'
    })
})

$(document).on('keyup','.filtro',function(e){
    var index = $(this).val().toLowerCase()
    $('#list .row').each(function(){
        if($(this).find('div:not(.csv-exclude)').text().toLowerCase().indexOf(index) == -1) {
            $(this).fadeOut(100)
        } else {
            $(this).fadeIn(100) 
        }           
    })
})

moment.locale('es')
$.views.settings.delimiters("[[", "]]")