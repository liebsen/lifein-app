var config = {
  apiKey: "AIzaSyDoB2DWScwE3614oe70uV_tj5vuwa7tB1g",
  authDomain: "lifeindev-808c2.firebaseapp.com",
  databaseURL: "https://lifeindev-808c2.firebaseio.com",
  projectId: "lifeindev-808c2",
  storageBucket: "lifeindev-808c2.appspot.com",
  messagingSenderId: "502763098312"
};

firebase.initializeApp(config)
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {

    var firebaseuser = {
      displayName : user.displayName,
      email : user.email,
      emailVerified : user.emailVerified,
      photoURL : user.photoURL,
      isAnonymous : user.isAnonymous,
      uid : user.uid,
      providerData : user.providerData
    }

    localStorage.setItem("firebaseuser",JSON.stringify(firebaseuser))
    
    setTimeout(function(){
      if(location.pathname == '/'){
        location.href = '/menu'
      }
    },300)
  } else {
    if(location.pathname != '/' && location.pathname != '/recuperar-contrasena'){
    //if($('body').hasClass('layout-plain')) {
      location.href = '/'
    }
  } 
})