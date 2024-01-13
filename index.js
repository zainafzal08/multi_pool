
function randomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

(function () {

    let playerID;
    let playerRef;
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
});
class Main extends Phaser.Scene {
        preload () {
            this.load.image('bg', 'assets/bg.png');
        }

        create () {
            this.add.image(400, 300, 'sky');
        }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: Main,
    physics: {
        default: 'pool_table',
        pool_table: {}
    }
};

window.addEventListener('load', () => {
    const game = new Phaser.Game(config);
});