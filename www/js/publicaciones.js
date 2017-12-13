  var currentnode = '/publicaciones/'+key
  , publicaciones = firebase.database().ref(currentnode)
  , datosdeapoyo = {}  
  , anim = LI.animation.transition
  , showItem = function(_key){
    $('body').attr('key',_key)
    LI.setScroll()
    $('.spinner').fadeIn(anim.fadeIn*anim.factor, function(){  
      firebase.database().ref(currentnode +'/'+_key).once('value').then(function(publicacion) {
        $('#detail').html($.templates('#form').render({key:publicacion.key,data:publicacion.val(),aux:LI.aux,datosdeapoyo:datosdeapoyo},LI)).promise().done(function(){
          $('.lista').fadeOut(anim.fadeOut,function(){
            $('.spinner').fadeOut(anim.fadeOut*anim.factor,function(){                    
              $('#detail').delay(200).fadeIn(anim.fadeOut*anim.factor,function(){
                $('.slider').slick();
                $('body,html').scrollTop(0);
              })
            });
          });
        });
      });
    });    
  };

  publicaciones.once('value').then(function(datos) {
    if(!datos.val()){
      $('.spinner').fadeOut(anim.fadeOut, function(){
        $('.lista').delay(anim.delay).fadeIn();
      });
    }
  });

  firebase.database().ref('/datosdeapoyo').once('value').then(function(datos) {
    datosdeapoyo = datos.val();
  });

  $(document).on('submit','#firebase-form',function(e){
    e.preventDefault();
    
    var data = $(this).serializeObject()
    , updates = {}
    , _key = $(this).attr('key')
    , comment = data.comment;

    delete data.comment;
    data.aprobado = data.aprobado?1:0;

    for(var i in data){
      updates[currentnode +'/' + _key + '/' + i] = data[i];
    }

    $('.spinner').fadeIn(anim.fadeIn, function(){

      firebase.database().ref(currentnode + '/' + _key).once('value').then(function(item) {
        var entry = item.val();
        var aprobado_ref = entry.aprobado;

        firebase.database().ref().update(updates, function(error){
          if(error){
            console.log(error);
          }else{
            LI.notify({
              status_ref:aprobado_ref||0,
              status:data.aprobado,
              type:'notificacion',
              user_id:entry.usuario_id,
              title:"Publicación",
              text:comment
            });  

            LI.resetScroll();
            $('.spinner').fadeOut(anim.fadeOut*anim.factor,function(){
              location.hash = '';
            });
          }
        });
      });
    });

    return false;
  });

  $(document).on('click','.action.eliminar',function(){
    var key = $(this).data('key')
    swal({   
      title: "Borrar página",   
      text: "Seguro que querés eliminar esta página?",
      type: "warning",
      showCancelButton: true,   
      closeOnConfirm: false,   
      showLoaderOnConfirm: true,
    }, function(){    
      firebase.database().ref(currentnode + key).remove().then(function(){
        swal.close();
      });
    });
  });

  $(document).on('click','.cerrar',function(){
    location.hash="";
  });  

  $(function(){
    $(window).on('hashchange', function(){
      if(location.hash != '') {
        showItem(location.hash.replace('#',''));
      } else {
        $('#detail').fadeOut(anim.fadeOut,function(){
          $('.lista').delay(anim.delay).fadeIn(anim.fadeIn,function(){
            LI.resetScroll();
          });
        });
      }
    }).trigger('hashchange');
  });

  // live fb handlers
  publicaciones.on('child_added', (data) => {
    $('#list').prepend($.templates('#item').render({key:data.key,data:data.val()}, LI.aux)).promise().done(function(){
      $('#list').find('#'+data.key).animateAdded();
    });
    if(location.hash===''){
      $('.spinner').fadeOut(anim.fadeOut);
    } 
  });

  publicaciones.on('child_changed', (data) => {
    var index = $('#'+data.key).index();
    $('#'+data.key).remove();
    $('#list').insertAt(index, $.templates('#item').render({key:data.key,data:data.val()}, LI.aux));
    $('#'+data.key).animateChanged();
  });

  publicaciones.on('child_removed', (data) => {
    $('#'+data.key).animateRemoved(function(){
      $(this).remove();
    });  
  });