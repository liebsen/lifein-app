  var nodes = []
  , navlinks = [
    {"slug":"implementaciones","title":"Implementaciones","roles":["super"]},
    {"slug":"cuentas","title":"Cuentas","roles":["administrador"]},
    {"slug":"notificaciones","title":"Notificaciones","roles":["administrador"]},    
    {"slug":"publicaciones","title":"Publicaciones","roles":["administrador"]},
    {"slug":"propuestas","title":"Propuestas","roles":["administrador"]},
    {"slug":"reservas","title":"Reservas","roles":["administrador","seguridad"]},
    {"slug":"autorizaciones","title":"Autorizaciones","roles":["administrador","seguridad"]},
    {"slug":"lostandfound","title":"Lost & Found","roles":["administrador"]},
    {"slug":"telefonos_utiles","title":"Teléfonos Útiles","roles":["administrador","seguridad"]}
  ];

  navlinks.forEach(function(snap){
    var slug = snap.slug
    , title = snap.title
    , proceed = 0;

    if($.inArray(user.rol,snap.roles) > -1) proceed = 1;
    if($.inArray(key,user.scope) > -1) proceed = 1;
    if(user.rol == 'super' && key.length) proceed = 1;
    if(user.rol == 'super' && key.length && $.inArray("super",snap.roles) > -1) proceed = 0;
    if(user.rol != 'super' && $.inArray(user.rol,snap.roles) == -1) proceed = 0;

    if(proceed){
      $('.sections-conteiner').append($.templates('#navlink').render(snap)).promise().done(function(){
        var child = firebase.database().ref('/'+slug+(key.length?'/'+key:''));

        child.on('child_added', (data) => {
          if(!snap.count) snap.count = 0;
          if($.inArray(slug,["reservas","publicaciones","lostandfound"]) > -1){
            if(data.val().aprobado === undefined) snap.count++;
          } else {
            snap.count++;
          }
          $('a[href='+slug+']').find('.badge').text(snap.count).fadeIn();
          //$('a[href='+slug+']').animateAdded();
        });

        child.on('child_changed', (data) => {
          //$('a[href='+slug+']').animateAdded();
        });

        child.on('child_removed', (data) => {
          snap.count--;
          $('a[href='+slug+']').find('.badge').text(snap.count);
          $('a[href='+slug+']').animateAdded();
        });
      });
    }

    $('.sections-conteiner').fadeIn();
  });

  $(function(){

    $('.spinner').fadeOut(LI.animation.transition.fadeOut, function(){
      $('.sections-conteiner').fadeIn()
    })

    $('.item-home').click(function(e){
      e.preventDefault()
      var that = this
      $('.sections-conteiner').fadeOut(LI.animation.transition.fadeOut,function(){
        location.href = $(that).attr('href')
      })
      return false
    })
  })
