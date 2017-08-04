var glosario = firebase.database().ref('/glosario')
, anim = helper.animation

$(document).on('submit','#firebase-form',function(e){
  e.preventDefault()
  
  var data = $(this).serializeObject()
  , updates = {}
  , key = data.lang 
  , tag = data.tag

  delete data.lang
  delete data.tag

  updates['/glosario/' + key + '/' + tag] = data

  $('.mj-spinner').fadeIn(anim.transition.fadeOut*anim.transition.factor, function(){
    firebase.database().ref().update(updates, function(error){
      if(error){
        console.log(error)
      }else{
        $('#detail').fadeOut(anim.transition.fadeOut,function(){
          $('.lista').delay(200).fadeIn(anim.transition.fadeOut*anim.transition.factor,function(){
            helper.resetScroll()
            $('.mj-spinner').fadeOut(anim.transition.fadeOut*anim.transition.factor)
          })
        }) 
      }
    })
  })

  return false  
})

$(document).on('click','.add-glosario',function(e){
  $('#detail').html($.templates('#form').render({key:null,data:{plan:""},aux:helper.aux.glosario},helper)).promise().done(function(){
    $('.lista').fadeOut(anim.transition.fadeOut,function(){
      $('#detail').delay(anim.transition.delay).fadeIn(anim.transition.fadeIn,function(){
          $('body,html').scrollTop(0)
        })
    })    
  })  
})

$(document).on('click','.action.ver',function(){
  var key = $(this).data('key')
  , tag = $(this).data('tag')
  $('body').attr('key',key)
  helper.setScroll()
  $('.mj-spinner').fadeIn(anim.transition.fadeIn*anim.transition.factor, function(){    
    firebase.database().ref('glosario/'+key+'/'+tag).once('value').then(function(glosario) {
      $('#detail').html($.templates('#form').render({key:key,tag:tag,data:glosario.val(),aux:helper.aux.glosario},helper)).promise().done(function(){
        $('.lista').fadeOut(anim.transition.fadeOut,function(){
          $('.mj-spinner').fadeOut(anim.transition.fadeOut*anim.transition.factor,function(){                    
            $('#detail').delay(anim.transition.delay).fadeIn(anim.transition.fadeIn,function(){
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
  , tag = $(this).data('tag')
  swal({   
    title: "Borrar glosario",   
    text: "Seguro que desea eliminar este glosario?",   
    type: "warning",
    showCancelButton: true,   
    closeOnConfirm: false,   
    showLoaderOnConfirm: true,
  }, function(){    
    firebase.database().ref('glosario/' + key + '/' + tag).remove().then(function(){
      swal.close()
    })
  })
})  

$(document).on('click','.cerrar',function(){
  $('#detail').fadeOut(anim.transition.fadeOut,function(){
    $('.lista').delay(200).fadeIn(anim.transition.fadeOut*anim.transition.factor,function(){
      helper.resetScroll()
    })
  })
})  

// live fb handlers
glosario.on('child_added', (data) => {
  var key = data.key
  data.forEach(function(row){
    $('#list').prepend($.templates('#item').render({key:key,tag:row.key,data:row.val()}, helper.aux.glosario)).promise().done(function(){
      $('#list').find('#'+data.key).animateAdded()
    })      
  })
  $('.mj-spinner').fadeOut(anim.transition.fadeOut*anim.transition.factor, function(){
    $('.lista').delay(200).fadeIn(anim.transition.fadeIn)
  })
})

glosario.on('child_changed', (data) => {
  var key = data.key
  data.forEach(function(row){  
    var index = $('#'+key+'_'+row.key).index()
    $('#'+key+'_'+row.key).remove()
    $('#list').insertAt(index, $.templates('#item').render({key:key,tag:row.key,data:row.val()}))
    $('#'+key+'_'+row.key).animateChanged()
  })
})

glosario.on('child_removed', (data) => {
  $('#'+data.key).fadeOut(anim.transition.fadeOut, function(){
    $(this).remove()
  })
})