var top10 = firebase.database().ref('/top10').orderByChild('position')
, anim = helper.animation
, sortabledata = {id:"#list",node:"/top10",index:"position",items:".song:not(.grow)"}
$(document).on('submit','#form',function(e){
  e.preventDefault()
  var updates = {}
  $('.unsaved').each(function(){
    var json = $.parseJSON($(this).attr('json'))
    , id = $(this).attr('id')
    if(id){
      updates['/top10/' + id] = json.data
    } else {
      $(this).remove()
      if(!json.key){
        var top10 = firebase.database().ref('/top10')
        , newKey = top10.push().key
        , data = json.data
        
        data.position = $('.song').length+1
        updates['/top10/' + newKey] = data
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
    firebase.database().ref('top10/' + key).remove().then(function(){
      swal.close()
    })
  })
})
  
// live fb handlers
top10.on('child_added', (data) => {
  var shouldhave = 10
  if(helper.child_added_index>=shouldhave-1){
    $('.add-song').prop('disabled',true)
  }
  $('#list').append($.templates('#item').render({key:data.key,data:data.val(),i:helper.child_added_index+1}, helper)).promise().done(function(){
    if(!helper.child_added_index){
      setTimeout(function(){
        $('.spinner').fadeOut(anim.transition.fadeOut*anim.transition.factor, function(){
          $('.song').hide()
          $('.lista').show()
          anim.delayed(".song")
          sortableEnable(sortabledata)
        })
      },150)
    } 
    helper.child_added_index++
  })
})

top10.on('child_changed', (data) => {
  var index = $('#'+data.key).index()
  $('#'+data.key).remove()
  $('#list').insertAt(index, $.templates('#item').render({key:data.key,data:data.val(), i: index+1}, helper)).promise().done(function(){
    $('#'+data.key).animateChanged()  
  })  
})

top10.on('child_removed', (data) => {
  var index = 0
  $('#'+data.key).fadeOut(anim.transition.fadeOut, function(){
    $(this).remove()
    $('.song').each(function(){
      $(this).find('h4').first().text("Top " + index++)
    })    
  })
})