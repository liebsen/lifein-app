;var currentnode='/autorizaciones/'+key,autorizacions=firebase.database().ref(currentnode),datosdeapoyo={},anim=LI.animation.transition;autorizacions.once('value').then(function(a){if(!a.val()){$('.spinner').fadeOut(anim.fadeOut,function(){$('.lista').delay(anim.delay).fadeIn()})}});firebase.database().ref('/datosdeapoyo').once('value').then(function(a){datosdeapoyo=a.val()});$(document).on('submit','#firebase-form',function(a){a.preventDefault();var e=$(this).serializeObject(),n=$(this).attr('key'),t=e.aprobado?1:0;$('.spinner').fadeIn(anim.fadeIn,function(){firebase.database().ref(currentnode+'/'+n).once('value').then(function(o){var a=o.val(),i=a.aprobado;a.aprobado=t;firebase.database().ref(currentnode+'/'+n).update(a,function(n){if(n){console.log(n)}
else{var o=!1;if(!i&&t){o={fecha:moment().format(),icon:'success',tipo:'particular',destino:a.usuario_id,titulo:'La autorizacion de '+a.nombre+' para el '+LI.aux.easyDate(a.fecha)+' fue aprobada',texto:e.texto}}
else if(i&&!t){o={fecha:moment().format(),icon:'error',tipo:'particular',destino:a.usuario_id,titulo:'La autorizacion de '+a.nombre+' para el '+LI.aux.easyDate(a.fecha)+' no fue aprobada',texto:e.texto}};if(o){var d=firebase.database().ref('/notificaciones/'+key);d.child(d.push().key).set(o)};$('#detail').fadeOut(anim.fadeOut,function(){$('.lista').fadeIn(anim.fadeIn,function(){$('.spinner').fadeOut(anim.fadeOut*anim.factor)})})}})})});return!1});$(document).on('click','.add-item',function(a){$('#detail').html($.templates('#form').render({key:null,data:{aprobado:''},aux:LI.aux.autorizacions,datosdeapoyo:datosdeapoyo},LI)).promise().done(function(){$('.lista').fadeOut(anim.fadeOut,function(){$('#detail').delay(200).fadeIn(anim.fadeOut*anim.factor,function(){$('body,html').scrollTop(0)})})})});$(document).on('click','.action.ver',function(){var a=$(this).data('key');$('body').attr('key',a);LI.setScroll();$('.spinner').fadeIn(anim.fadeIn*anim.factor,function(){firebase.database().ref(currentnode+'/'+a).once('value').then(function(a){firebase.database().ref('/cuentas/'+key+'/'+a.val().usuario_id).once('value').then(function(e){$('#detail').html($.templates('#form').render({key:a.key,data:a.val(),cuenta:e.val(),datosdeapoyo:datosdeapoyo},LI.aux)).promise().done(function(){$('.lista').fadeOut(anim.fadeOut,function(){$('.spinner').fadeOut(anim.fadeOut*anim.factor,function(){$('#detail').delay(200).fadeIn(anim.fadeOut*anim.factor,function(){$('body,html').scrollTop(0)})})})})})})})});$(document).on('click','.action.eliminar',function(){var a=$(this).data('key');swal({title:'Borrar autorizacion',text:'Seguro que querés eliminar esta autorizacion?',type:'warning',showCancelButton:!0,closeOnConfirm:!1,showLoaderOnConfirm:!0,},function(){firebase.database().ref(currentnode+a).remove().then(function(){swal.close()})})});$(document).on('click','.cerrar',function(){$('#detail').fadeOut(anim.fadeOut,function(){$('.lista').delay(anim.delay).fadeIn(anim.fadeIn,function(){LI.resetScroll()})})});autorizacions.on('child_added',(data)=>{$('#list').prepend($.templates('#item').render({key:data.key,data:data.val()},LI.aux)).promise().done(function(){$('#list').find('#'+data.key).animateAdded()});$('.spinner').fadeOut(anim.fadeOut*anim.factor,function(){$('.lista').delay(anim.delay).fadeIn()})});autorizacions.on('child_changed',(data)=>{var index=$('#'+data.key).index();$('#'+data.key).remove();$('#list').insertAt(index,$.templates('#item').render({key:data.key,data:data.val()},LI.aux));$('#'+data.key).animateChanged()});autorizacions.on('child_removed',(data)=>{$('#'+data.key).animateRemoved(function(){$(this).remove()})})