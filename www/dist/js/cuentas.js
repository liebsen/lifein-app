;var currentnode='/cuentas/'+key,cuentas=firebase.database().ref(currentnode),datosdeapoyo={},anim=LI.animation.transition;cuentas.once('value').then(function(e){if(!e.val()){$('.spinner').fadeOut(anim.fadeOut,function(){$('.lista').delay(anim.delay).fadeIn()})}});firebase.database().ref('/datosdeapoyo').once('value').then(function(e){datosdeapoyo=e.val()});$(document).on('submit','#firebase-form',function(e){e.preventDefault();var a=$(this).serializeObject(),i={},t=null,n=$(this).attr('key'),d=$('#direccion').attr('lat'),o=$('#direccion').attr('lng');a.aprobado=a.aprobado?1:0;if(d&&o){a.geo={lat:d,lng:o}};if(n){i[currentnode+'/'+n]=a}
else{var t=cuentas.push().key;n=t;i[currentnode+'/'+n]=a};$('.spinner').fadeIn(anim.fadeIn,function(){firebase.database().ref().update(i,function(e){if(e){console.log(e)}
else{if(t){var n=a;n.password=LI.randomString(12);LI.createAccount('email',n).then(function(){$('#detail').fadeOut(anim.fadeOut,function(){$('.lista').delay(anim.delay).fadeIn(anim.fadeIn,function(){LI.resetScroll();$('.spinner').fadeOut(anim.fadeOut)})})})}
else{$('#detail').fadeOut(anim.fadeOut,function(){$('.lista').delay(anim.delay).fadeIn(anim.fadeIn,function(){LI.resetScroll();$('.spinner').fadeOut(anim.fadeOut)})})}}})});return!1});$(document).on('click','.add-item',function(e){$('#detail').html($.templates('#form').render({key:null,data:{plan:''},datosdeapoyo:datosdeapoyo},LI)).promise().done(function(){$('.lista').fadeOut(anim.fadeOut,function(){$('#detail').delay(200).fadeIn(anim.fadeOut*anim.factor,function(){$('body,html').scrollTop(0);LI.initAutocomplete('direccion')})})})});$(document).on('click','.action.ver',function(){var e=$(this).data('key');$('body').attr('key',e);LI.setScroll();$('.spinner').fadeIn(anim.fadeIn*anim.factor,function(){firebase.database().ref(currentnode+'/'+e).once('value').then(function(e){var a=e.val();$('#detail').html($.templates('#form').render({key:e.key,data:a,datosdeapoyo:datosdeapoyo},LI)).promise().done(function(){$('.lista').fadeOut(anim.fadeOut,function(){$('.spinner').fadeOut(anim.fadeOut*anim.factor,function(){$('#detail').delay(200).fadeIn(anim.fadeOut*anim.factor,function(){LI.initAutocomplete('direccion');if(a.geo){$('#direccion').attr('lat',a.geo.lat).attr('lng',a.geo.lng);LI.controls()}})})})})})})});$(document).on('click','.action.eliminar',function(){var e=$(this).data('key');swal({title:'Borrar cuenta',text:'Seguro que querés eliminar esta cuenta?',type:'warning',showCancelButton:!0,closeOnConfirm:!1,showLoaderOnConfirm:!0,},function(){firebase.database().ref(currentnode+'/'+e).remove().then(function(){swal.close()})})});$(document).on('click','.cerrar',function(){$('#detail').fadeOut(anim.fadeOut,function(){$('.lista').delay(anim.delay).fadeIn(anim.fadeIn,function(){LI.resetScroll()})})});cuentas.on('child_added',(data)=>{$('#list').prepend($.templates('#item').render({key:data.key,data:data.val()},LI)).promise().done(function(){$('#list').find('#'+data.key).animateAdded()});$('.spinner').fadeOut(anim.fadeOut*anim.factor,function(){$('.lista').delay(anim.delay).fadeIn()})});cuentas.on('child_changed',(data)=>{var index=$('#'+data.key).index();$('#'+data.key).remove();$('#list').insertAt(index,$.templates('#item').render({key:data.key,data:data.val()}));$('#'+data.key).animateChanged()});cuentas.on('child_removed',(data)=>{$('#'+data.key).animateRemoved(function(){$(this).remove()})})