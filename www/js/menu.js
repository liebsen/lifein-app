  $(function(){
    $('.spinner').fadeOut(helper.animation.transition.fadeOut, function(){
      $('.sections-conteiner').fadeIn()
    })
    $('.item-home').click(function(e){
      e.preventDefault()
      var that = this
      $('.sections-conteiner').fadeOut(helper.animation.transition.fadeOut,function(){
        location.href = $(that).attr('href')
      })
      return false
    })
  })
