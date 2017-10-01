
  var currentnode = '/implementaciones'
  , implementaciones = firebase.database().ref(currentnode)
  , datosdeapoyo = {}
  , anim = LI.animation

  implementaciones.once('value').then(function(datos) {
    if(!datos.val()){
      $('.spinner').fadeOut(anim.transition.fadeOut, function(){
        $('.lista').delay(anim.transition.delay).fadeIn()
      })    
    }
  })

  firebase.database().ref('/datosdeapoyo').once('value').then(function(datos) {
    datosdeapoyo = datos.val()
  })

  $(document).on('submit','#firebase-form',function(e){
    e.preventDefault()
    
    var data = $(this).serializeObject()
    , newKey = undefined 
    , key = $(this).attr('key')    
    , updates = {
      implementacion : {
        email : $.trim(data.implementacion_email).toLowerCase(),
        plan : data.implementacion_plan,
        direccion : $.trim(data.implementacion_direccion),
        geo : { lat: $('#implementacion_direccion').attr('lat'), lng : $('#implementacion_direccion').attr('lng') },
        sitioweb : $.trim(data.implementacion_web),
        telefono : $.trim(data.implementacion_telefono),
        titulo : $.trim(data.implementacion_titulo),
      }
      , administrador : {
        email : $.trim(data.administrador_email).toLowerCase(),
        nombre : $.trim(data.administrador_nombre),
        empresa : $.trim(data.administrador_empresa),
        caduca : $.trim(data.administrador_caduca),
        telefono : $.trim(data.administrador_telefono),
        estado : data.administrador_estado,
      }
    }

    if(!key){
      key = implementaciones.push().key
      newKey = key
    }

    $('.spinner').fadeIn(anim.transition.fadeIn, function(){
      var adminsRef = firebase.database().ref('/administradores/')
      return adminsRef.once('value', function(admins) {
        var adminsLength = Object.keys(admins.val()).length
        , adminKeys = []
        , ctr = 0

        return new Promise(function(resolve, reject){
          return admins.forEach(function(administrador){
            ctr++
            var admin = administrador.val()

            if($.inArray(key,admin.scope) > -1 && admin.email == updates.administrador.email ){
              adminKeys.push(key)
              firebase.database().ref('/administradores/' + key).set(updates.administrador)
            } 

            if(ctr === adminsLength){
              if(adminKeys.length == 0){
                var newKey = adminsRef.push().key
                updates.administrador.scope = [key]
                return firebase.database().ref('/administradores/' + newKey).set(updates.administrador).then(function(){
                  var emailData = updates.administrador
                  emailData.implementacion = updates.implementacion.titulo
                  emailData.password = LI.randomString(12)
                  LI.createAccount('email',emailData).then(function(){
                    resolve(true)
                  })
                })
              } else {
                resolve(false)
              }  
            }
          })
        }).then(function(newAccount){
          return firebase.database().ref(currentnode + '/' + key).set(updates.implementacion, function(error){
            if(error){
              swal("Error",error,"error")
            }else{
              $('.spinner').fadeOut(anim.transition.fadeOut*anim.transition.factor, function(){
                $('#detail').fadeOut(anim.transition.fadeOut,function(){
                  $('.lista').fadeIn(anim.transition.fadeIn,function(){
                    LI.resetScroll()
                    swal("Implementaciones","La implementación ha sido actualizada. " + ( newAccount ? "Se ha enviado una notificación de bienvenida con los datos de ingreso al administrador." : "" ),"success")
                  })
                })
              }) 
            }
          })
        })
      })
    })

    return false  
  })

  $(document).on('click','.add-item',function(e){
    $('#detail').html($.templates('#form').render({key:null,data:{plan:""},datosdeapoyo:datosdeapoyo},LI)).promise().done(function(){
      $('.lista').fadeOut(anim.transition.fadeOut,function(){
        $('#detail').delay(200).fadeIn(anim.transition.fadeOut*anim.transition.factor,function(){
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
    $('.spinner').fadeIn(anim.transition.fadeIn*anim.transition.factor, function(){
      firebase.database().ref(currentnode+'/'+key).once('value').then(function(data) {

        var implementacion = data.val()

        firebase.database().ref('/administradores/').once('value', function(snap) {
          var admin = snap.val()
          var admins = null

          if($.inArray(key,admin.scope) > -1){
            admins.push(admin)
          }

          $('#detail').html($.templates('#form').render({key:data.key,data:implementacion,admins:admins,datosdeapoyo:datosdeapoyo},LI)).promise().done(function(){
            $('.lista').fadeOut(anim.transition.fadeOut,function(){
              $('.spinner').fadeOut(anim.transition.fadeOut*anim.transition.factor,function(){
                $('#detail').delay(200).fadeIn(anim.transition.fadeOut*anim.transition.factor,function(){
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
    $('#detail').fadeOut(anim.transition.fadeOut,function(){
      $('.lista').delay(anim.transition.delay).fadeIn(anim.transition.fadeIn,function(){
        LI.resetScroll()
      })
    })
  })  

  // live fb handlers
  implementaciones.on('child_added', (data) => {
    firebase.database().ref('/administradores/').once('value', function(admins) {
      var adminsLength = Object.keys(admins.val()).length
      , adminsData = []
      , ctr = 0

      admins.forEach(function(admin){
        ctr++
        var row = admin.val()

        if(typeof row.scope == 'object' && $.inArray(data.key,row.scope) > -1){
          adminsData.push(row)
        }

        if(ctr === adminsLength){
          $('#list').prepend($.templates('#item').render({key:data.key,data:data.val(),admins:adminsData}, LI)).promise().done(function(){
            $('#list').find('#'+data.key).animateAdded()
          })  
          $('.spinner').fadeOut(anim.transition.fadeOut*anim.transition.factor, function(){
            $('.lista').delay(anim.transition.delay).fadeIn()
          })  
        }
      })
    })
  })

  implementaciones.on('child_changed', (data) => {
    var index = $('#'+data.key).index()
    $('#'+data.key).remove()
    $('#list').insertAt(index, $.templates('#item').render({key:data.key,data:data.val()}))
    $('#'+data.key).animateChanged()
  })

  implementaciones.on('child_removed', (data) => {
    $('#'+data.key).animateRemoved(function(){
      $(this).remove()  
    })  
  })

  $.datetimepicker.setLocale('es')