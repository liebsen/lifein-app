var ismobile=navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i)
, authmessages={"auth/user-not-found":"Usuario no válido","auth/wrong-password":"La contrseña es inválida. Tal vez mayúsculas?"}
, anim = LI.animation
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
      $('body').fadeOut(LI.animation.transition.fadeOut*LI.animation.transition.factor,function(){
        location.href = $(that).attr('href')
      })
      return false
    })
    $('.show-profile-dropdown').click(function(){
        $('.profile-dropdown').toggle()
    })
})

$(document).on('click','.preferencias',function(){
    LI.setScroll()
    if($('.modalcontainer').html() != '') return $('.modalcontainer').fadeIn()
    console.log($('.modalcontainer').length)
    $('.spinner').fadeIn(anim.transition.fadeIn*anim.transition.factor, function(){
        firebase.database().ref('implementaciones/'+key).once('value').then(function(grupo) {
          var data = grupo.val()
            $('.spinner').fadeOut(anim.transition.fadeOut*anim.transition.factor,function(){
                $('.modalcontainer').html($.templates('#preferencias').render({key:grupo.key,data:data,layout:data.layout,datosdeapoyo:datosdeapoyo},LI)).promise().done(function(){
                    LI.resetWebflow()                
                    $('body,html').scrollTop(0)
                })
            })
        })
    })
})

$(document).on('submit','#preferencias',function(e){
    e.preventDefault()

    var data = $(this).serializeObject()
    , updates = {}
    , layout = {
      foto : data.foto
      , fondo : data.fondo
      , font : data.fuente
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
        LI.setStyleSheet($.templates('#layout').render(data.layout,LI)) 
        LI.setExternalStyleSheet("https://fonts.googleapis.com/css?family=" + data.layout.font + ":300,400,500,700") 
        return firebase.database().ref().update(updates, function(error){
          if(error){
            swal("Error firebase",error,"error")
          }
          $('.spinner').fadeOut(anim.transition.fadeOut*anim.transition.factor,function(){
            $('.modalcontainer').fadeOut(anim.transition.fadeOut)
            LI.resetScroll()
            swal("Preferencias","Las preferencias han sido actualizadas","success")
          })
        })
      })
    })

    return false  
})

$(document).on('click','.link-fondo',function(e) {
    var position =  $(this).index()
    $('.photo:eq(' + position + ')').click()
    e.preventDefault()
})

$(document).on('click','.link-foto',function(e) {
    var position =  $(this).index()
    $('.photo:eq(' + position + ')').click()
    e.preventDefault()
})

$(document).on('change','.photo',function (e) {
    var that = this 
    if (this.files && this.files[0]) {
        var reader = new FileReader()
        reader.onload = function (e) {
          $('.publish__uploadimages--preview > div:eq(' + $(that).index() + ')').css({'background-image':'url('+e.target.result+')'})
        }
        reader.readAsDataURL(this.files[0])
    }     
})

$(document).on('click','.salir',function(){
    $('.spinner').fadeIn(LI.animation.transition.fadeIn*LI.animation.transition.factor,function(){
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

$(document).on('click','.bind-entry',function(){
    var url = $(this).attr('url')
    , key = $(this).attr('key')
    , val = $(this).attr('val')

    $('.spinner').fadeIn(anim.transition.fadeIn, function(){
        firebase.database().ref(url).orderByChild(key).equalTo(val).once('value', function(snap) {
            var item = snap.val()
            $('.spinner').fadeOut(anim.transition.fadeOut*anim.transition.factor)
            if(item){
                var snapKey = Object.keys(item)[0]
                return swal({
                  title: null,
                  text: $.templates('#bind_entry').render(item[snapKey]),
                  type: "success",
                  showCancelButton: false,
                  confirmButtonColor: "#DD6B55",
                  confirmButtonText: "OK",
                  closeOnConfirm: false,
                  html: true
                },
                function(){
                  swal.close()
                })
            }
            return swal("Error","no se encontró " + val + " en " + url,"error")
        })
    })
})

moment.locale('es')
$.views.settings.delimiters("[[", "]]")