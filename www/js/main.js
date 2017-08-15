var ismobile=navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i)
, authmessages={"auth/user-not-found":"Usuario no válido","auth/wrong-password":"La contrseña es inválida. Tal vez mayúsculas?"}

jQuery.fn.insertAt = function(index, element) {
  var lastIndex = this.children().size()
  if (index < 0) {
    index = Math.max(0, lastIndex + 1 + index)
  }
  this.append(element);
  if (index < lastIndex) {
    this.children().eq(index).before(this.children().last())
  }
  return this
}

jQuery.fn.animateAdded = function (cb) {
    var that = this
    this.addClass('saving')
    setTimeout(function(){
        that.removeClass("saving")
    },1500)
}

jQuery.fn.animateRemoved = function (cb) {
    this.show().addClass('saving').fadeOut(1500,function(){
        if(typeof cb == 'function') cb.call(this)
    })
}

jQuery.fn.animateChanged = function (cb) {
    var that = this
    this.removeClass("unsaved").removeClass("saved").removeClass("saving")
    setTimeout(function(){
        that.addClass("saving")
    },10)
    setTimeout(function(){
        that.removeClass("saving").addClass("saved")
        if(typeof cb == 'function') cb.call(this)
    },1010)
}

jQuery.fn.serializeObjectMultiple = function() {
    var o = []
    , c = []
    , d = {}
    , a = this.serializeArray()

    $.each(a, function(i,arr) {
    	if(d[this.name]) d = {}
    	d[this.name] = this.value
    	if($.inArray(this.name,c) == -1){
    		c.push(this.name)
    	} 
    	if(i%c.length==0){
	    	o.push(d)
	    }
    })
    return o
}

jQuery.fn.serializeObject = function() {
    var o = {}
    , a = this.serializeArray()
    $.each(a, function() {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]]
            }
            o[this.name].push(this.value || '')
        } else {
            o[this.name] = this.value || ''
        }
    })
    return o
}

$(function(){

    var user = localStorage.getItem("firebaseuser")
    , user = $.parseJSON(user)

    if(user){
        $('.session-status').html(user.email)
    }

    $('.w-nav-link').not('.salir').click(function(e){
      e.preventDefault()
      var that = this
      $('body').fadeOut(helper.animation.transition.fadeOut*helper.animation.transition.factor,function(){
        location.href = $(that).attr('href')
      })
      return false
    })
})

$(document).on('click','.salir',function(){
    $('.spinner').fadeIn(helper.animation.transition.fadeIn*helper.animation.transition.factor,function(){
        firebase.auth().signOut().then(function() {
            localStorage.clear()
            location.href = '/'
        }).catch(function(err) {
            alert(err.message)
        })
    })
})

$(document).on('click','.login',function(){
    var email = $.trim($('#email').val())
    , pass = $.trim($('#password').val())
    , that = this

    $(this).prop('disabled',true).animate({opacity:0.7}).text("Por favor espere ... ")
    firebase.auth().signInWithEmailAndPassword(email, pass).catch(function(err) {
        if(err){
            $(that).prop('disabled',false).animate({opacity:1}).text("Continuar")
            swal("No se pudo iniciar sesión", authmessages[err.code], "error")
        }
    })      
})

moment.locale('es')
$.views.settings.delimiters("[[", "]]")