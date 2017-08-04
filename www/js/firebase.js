var config = {
  apiKey: "AIzaSyBzuLO7pTPLvrQ3_gMTTqrfyaMnOMZ_sjw",
  authDomain: "angulafire.firebaseapp.com",
  databaseURL: "https://angulafire.firebaseio.com",
  projectId: "angulafire",
  storageBucket: "angulafire.appspot.com",
  messagingSenderId: "700740323265"
}

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