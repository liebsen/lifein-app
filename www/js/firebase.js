var config = {
  apiKey: "AIzaSyDoB2DWScwE3614oe70uV_tj5vuwa7tB1g",
  authDomain: "lifeindev-808c2.firebaseapp.com",
  databaseURL: "https://lifeindev-808c2.firebaseio.com",
  projectId: "lifeindev-808c2",
  storageBucket: "lifeindev-808c2.appspot.com",
  messagingSenderId: "502763098312"
};

firebase.initializeApp(config)
/*
  createUserWithEmailAndPassword = function(a){
    firebase.auth().createUserWithEmailAndPassword(a.email,a.password).then(function(user) {
        user.updateProfile({
            displayName: a.displayName,
            photoURL: a.photoURL
        }).then(function() {
            // Update successful.
        }, function(error) {
            // An error happened.
        });        
    }, function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // [START_EXCLUDE]
        if (errorCode == 'auth/weak-password') {
            alert('The password is too weak.');
        } else {
            console.error(error);
        }
    })
  }
createUserWithEmailAndPassword({email:"admin@lifeinapp.com",password:"",displayName:"Administrador LifeIn"})
*/
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