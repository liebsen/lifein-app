  var currentnode = '/cuentas/' + key
  , cuentas = firebase.database().ref(currentnode)
  , datosdeapoyo = {}
  , anim = LI.animation.transition;

  cuentas.once('value').then(function(datos) {
    if(!datos.val()){
      $('.spinner').fadeOut(anim.fadeOut, function(){
        $('.lista').delay(anim.delay).fadeIn();
      })   ; 
    }
  })
    
  firebase.database().ref('/datosdeapoyo').once('value').then(function(datos) {
    datosdeapoyo = datos.val();
  })

  $(document).on('submit','#firebase-form',function(e){
    e.preventDefault();
    var data = $(this).serializeObject()
    , updates = {}
    , newKey = null 
    , key = $(this).attr('key')
    , lat = $('#direccion').attr('lat')
    , lng = $('#direccion').attr('lng');
    
    data.aprobado = data.aprobado?1:0;
    if(lat && lng){
      data.geo = { lat:lat, lng:lng};
    }

    if(key){
      updates[currentnode + '/' + key] = data;
    } else {
      var newKey = cuentas.push().key;
      key = newKey;
      updates[currentnode + '/' + key] = data;
    }

    $('.spinner').fadeIn(anim.fadeIn, function(){
      firebase.database().ref().update(updates, function(error){
        if(error){
          console.log(error);
        }else{
          if(newKey){
            var emailData = data;
            emailData.password = LI.randomString(12);
            LI.createAccount('email',emailData).then(function(){
              $('#detail').fadeOut(anim.fadeOut,function(){
                $('.lista').delay(anim.delay).fadeIn(anim.fadeIn,function(){
                  LI.resetScroll();
                  $('.spinner').fadeOut(anim.fadeOut);
                })
              }) 
            })
          } else {             
            $('#detail').fadeOut(anim.fadeOut,function(){
              $('.lista').delay(anim.delay).fadeIn(anim.fadeIn,function(){
                LI.resetScroll();
                $('.spinner').fadeOut(anim.fadeOut);
              })
            }) 
          }
        }
      });
    });

    return false  
  });

  $(document).on('click','.add-item',function(e){
    $('#detail').html($.templates('#form').render({key:null,data:{plan:""},datosdeapoyo:datosdeapoyo},LI)).promise().done(function(){
      $('.lista').fadeOut(anim.fadeOut,function(){
        $('#detail').delay(200).fadeIn(anim.fadeOut*anim.factor,function(){
          $('body,html').scrollTop(0);
          LI.initAutocomplete('direccion');
        });
      });   
    });
  });

  $(document).on('click','.action.ver',function(){
    var key = $(this).data('key');
    $('body').attr('key',key);
    LI.setScroll();
    $('.spinner').fadeIn(anim.fadeIn*anim.factor, function(){
      firebase.database().ref(currentnode+'/'+key).once('value').then(function(cuenta) {
        var data = cuenta.val()
        $('#detail').html($.templates('#form').render({key:cuenta.key,data:data,datosdeapoyo:datosdeapoyo},LI)).promise().done(function(){
          $('.lista').fadeOut(anim.fadeOut,function(){
            $('.spinner').fadeOut(anim.fadeOut*anim.factor,function(){
              $('#detail').delay(200).fadeIn(anim.fadeOut*anim.factor,function(){
                LI.initAutocomplete('direccion');
                if(data.geo){
                  $('#direccion')
                    .attr('lat',data.geo.lat)
                    .attr('lng',data.geo.lng);
                LI.controls();
                }
              });
            });
          });
        });
      });
    });
  });

  $(document).on('click','.action.eliminar',function(){
    var key = $(this).data('key');
    swal({   
      title: "Borrar cuenta",   
      text: "Seguro que querés eliminar esta cuenta?",   
      type: "warning",
      showCancelButton: true,   
      closeOnConfirm: false,   
      showLoaderOnConfirm: true,
    }, function(){    
      firebase.database().ref(currentnode + '/' + key).remove().then(function(){
        swal.close()
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
  cuentas.on('child_added', (data) => {
    $('#list').prepend($.templates('#item').render({key:data.key,data:data.val()}, LI)).promise().done(function(){
      $('#list').find('#'+data.key).animateAdded()
    })  
    $('.spinner').fadeOut(anim.fadeOut*anim.factor, function(){
      $('.lista').delay(anim.delay).fadeIn()
    })  
  })

  cuentas.on('child_changed', (data) => {
    var index = $('#'+data.key).index()
    $('#'+data.key).remove()
    $('#list').insertAt(index, $.templates('#item').render({key:data.key,data:data.val()}))
    $('#'+data.key).animateChanged()
  })

  cuentas.on('child_removed', (data) => {
    $('#'+data.key).animateRemoved(function(){
      $(this).remove()  
    })  
  })