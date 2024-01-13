function randomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

(function () {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            
        } else {
            // No user is signed in.
            
        }
    });

    firebase.auth().signInAnonymously().catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode, errorMessage);
    });

    //todo: this is copilot code, need to figure out how to make it work (this todo is also somehow copilot code this is getting weird)
    // function login() {
    //     var userEmail = document.getElementById("email_field").value;
    //     var userPass = document.getElementById("password_field").value;
    //     firebase.auth().signInWithEmailAndPassword(userEmail, userPass).catch(function (error) {
    //         // Handle Errors here.
    //         var errorCode = error.code;
    //         var errorMessage = error.message;
    //         window.alert("Error : " + errorMessage);
    //         // ...
    //     });
    //}
})();