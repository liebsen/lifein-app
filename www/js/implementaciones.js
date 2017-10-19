
  var currentnode = '/implementaciones'
  , implementaciones = firebase.database().ref(currentnode)
  , datosdeapoyo = {}
  , anim = LI.animation.transition

  implementaciones.once('value').then(function(datos) {
    if(!datos.val()){
      $('.spinner').fadeOut(anim.fadeOut, function(){
        $('.lista').delay(anim.delay).fadeIn()
      })    
    }
  })

  firebase.database().ref('/datosdeapoyo').once('value').then(function(datos) {
    datosdeapoyo = datos.val()
  })

  $(document).on('submit','#firebase-form',function(e){
    e.preventDefault()
    
    var data = $(this).serializeObject()
    , key = $(this).attr('key')    
    , adminKey = $(this).attr('admin-key')    
    , seguridadKey = $(this).attr('seguridad-key')    
    , newKey = undefined 
    , newAdminKey = undefined 
    , newSeguridadKey = undefined 
    , updates = {
      implementacion : {
        estado : (data.implementacion_estado?1:0),
        email : $.trim(data.implementacion_email).toLowerCase(),
        plan : data.implementacion_plan,
        direccion : $.trim(data.implementacion_direccion),
        geo : { lat: $('#implementacion_direccion').attr('lat'), lng : $('#implementacion_direccion').attr('lng') },
        sitioweb : $.trim(data.implementacion_web),
        telefono : $.trim(data.implementacion_telefono),
        titulo : $.trim(data.implementacion_titulo),
        modificado : moment().format('X')
      }
      , administrador : {
        estado : (data.administrador_estado?1:0),
        email : $.trim(data.administrador_email).toLowerCase(),
        nombre : $.trim(data.administrador_nombre),
        empresa : $.trim(data.administrador_empresa),
        caduca : $.trim(data.administrador_caduca),
        telefono : $.trim(data.administrador_telefono),
        rol : 'administrador'
      }
      , seguridad : {
        estado : (data.seguridad_estado?1:0),
        email : $.trim(data.seguridad_email).toLowerCase(),
        nombre : $.trim(data.seguridad_nombre),
        empresa : $.trim(data.seguridad_empresa),
        caduca : $.trim(data.seguridad_caduca),
        telefono : $.trim(data.seguridad_telefono),
        rol : 'seguridad'
      }      
    };

    if(!key){
      key = implementaciones.push().key;
    }

    updates.administrador.scope = [key];
    updates.seguridad.scope = [key];

    if(!adminKey){
      adminKey = firebase.database().ref('/administradores').push().key;
      newAdminKey = adminKey;
    }

    if(!seguridadKey){
      seguridadKey = firebase.database().ref('/administradores').push().key;
      newSeguridadKey = seguridadKey;
    }

    $('.spinner').fadeIn(anim.fadeIn, function(){
      return new Promise(function(resolve, reject){
        return firebase.database().ref('/administradores/' + adminKey).set(updates.administrador).then(function(){
          if(newAdminKey){
            var emailData = updates.administrador;
            emailData.implementacion = updates.implementacion.titulo;
            emailData.password = LI.randomString(12);

            return LI.createAccount('email_admin',emailData).then(function(){
              resolve();
            })

          } else {
            resolve();
          }
        })
      }).then(function(){
        return firebase.database().ref('/administradores/' + seguridadKey).update(updates.seguridad).then(function(){
          if(newSeguridadKey){
            var emailData = updates.seguridad;
            emailData.implementacion = updates.implementacion.titulo;
            emailData.password = LI.randomString(12);

            return LI.createAccount('email_seguridad',emailData).then(function(){
              return true;
            });

          } else {
            return true;
          }
        })
      }).then(function(){
        return firebase.database().ref(currentnode + '/' + key).update(updates.implementacion, function(error){
          if(error){
            swal("Error",error,"error");
          }else{
            $('.spinner').fadeOut(anim.fadeOut*anim.factor, function(){
              $('#detail').fadeOut(anim.fadeOut,function(){
                $('.lista').fadeIn(anim.fadeIn,function(){
                  LI.resetScroll();
                  if(newAdminKey || newSeguridadKey){
                    swal({
                      title:"Implementaciones",
                      text:"La implementación ha sido actualizada. " + 
                      ( newAdminKey ? "<br>Se ha enviado una notificación de bienvenida con los datos de ingreso al administrador." : "" ) + 
                      ( newSeguridadKey ? "<br>Se ha enviado una notificación de bienvenida con los datos de ingreso al seguridad." : "" ),
                      type: "success",
                      html: true
                    });
                  }
                })
              })
            }) 
          }
        })
      })
    })

    return false  
  })

  $(document).on('click','.add-item',function(e){
    $('#detail').html($.templates('#form').render({key:null,data:{plan:""},datosdeapoyo:datosdeapoyo},LI)).promise().done(function(){
      $('.lista').fadeOut(anim.fadeOut,function(){
        $('#detail').delay(200).fadeIn(anim.fadeOut*anim.factor,function(){
          $('body,html').scrollTop(0)
          LI.initAutocomplete('implementacion_direccion')
          $('.datetimepicker').datetimepicker()
        })
      })    
    })  
  })

  $(document).on('click','.action.editar',function(){
    var key = $(this).data('key')
    $('body').attr('key',key)
    LI.setScroll()
    $('.spinner').fadeIn(anim.fadeIn*anim.factor, function(){
      firebase.database().ref(currentnode+'/'+key).once('value').then(function(data) {

        var implementacion = data.val()

        firebase.database().ref('/administradores/').once('value', function(snap) {
          var admins = snap.val()
          , adminsLength = Object.keys(admins).length
          , adminsData = []
          , seguridadData = []
          , adminKey = undefined
          , seguridadKey = undefined
          , ctr = 0

          snap.forEach(function(admin){
            ctr++

            var row = admin.val()

            if($.inArray(key,row.scope) > -1){
              if(row.rol == 'administrador'){
                adminsData.push(row)
                adminKey = admin.key
              } else if (row.rol == 'seguridad'){
                seguridadData.push(row)
                seguridadKey = admin.key
              }
            }

            if(ctr === adminsLength){
              $('#detail').html($.templates('#form').render({key:data.key,data:implementacion,adminKey:adminKey,admin:adminsData[0],seguridad:seguridadData[0],seguridadKey:seguridadKey,datosdeapoyo:datosdeapoyo},LI)).promise().done(function(){
                $('.lista').fadeOut(anim.fadeOut,function(){
                  $('.spinner').fadeOut(anim.fadeOut*anim.factor,function(){
                    $('#detail').delay(200).fadeIn(anim.fadeOut*anim.factor,function(){
                      $('body,html').scrollTop(0)
                      LI.initAutocomplete('implementacion_direccion')
                      $('.datetimepicker').datetimepicker()
                      if(implementacion.geo){
                        $('#implementacion_direccion')
                          .attr('lat',implementacion.geo.lat)
                          .attr('lng',implementacion.geo.lng)
                      }                  
                    })
                  })
                })
              })
            }
          })
        })
      })
    })
  })

  $(document).on('click','.action.eliminar',function(){
    var key = $(this).data('key')
    swal({   
      title: "Atención",   
      text: "Se eliminará esta implementación y sus administradores de forma permanente. ¿Desea continuar?",
      type: "warning",
      showCancelButton: true,   
      closeOnConfirm: false,   
      showLoaderOnConfirm: true,
    }, function(){    
      var adminsRef = firebase.database().ref('/administradores/')
      adminsRef.once('value', function(admins) {
        var adminsLength = Object.keys(admins.val()).length
        , adminKeys = []
        , ctr = 0

        admins.forEach(function(administrador){
          ctr++
          var admin = administrador.val()

          if($.inArray(key,admin.scope) > -1){
            firebase.database().ref('/administradores/' + admin.key).remove()
          } 

          if(ctr === adminsLength){
            firebase.database().ref('implementaciones/' + key).remove().then(function(){
              swal.close()
            })
          }
        })
      })
    })
  })  

  $(document).on('click','.cerrar',function(){
    $('#detail').fadeOut(anim.fadeOut,function(){
      $('.lista').delay(anim.delay).fadeIn(anim.fadeIn,function(){
        LI.resetScroll()
      })
    })
  })  

  // live fb handlers
  implementaciones.on('child_added', (data) => {
    firebase.database().ref('/administradores/').once('value', function(admins) {
      var adminsLength = Object.keys(admins.val()).length
      , adminsData = []
      , seguridadData = []
      , ctr = 0

      admins.forEach(function(admin){
        ctr++
        var row = admin.val()

        if(typeof row.scope == 'object' && $.inArray(data.key,row.scope) > -1){
          if(row.rol == 'administrador'){          
            adminsData.push(row)
          } else if(row.rol == 'seguridad'){          
            seguridadData.push(row)
          }
        }

        if(ctr === adminsLength){
          $('#list').prepend($.templates('#item').render({key:data.key,data:data.val(),admins:adminsData,seguridad:seguridadData}, LI)).promise().done(function(){
            $('#list').find('#'+data.key).animateAdded()
          })  
          $('.spinner').fadeOut(anim.fadeOut*anim.factor, function(){
            $('.lista').delay(anim.delay).fadeIn()
          })  
        }
      })
    })
  })

  implementaciones.on('child_changed', (data) => {
    firebase.database().ref('/administradores/').once('value', function(admins) {
      var adminsLength = Object.keys(admins.val()).length
      , adminsData = []
      , seguridadData = []
      , ctr = 0

      admins.forEach(function(admin){
        ctr++
        var row = admin.val()

        if(typeof row.scope == 'object' && $.inArray(data.key,row.scope) > -1){
          if(row.rol == 'administrador'){          
            adminsData.push(row)
          } else if(row.rol == 'seguridad'){          
            seguridadData.push(row)
          }
        }

        if(ctr === adminsLength){
          var index = $('#'+data.key).index();
          $('#'+data.key).remove();
          console.log(index)
          $('#list').insertAt(index, $.templates('#item').render({key:data.key,data:data.val(),admins:adminsData,seguridad:seguridadData}, LI));
          $('#'+data.key).animateChanged();
        }
      })
    })
  })

  implementaciones.on('child_removed', (data) => {
    $('#'+data.key).animateRemoved(function(){
      $(this).remove()  
    })  
  })

  $.datetimepicker.setLocale('es')