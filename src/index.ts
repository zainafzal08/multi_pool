// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCGvK9BoWKmtOxotM6ZpvCuHIQIH8RxcIE",
    authDomain: "ballpool-a072f.firebaseapp.com",
    projectId: "ballpool-a072f",
    storageBucket: "ballpool-a072f.appspot.com",
    messagingSenderId: "79831655126",
    appId: "1:79831655126:web:54ba1bb3cf2e1fc7215f77",
    measurementId: "G-0QNVMXSGST"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

class Main extends Phaser.Scene {
    preload() {
        this.load.image('bg', 'assets/bg.png');
    }

    create() {
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

function randomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}

(function () {

    let playerID;
    let playerRef;
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            playerID = user.uid;
            playerRef = firebase.database().ref('players/' + playerID);

            playerRef.set({
                id: playerID,
                name: "Anonymous",
            })
                .then(() => {
                    console.log("Player added to database");
                })
            playerRef.onDisconnect().remove();
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