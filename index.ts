// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { User, getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getDatabase, ref, set, onDisconnect } from "firebase/database";

import { getAnalytics } from "firebase/analytics";
import { GameObjects, Scene } from "phaser";

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

// Initalize phaser.
class Main extends Scene {
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
    private ball: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | null = null;

    preload() {
        this.load.image('bg', 'assets/bg.png');
        this.load.image('ball', 'assets/ball.png');
    }

    create() {
        const bg = this.add.image(400, 300, 'bg');
        bg.setScale(.5);
        this.ball = this.physics.add.image(400, 300, 'ball');
        this.ball.setCollideWorldBounds(true);

        this.cursors = this.input.keyboard!.createCursorKeys();
    }

    update(time: number, delta: number) {
        if (this.cursors!.left.isDown) {
            this.ball!.setVelocityX(-160);

        } else if (this.cursors!.right.isDown) {
            this.ball!.setVelocityX(160);
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: Main,
    physics: {
        default: 'arcade',
        arcade: {}
    }
};

async function onAuthChange(user: User | null) {
    if (user) {
        // User is signed in.
        const playerID = user.uid;
        const playerRef = ref(getDatabase(), 'players/' + playerID);

        await set(playerRef, {
            id: playerID,
            name: "Anonymous",
        });
        console.log("Player added to database");
        onDisconnect(playerRef).remove();
    }
}

window.addEventListener('load', async () => {
    const game = new Phaser.Game(config);


    onAuthStateChanged(getAuth(), onAuthChange);
    try {
        signInAnonymously(getAuth())
    } catch (err) {
        var errorCode = err.code;
        var errorMessage = err.message;
        console.log(errorCode, errorMessage);
    }
});