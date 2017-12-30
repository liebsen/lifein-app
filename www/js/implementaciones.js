var currentnode = '/implementaciones'
, implementaciones = firebase.database().ref(currentnode)
, datosdeapoyo = {}
, anim = LI.animation.transition
, show = function(key){
  $('body').attr('key',key);
  LI.setScroll();
  $('.spinner').fadeIn(anim.fadeIn*anim.factor, function(){
    return new Promise(function(resolve, reject){  
      return firebase.database().ref(currentnode+'/'+key).once('value').then(function(data) {

        var implementacion = data.val();

        return firebase.database().ref('/cuentas/' + key).once('value', function(snap) {
          var admins = snap.val();
          var render = {
            key : data.key,
            implementacion: implementacion,
            admin : null,
            seguridad: null,
            datosdeapoyo : datosdeapoyo
          };

          if(admins){
            snap.forEach(function(cuenta){
              var row = cuenta.val();

              if(row.administrador){
                render.admin = row;
                render.admin.key = cuenta.key;
              } else if (row.seguridad){
                render.seguridad = row;
                render.seguridad.key = cuenta.key;
              }
            });

            resolve(render);
          } else {
            resolve(render);
          }
        });
      });
    }).then(function(data){
      $('#detail').html($.templates('#form').render(data,LI)).promise().done(function(){
        $('.lista').fadeOut(anim.fadeOut,function(){
          $('.spinner').fadeOut(anim.fadeOut*anim.factor,function(){
            $('#detail').delay(200).fadeIn(anim.fadeOut*anim.factor,function(){
              $('body,html').scrollTop(0);
              LI.initAutocomplete('implementacion_direccion');
              console.log(data);
              if(data.implementacion.geo){
                $('#implementacion_direccion').attr('lat',data.implementacion.geo.lat).attr('lng',data.implementacion.geo.lng);
              }                  
            });
          });
        });
      });
    });
  });
};

implementaciones.once('value').then(function(datos) {
  if(!datos.val()){
    $('.spinner').fadeOut(anim.fadeOut, function(){
      $('.lista').delay(anim.delay).fadeIn()
    })    
  }
});

firebase.database().ref('/datosdeapoyo').once('value').then(function(datos) {
  datosdeapoyo = datos.val()
});

$(document).on('submit','#firebase-form',function(e){
  e.preventDefault()
  
  var data = $(this).serializeObject()
  , key = $(this).attr('key')    
  , admKey = $(this).attr('administrador-key')    
  , secKey = $(this).attr('seguridad-key')    
  , newKey = null 
  , newAdminKey = null 
  , newSeguridadKey = null 
  , updates = {
    implementacion : {
      aprobado : (data.implementacion_aprobado?1:0),
      email : $.trim(data.implementacion_email).toLowerCase(),
      direccion : $.trim(data.implementacion_direccion),
      geo : { lat: $('#implementacion_direccion').attr('lat')||0, lng : $('#implementacion_direccion').attr('lng')||0 },
      sitioweb : $.trim(data.implementacion_web),
      telefono : $.trim(data.implementacion_telefono),
      titulo : $.trim(data.implementacion_titulo),
      modificado : moment().format('X')
    }
    , administrador : {
      aprobado : (data.administrador_aprobado?1:0),
      email : $.trim(data.administrador_email).toLowerCase(),
      nombre : $.trim(data.administrador_nombre),
      apellido : $.trim(data.administrador_apellido),
      telefono : $.trim(data.administrador_telefono),
      modificado : moment().format('X'),
      administrador : 1
    }
    , seguridad : {
      aprobado : (data.seguridad_aprobado?1:0),
      email : $.trim(data.seguridad_email).toLowerCase(),
      nombre : $.trim(data.seguridad_nombre),
      apellido : $.trim(data.seguridad_apellido),
      telefono : $.trim(data.seguridad_telefono),
      modificado : moment().format('X'),
      seguridad : 1
    }      
  };

  if(!key){
    key = implementaciones.push().key;
  }

  $('.spinner').fadeIn(anim.fadeIn, function(){
    return new Promise(function(resolve, reject){
      return firebase.database().ref('/cuentas/' + key).once('value', function(entries) {
        var reset_flags = {};
        entries.forEach(function(entry){
          reset_flags['/cuentas/' + key + '/' + entry.key + '/administrador'] = 0;
          reset_flags['/cuentas/' + key + '/' + entry.key + '/seguridad'] = 0;
        });
        return firebase.database().ref().update(reset_flags, function(error){
          resolve();
        });
      });
    }).then(function(){
      return firebase.database().ref('/cuentas/' + key).orderByChild('email').equalTo(updates.administrador.email).once('value', function(snap) {
        var item = snap.val();
        if(item){
          var entryKey = Object.keys(item)[0];
          var entry = item[entryKey];
          for( var i in updates.administrador){
            entry[i] = updates.administrador[i];
          }            
        } else {
          var entry = updates.administrador;
          entryKey = firebase.database().ref('/cuentas/' + key).push().key;
          newAdminKey = true;
        }
        return firebase.database().ref('/cuentas/' + key + '/' + entryKey).set(entry).then(function(){
          return true;
        });
      });
    }).then(function(){
      return new Promise(function(resolve, reject){
        if(newAdminKey){
          var emailData = updates.administrador;
          emailData.implementacion = updates.implementacion.titulo;
          emailData.password = LI.randomString(12);

          return LI.createAccount('email_admin',emailData).then(function(result){
            resolve();
          });

        } else {
          resolve();
        }
      });
    }).then(function(){ // seguridad
      return firebase.database().ref('/cuentas/' + key).orderByChild('email').equalTo(updates.seguridad.email).once('value', function(snap) {
        var item = snap.val();
        if(item){
          var entryKey = Object.keys(item)[0];
          var entry = item[entryKey];
          for( var i in updates.seguridad){
            entry[i] = updates.seguridad[i];
          }            
        } else {
          var entry = updates.seguridad;
          entryKey = firebase.database().ref('/cuentas/' + key).push().key;
          newSeguridadKey = null;
        }
        return firebase.database().ref('/cuentas/' + key + '/' + entryKey).set(entry).then(function(){
          return true;
        });
      });
    }).then(function(){
      return new Promise(function(resolve, reject){   
        if(newSeguridadKey){
          var emailData = updates.seguridad;
          emailData.implementacion = updates.implementacion.titulo;
          emailData.password = LI.randomString(12);

          return LI.createAccount('email_seguridad',emailData).then(function(){
            resolve();
          });

        } else {
          resolve();
        }
      });
    }).then(function(){
      return firebase.database().ref(currentnode + '/' + key).update(updates.implementacion, function(error){
        if(error){
          swal("Error",error,"error");
        }else{
          location.hash="";
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
        }
      });
    });
  });

  return false;
});

