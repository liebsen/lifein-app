

  var implementaciones = firebase.database().ref('/implementaciones')
  , datosdeapoyo = {}
  , anim = helper.animation

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
    , updates = {}
    , key = $(this).attr('key')
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
        return firebase.database().ref().update(updates, function(error){
          if(error){
            console.log(error)
          }else{
            $('#detail').fadeOut(anim.transition.fadeOut,function(){
              $('.lista').delay(anim.transition.delay).fadeIn(anim.transition.fadeIn,function(){
                helper.resetScroll()
                $('.spinner').fadeOut(anim.transition.fadeOut)
              })
            }) 
          }
        })
      })
    })

    return false  
  })

  $(document).on('click','.add-grupo',function(e){
    $('#detail').html($.templates('#form').render({key:null,data:{plan:""},datosdeapoyo:datosdeapoyo},helper)).promise().done(function(){
      $('.lista').fadeOut(anim.transition.fadeOut,function(){
        $('#detail').delay(200).fadeIn(anim.transition.fadeOut*anim.transition.factor,function(){
          $('body,html').scrollTop(0)
        })
      })    
    })  
  })

  $(document).on('click','.action.ver',function(){
    var key = $(this).data('key')
    $('body').attr('key',key)
    helper.setScroll()
    $('.spinner').fadeIn(anim.transition.fadeIn*anim.transition.factor, function(){
      firebase.database().ref('implementaciones/'+key).once('value').then(function(grupo) {
        $('#detail').html($.templates('#form').render({key:grupo.key,data:grupo.val(),datosdeapoyo:datosdeapoyo},helper)).promise().done(function(){
          $('.lista').fadeOut(anim.transition.fadeOut,function(){
            $('.spinner').fadeOut(anim.transition.fadeOut*anim.transition.factor,function(){
              $('#detail').delay(200).fadeIn(anim.transition.fadeOut*anim.transition.factor,function(){
                $('body,html').scrollTop(0)
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
      title: "Borrar grupo",   
      text: "Seguro que querés eliminar esta grupo?",   
      type: "warning",
      showCancelButton: true,   
      closeOnConfirm: false,   
      showLoaderOnConfirm: true,
    }, function(){    
      firebase.database().ref('implementaciones/' + key).remove().then(function(){
        swal.close()
      })
    })
  })  

  $(document).on('click','.cerrar',function(){
    $('#detail').fadeOut(anim.transition.fadeOut,function(){
      $('.lista').delay(anim.transition.delay).fadeIn(anim.transition.fadeIn,function(){
        helper.resetScroll()
      })
    })
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


  // live fb handlers
  implementaciones.on('child_added', (data) => {
    $('#list').prepend($.templates('#item').render({key:data.key,data:data.val()}, helper)).promise().done(function(){
      $('#list').find('#'+data.key).animateAdded()
    })  
    $('.spinner').fadeOut(anim.transition.fadeOut*anim.transition.factor, function(){
      $('.lista').delay(anim.transition.delay).fadeIn()
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