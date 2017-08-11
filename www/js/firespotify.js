var position = 0
, position_last = undefined
, tokendata = undefined
, get_token_spotify = function(cb){
  if(tokendata) return cb.call(this,tokendata)
  $.post('/spotify_token', function(res){
    tokendata = $.parseJSON(res)
    cb.call(this,tokendata)
  })
}
, fetch_spotify = function(q,dropdown,link){
  var query = q ? $.trim($(q).val()) : false
  if(query==''&&$.trim(link)=='') return null
  get_token_spotify(function(token){
    var url_q = 'https://api.spotify.com/v1/search?query='+query+'&type=track'
    , url = url_q
    , url_next = undefined
    if(link){
      url = link
    }

    $.ajax({
      url:url,
      type:"GET",
      beforeSend: function(request) {
        request.setRequestHeader("Authorization", token.token_type +" "+token.access_token);
      },      
      success: function(res){
        if(res.tracks && res.tracks.items){

          if(query){
            dropdown.html('')
          }
          
          if(res.tracks.next){
            url_next = res.tracks.next
          }

          $(res.tracks.items).each(function(i,item){
            dropdown.append($.templates('#spotify_track').render(item, helper.spotify))
          })
          
          dropdown.attr('next-url',url_next)
          dropdown.unbind('scroll')
          dropdown.bind('scroll',function(){
            var dropdown = $(this)
            clearTimeout($.data(this, 'scrollTimer'))
            $.data(this, 'scrollTimer', setTimeout(function() {
              if (dropdown.scrollTop() + dropdown.innerHeight() >= dropdown[0].scrollHeight) {
                fetch_spotify(false,dropdown,dropdown.attr('next-url'))
              }         
            },250))
          })
        }
      }
    }).then(function(){
      $('.spinner').fadeOut(anim.transition.fadeOut*anim.transition.factor)
    })
  })
}
, selectItem = function(song){
  sortableDisable(sortabledata)
  setTimeout(function(){
    $(".song").removeClass("maybother")
    song.addClass("active grow")
    $('.song').addClass("maybother")
    song.removeClass("maybother")
  },100)
}
, sortableEnable = function (rules) {
  $(rules.id).sortable({
    containment: "parent"
    , items: rules.items
    , update: function (event, ui) {
      var updates = {}

      $(rules.items).each(function(){
        updates[[rules.node,$(this).attr('id'),rules.index].join('/')] = parseInt($(this).index()+1)
      })

      $('.spinner').fadeIn(anim.transition.fadeIn*anim.transition.factor, function(){
        firebase.database().ref().update(updates).then(function(){
          $('.spinner').delay(anim.transition.delay).fadeOut(anim.transition.fadeOut*anim.transition.factor)  
        })
      })
    }
  })  
  $(rules.id).sortable( "option", "disabled", false );
  $(rules.id).disableSelection();
  return false;
}
, sortableDisable = function (rules) {
  $(rules.id).sortable("disable")
  return false;
}

$(document).on('click','.add-song',function(e){
  $('#list').append($.templates('#item').render({key:null,data:null, i:($('.song').length+1)}, helper)).promise().done(function(){
    var song = $('#list').children().last()
    song.find('input[name="titulo"]').focus()
    selectItem(song)
    window.scrollTo(0,document.body.scrollHeight)
  })  
})

$(document).on('click','.track',function(e){
  var jsonstr = $(this).attr('json')
  , json = $.parseJSON(jsonstr)
  , form = $(this).closest('.song')
  , that = this
  , child_index = form.index()
  , child_id = form.attr('id')||""
  
  $('input[type=submit]').prop('disabled',false)
  $('.song').eq(child_index).after($.templates('#item').render({key:child_id,data:json,i:child_index+1}, helper)).promise().done(function(){
    form.remove()
    $('.song').eq(child_index).addClass('unsaved')
    swal({   
      title: "Guardar cambios",   
      text: "Seguro que querés guardar los cambios?",
      type: "warning",
      showCancelButton: true,   
      closeOnConfirm: false,   
      showLoaderOnConfirm: true,
    }, function(){    
      $(that).parent().slideUp('fast',function(){
        swal.close()
        $('#form').submit()
        $(".song").removeClass("maybother grow active")
      })    
    })    
  })
})

$(document).on('click touchend','body',function(e){
  if( ! $(e.target).closest(".song").hasClass("active") && $(".song.active").length ){
    $(".song").removeClass("maybother grow active")
    $('.spotify-box').hide()
    sortableEnable(sortabledata)
  }
})

$(document).on('keyup click touchend','input[name="titulo"]',function(e){
  e.preventDefault()
  var that = this
  , dropdown = $(this).next()
  selectItem($(that).parent())
  dropdown.html("<div class='logo'></div>").hide().slideDown(300)
  fetch_spotify(that,dropdown)
})