$(document).on('click','.users-close',function(e){
  $('.list-users-backdrop').fadeOut();
});

$(document).on('keyup','.users-filter',function(e){
  var filter = $(this).val();
  $('.list-users div').each(function(){
    if($(this).text().indexOf(filter) > -1){
      $(this).fadeIn(100);
    } else {
      $(this).fadeOut(100);
    }
  })
});

$(document).on('click','.custom-list-user',function(e){
  $(this).siblings().removeClass('selected');
  $(this).addClass('selected');
  var target = $(this).parent().parent().parent().parent().find('.select-user').data('target');
  var prop = $(this).data('prop');
  $('.'+target).find('.nombre').val(prop.nombre);
  $('.'+target).find('.apellido').val(prop.apellido);
  $('.'+target).find('.email').val(prop.email);
  $('.'+target).find('.telefono').val(prop.telefono);
  $('.list-users-backdrop').fadeOut();
});

$(document).on('click','.select-user',function(e){
  var that = this;
  var key = $('#firebase-form').attr('key');
  firebase.database().ref('/cuentas/' + key).once('value', function(entries) {
    $(that).next().find('.list-users').html($.templates('#list_users').render({data:entries.val(),selected:$('#firebase-form').attr($(that).data('target') + '-key')},LI.aux)).promise().done(function(){  
      $(that).next().fadeIn();
    });
  });
});

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
    firebase.database().ref('implementaciones/' + key).remove().then(function(){
      swal.close();
    });
  });
});

$(document).on('click','.cerrar',function(){
  location.hash="";
});

$(window).on('hashchange', function(){
  if(location.hash == '#add') {
    $('#detail').html($.templates('#form').render({key:null,datosdeapoyo:datosdeapoyo},LI)).promise().done(function(){
      $('.lista').fadeOut(anim.fadeOut,function(){
        $('#detail').delay(200).fadeIn(anim.fadeOut*anim.factor,function(){
          $('body,html').scrollTop(0);
          LI.initAutocomplete('implementacion_direccion');
        });
      });
    });
  } else if(location.hash != '') {
    show(location.hash.replace('#',''));
  } else {
    $('#detail').fadeOut(anim.fadeOut,function(){
      $('.lista').delay(anim.delay).fadeIn(anim.fadeIn,function(){
        LI.resetScroll();
      });
    });
  }
}).trigger('hashchange');

// live fb handlers
implementaciones.on('child_added', (data) => {
  $('#list').prepend($.templates('#item').render({key:data.key,data:data.val()}, LI.aux)).promise().done(function(){
    $('#list').find('#'+data.key).animateAdded()
  })  
  $('.spinner').fadeOut(anim.fadeOut*anim.factor, function(){
    $('.lista').delay(anim.delay).fadeIn()
  })  
})

implementaciones.on('child_changed', (data) => {
  var index = $('#'+data.key).index();
  $('#'+data.key).remove();
  $('#list').insertAt(index, $.templates('#item').render({key:data.key,data:data.val()}, LI.aux));
  $('#'+data.key).animateChanged();
})

implementaciones.on('child_removed', (data) => {
  $('#'+data.key).animateRemoved(function(){
    $(this).remove()  
  })  
})

