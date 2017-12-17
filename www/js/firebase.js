var config = {
  apiKey: "AIzaSyDoB2DWScwE3614oe70uV_tj5vuwa7tB1g",
  authDomain: "lifeindev-808c2.firebaseapp.com",
  databaseURL: "https://lifeindev-808c2.firebaseio.com",
  projectId: "lifeindev-808c2",
  storageBucket: "lifeindev-808c2.appspot.com",
  messagingSenderId: "502763098312"
};

firebase.initializeApp(config);
var secondaryApp = firebase.initializeApp(config, "Secondary");

firebase.auth().onAuthStateChanged(function(fbuser) {
  if(fbuser == null){
    if($.inArray(location.pathname,['/','/recuperar-contrasena']) == -1){
      return location.href = '/';
    }

    $('.login').prop('disabled',false).animate({opacity:1}).text("Continuar");
    $('.session-status').html("Sin inicio de sesión");
    $('.spinner').delay(500).fadeOut(300,function(){
        $('.contenedor-login').fadeIn(300);
    }); 
    return;    
  }

  return new Promise(function(resolve, reject){ 
    return firebase.database().ref('/administradores').once('value').then(function(administradores) {
      administradores.forEach(function(snap){
        var user = snap.val();
        if(user.email == fbuser.email && user.aprobado){
          user.rol = "super";
          user.scope = [];
          resolve(user);
        }
      });
      resolve(false);
    });
  }).then(function(user){

    return new Promise(function(resolve, reject){ 
      if(!user){
        return firebase.database().ref('/cuentas').once('value').then(function(grupos) {
          grupos.forEach(function(grupo){
            return firebase.database().ref('/cuentas/' + grupo.key).once('value').then(function(cuentas) {
              cuentas.forEach(function(cuenta){
                var user = cuenta.val();
                if(user.email == fbuser.email && user.aprobado){
                  if(user.administrador || user.seguridad){
                    user.rol = null;
                    if(user.administrador){
                      user.rol = "administrador";
                    } else if(user.seguridad){
                      user.rol = "seguridad";
                    }
                    user.scope = [grupo.key];
                    resolve(user);
                  }
                }
                resolve(false); 
              })
            }); 
          });       
        });
      } else {
        resolve(user);
      }
    });
  }).then(function(user){
    if (user) {
      firebase.database().ref('/datosdeapoyo').once('value').then(function(datos) {
        datosdeapoyo = datos.val()
      });
      firebase.database().ref('/implementaciones').once('value').then(function(rooms) {

        var layouts = {}
        , titulo = ""
        , roomsLength = Object.keys(rooms.val()).length
        , defaultRoom = LI.settings.defaults.room;

        rooms.forEach(function(room){
          var row = room.val()
          , key = room.key
          , inscope = $.inArray(key, user.scope) > -1;

          if(user.rol == "super" || inscope){
            layouts[key] = row.layout;
          }

          if(inscope){
            defaultRoom = row.titulo;
          }
        });

        var firebaseuser = user;

        firebaseuser.room = defaultRoom;
        firebaseuser.layouts = layouts;

        localStorage.setItem("firebaseuser",JSON.stringify(firebaseuser));
        
        setTimeout(function(){
          if(location.pathname == '/'){
            return location.href = (user.rol === 'super' ? 'menu' : user.scope[0] + '/menu');
          }
        },300);
      });
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
          swal.close();
          $('.login').prop('disabled',false).animate({opacity:1}).text("Continuar");
          $('.session-status').html("Sin inicio de sesión");
          $('.spinner').fadeOut(LI.animation.transition.fadeOut*LI.animation.transition.factor,function(){
              $('.contenedor-login').fadeIn(LI.animation.transition.fadeIn);
          });
        });
      }   
    }
  });
});

