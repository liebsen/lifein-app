var config = {
  apiKey: "AIzaSyDoB2DWScwE3614oe70uV_tj5vuwa7tB1g",
  authDomain: "lifeindev-808c2.firebaseapp.com",
  databaseURL: "https://lifeindev-808c2.firebaseio.com",
  projectId: "lifeindev-808c2",
  storageBucket: "lifeindev-808c2.appspot.com",
  messagingSenderId: "502763098312"
};

firebase.initializeApp(config)
var secondaryApp = firebase.initializeApp(config, "Secondary")

firebase.auth().onAuthStateChanged(function(user) {
  return new Promise(function(resolve, reject) {
    if(user == null) {
      resolve(null)
    } else {
      firebase.database().ref('/administradores').once('value').then(function(administradores) {
        var ctr = 0
        , administradoresLength = Object.keys(administradores.val()).length
        administradores.forEach(function(administrador){
          ctr++
          var row = administrador.val()
          if(row.email == user.email) {
            user.scope = row.scope
            resolve(user)
          }
          if(ctr === administradoresLength){
            resolve(false)
          }
        })
      })
    }
  }).then(function(user){
    if (user) {

      firebase.database().ref('/datosdeapoyo').once('value').then(function(datos) {
          datosdeapoyo = datos.val()
      })

      firebase.database().ref('/implementaciones').once('value').then(function(rooms) {

        var layouts = {}
        , titulo = ""
        , roomsLength = Object.keys(rooms.val()).length
        , defaultRoom = LI.settings.defaultRoom
        , ctr = 0

        rooms.forEach(function(room){
          ctr++

          var row = room.val()
          , key = room.key
          , inscope = $.inArray(key, user.scope) > -1 

          console.log(inscope)
          console.log(key)
          console.log(user.scope)

          if(user.scope == "s" || inscope){
            layouts[key] = row.layout
          }

          if(inscope){
            defaultRoom = row.titulo
          }

          if(ctr === roomsLength){
            var firebaseuser = {
              uid : user.uid,
              room : defaultRoom,
              displayName : user.displayName,
              email : user.email,
              scope : user.scope,
              layouts : layouts,
              emailVerified : user.emailVerified,
              photoURL : user.photoURL,
              isAnonymous : user.isAnonymous,
              providerData : user.providerData
            }

            localStorage.setItem("firebaseuser",JSON.stringify(firebaseuser))
            
            setTimeout(function(){
              if(location.pathname == '/'){
                return location.href = '/' + user.scope[0] + '/menu'
              }
            },300)
          }          
        })
      })
    } else {

      if(user === false){
        return swal({   
          title: "No se pudo iniciar sesión",   
          text: "Esta cuenta no está habilitada para administrar.",
          type: "error",
          showCancelButton: false,   
          closeOnConfirm: false,   
          showLoaderOnConfirm: true,
        }, function(){
          swal.close()
          $('.login').prop('disabled',false).animate({opacity:1}).text("Continuar")
          $('.session-status').html("Sin inicio de sesión")
          $('.spinner').fadeOut(helper.animation.transition.fadeOut*helper.animation.transition.factor,function(){
              $('.contenedor-login').fadeIn(helper.animation.transition.fadeIn)
          })
        })
      }

      if($.inArray(location.pathname,['/','/recuperar-contrasena']) == -1){
        return location.href = '/'
      }

      $('.login').prop('disabled',false).animate({opacity:1}).text("Continuar")
      $('.session-status').html("Sin inicio de sesión")
      $('.spinner').delay(500).fadeOut(300,function(){
          $('.contenedor-login').fadeIn(300)
      })      
    }
  })
})

// LI.getResource('')
var LI = {
    settings : {
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
}