;var currentnode='/notificaciones/'+key,notificaciones=firebase.database().ref(currentnode),datosdeapoyo={},anim=LI.animation.transition,showItem=function(e){$('body').attr('key',e);LI.setScroll();$('.spinner').fadeIn(anim.fadeIn*anim.factor,function(){firebase.database().ref(currentnode+'/'+e).once('value').then(function(e){firebase.database().ref('/cuentas/'+key+'/'+e.val().destino).once('value').then(function(a){$('#detail').html($.templates('#form').render({key:e.key,data:e.val(),user:a.val(),aux:LI.aux,datosdeapoyo:datosdeapoyo},LI)).promise().done(function(){$('.lista').fadeOut(anim.fadeOut,function(){$('.spinner').fadeOut(anim.fadeOut*anim.factor,function(){$('#detail').delay(200).fadeIn(anim.fadeOut*anim.factor,function(){$('body,html').scrollTop(0)})})})})})})})};notificaciones.once('value').then(function(e){if(!e.val()){$('.spinner').fadeOut(anim.fadeOut,function(){$('.lista').delay(anim.delay).fadeIn()})}});firebase.database().ref('/datosdeapoyo').once('value').then(function(e){datosdeapoyo=e.val()});$(document).on('submit','#firebase-form',function(e){e.preventDefault();var a=$(this).serializeObject(),t={},n=$(this).attr('key');a.aprobado=a.aprobado?1:0;a.destino=a.destino&&a.destino.length?a.destino:'all';if(n){t[currentnode+'/'+n]=a}
else{var i=notificaciones.push().key;n=i;t[currentnode+'/'+n]=a};$('.spinner').fadeIn(anim.fadeIn,function(){firebase.database().ref().update(t,function(e){if(e){console.log(e)}
else{LI.resetScroll();$('.spinner').fadeOut(anim.fadeOut*anim.factor,function(){location.hash=''})}})});return!1});$(document).on('click','.action.eliminar',function(){var e=$(this).data('key');swal({title:'Borrar reserva',text:'Seguro que querés eliminar esta reserva?',type:'warning',showCancelButton:!0,closeOnConfirm:!1,showLoaderOnConfirm:!0,},function(){firebase.database().ref(currentnode+e).remove().then(function(){swal.close()})})});$(document).on('click','.cerrar',function(){location.hash=''});$(document).on('click','.users-close',function(e){$('.list-users-backdrop').fadeOut()});$(document).on('keyup','.users-filter',function(e){var a=$(this).val();$('.list-users div').each(function(){if($(this).text().indexOf(a)>-1){$(this).fadeIn(100)}
else{$(this).fadeOut(100)}})});$(document).on('click','.custom-list-user',function(e){$(this).siblings().removeClass('selected');$(this).addClass('selected');var a=$(this).data('key');$('input[name="destino"]').val(a);$('.list-users-backdrop').fadeOut()});$(document).on('click','.select-user',function(e){firebase.database().ref('/cuentas/'+key).once('value',function(e){var a=e.val();$('.list-users').html($.templates('#list_users').render({data:a,selected:$('input[name="destino"]').val()},LI.aux)).promise().done(function(){$('.list-users-backdrop').fadeIn()})})});$(function(){$(window).on('hashchange',function(){if(location.hash=='#add'){$('#detail').html($.templates('#form').render({key:null,data:null,datosdeapoyo:datosdeapoyo},LI.aux)).promise().done(function(){$('.lista').fadeOut(anim.fadeOut,function(){$('#detail').delay(200).fadeIn(anim.fadeOut*anim.factor,function(){$('.spinner').fadeOut(anim.fadeIn*anim.factor,function(){$('body,html').scrollTop(0)})})})})}
else if(location.hash!=''){showItem(location.hash.replace('#',''))}
else{$('#detail').fadeOut(anim.fadeOut,function(){$('.lista').delay(anim.delay).fadeIn(anim.fadeIn,function(){LI.resetScroll()})})}}).trigger('hashchange')});notificaciones.on('child_added',(data)=>{var item=data.val();firebase.database().ref('/cuentas/'+key+'/'+item.destino).once('value').then(function(e){$('#list').prepend($.templates('#item').render({key:data.key,data:item,user:e.val()},LI.aux)).promise().done(function(){$('#list').find('#'+data.key).animateAdded()})});if(location.hash===''){$('.spinner').fadeOut(anim.fadeOut)}});notificaciones.on('child_changed',(data)=>{var item=data.val();firebase.database().ref('/cuentas/'+key+'/'+item.destino).once('value').then(function(e){var a=$('#'+data.key).index();$('#'+data.key).remove();$('#list').insertAt(a,$.templates('#item').render({key:data.key,data:item,user:e.val()}));$('#'+data.key).animateChanged()})});notificaciones.on('child_removed',(data)=>{$('#'+data.key).animateRemoved(function(){$(this).remove()})});