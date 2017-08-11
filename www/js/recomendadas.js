var recomendadas = firebase.database().ref('/recomendadas').orderByChild('position')
, anim = helper.animation
, sortabledata = {id:"#list",node:"/recomendadas",index:"position",items:".song:not(.grow)"}
$(document).on('submit','#form',function(e){
  e.preventDefault()
  var updates = {}
  $('.unsaved').each(function(){
    var json = $.parseJSON($(this).attr('json'))
    , id = $(this).attr('id')
    if(id){
      updates['/recomendadas/' + id] = json.data
    } else {
      $(this).remove()
      if(!json.key){
        var recomendadas = firebase.database().ref('/recomendadas')
        , newKey = recomendadas.push().key
        , data = json.data

        data.position = $('.song').length+1
        updates['/recomendadas/' + newKey] = data
      }
    }
  })

  $('.spinner').fadeIn(anim.transition.fadeIn, function(){
    firebase.database().ref().update(updates)
    $('.spinner').delay(anim.transition.delay).fadeOut(anim.transition.fadeOut*anim.transition.factor,function(){
      $('.unsaved').removeClass("unsaved")
      sortableEnable(sortabledata)
    })
  })

  return false
})

$(document).on('click','.eliminar',function(){
  var key = $(this).parent().attr('id')
  swal({   
    title: "Borrar canción",   
    text: "Seguro que querés eliminar esta canción?",
    type: "warning",
    showCancelButton: true,   
    closeOnConfirm: false,   
    showLoaderOnConfirm: true,
  }, function(){    
    firebase.database().ref('recomendadas/' + key).remove().then(function(){
      swal.close()
    })
  })
})

// live fb handlers
recomendadas.on('child_added', (data) => {
  $('#list').append($.templates('#item').render({key:data.key,data:data.val(),i:helper.child_added_index+1}, helper)).promise().done(function(){
    if(!helper.child_added_index){
      setTimeout(function(){
        $('.spinner').fadeOut(anim.transition.fadeOut*anim.transition.factor, function(){
          $('.song').hide()
          $('.lista').show()
          anim.delayed(".song")
          sortableEnable(sortabledata)
        })
      },100)
    } 
    helper.child_added_index++
  })
})

recomendadas.on('child_changed', (data) => {
  var index = $('#'+data.key).index()
  $('#'+data.key).remove()
  $('#list').insertAt(index, $.templates('#item').render({key:data.key,data:data.val(),i:index+1}, helper)).promise().done(function(){
    $('#'+data.key).animateChanged()  
  })  
})

recomendadas.on('child_removed', (data) => {
  $('#'+data.key).fadeOut(200, function(){
    $(this).remove()
    var index = 0;
    $('.song').each(function(){
      index++
      $(this).find('h4').first().text("Recomendación " + index)
    })    
  })
})