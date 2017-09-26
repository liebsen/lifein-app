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
        administradores.forEach(function(administrador){
          ctr++
          var row = administrador.val()
          if(row.email == user.email) {
            user.scope = row.scope
            resolve(user)
          }
          if(ctr === administradores.length){
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

      firebase.database().ref('/implementaciones').once('value').then(function(implementaciones) {

        var layouts = {}
        , titulo = ""

        implementaciones.forEach(function(implementacion){

          var row = implementacion.val()
          , key = implementacion.key

          if(user.scope == "super" || user.scope == key){
            layouts[key] = row.layout
          }
          if(user.scope == key){
            titulo = row.titulo
          }
        })
        
        var firebaseuser = {
          displayName : user.displayName,
          email : user.email,
          scope : user.scope,
          layouts : layouts,
          area : user.scope == "super" ? "LifeIn" : titulo,
          emailVerified : user.emailVerified,
          photoURL : user.photoURL,
          isAnonymous : user.isAnonymous,
          uid : user.uid,
          providerData : user.providerData
        }

        localStorage.setItem("firebaseuser",JSON.stringify(firebaseuser))
        
        setTimeout(function(){
          if(location.pathname == '/'){
            return location.href = '/' + user.scope + '/menu'
          }
        },300)
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