// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { User, getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getDatabase, ref, set, onDisconnect, onChildAdded } from "firebase/database";

import { getAnalytics } from "firebase/analytics";
import { GameObjects, Scene } from "phaser";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCGvK9BoWKmtOxotM6ZpvCuHIQIH8RxcIE",
    authDomain: "ballpool-a072f.firebaseapp.com",
    databaseURL: "https://ballpool-a072f-default-rtdb.asia-southeast1.firebasedatabase.app",
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
    private ball: Phaser.Types.Physics.Matter.MatterBody | null = null;
    

    private arrow: GameObjects.Image | null = null;

    preload() {
        this.load.image('bg', 'assets/bg.png');
        this.load.image('ball', 'assets/ball.png');
        this.load.image('arrow', 'assets/arrow.png');
        
    }

    create() {

        const bg = this.add.image(400, 300, 'bg');
        bg.setScale(.5);
        this.ball = this.matter.add.image(400, 300, 'ball');
        //this.ball.setCollideWorldBounds(true);

        this.cursors = this.input.keyboard!.createCursorKeys();

        this.arrow = this.add.image(400, 300, 'arrow');
        this.arrow.setVisible(false);
        
    }

    update(time: number, delta: number) {
        if (this.input.mousePointer.isDown) {
            // Just take the drag delta x and use that to compute the rotation,
            // this is terrible ux but it works.
            let d = this.input.mousePointer.getDistanceX() / 200;
            if (this.input.mousePointer.downX > this.input.mousePointer.x) {
                d = d * -1;
            }
            let r = d * 2 * Math.PI;
            const scaleFactor = (Phaser.Math.Clamp(
                Math.abs(this.input.mousePointer.getDistanceY()),
                50,
                200
            ) - 50) / 150;

            this.arrow!.setScale(.6 + scaleFactor);
            this.arrow!.rotation = r;
            const arrowHeight = 128 * (.6 + scaleFactor);
            const p = Phaser.Math.RotateAround(
                { x: this.ball!.x, y: this.ball!.y - (arrowHeight / 2) - 10 },
                this.ball!.x,
                this.ball!.y,
                r
            );
            this.arrow!.x = p.x;
            this.arrow!.y = p.y;
            this.arrow!.setVisible(true);
        } else {
            // Do not.
            this.arrow!.setVisible(false);
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: Main,
    physics: {
        default: 'matter',
        matter: {
            gravity: {
                x: 0,
                y: 0,
            },
            debug: true,
        }
    }
};

async function onAuthChange(user: User | null) {
    if (user) {
        // User is signed in.
        const playerID = user.uid;
        const playerRef = ref(getDatabase(), 'players/' + playerID);
        const allPlayers = ref(getDatabase(), 'players')
        onChildAdded(allPlayers, (snapshot) => { 
            if(snapshot.val().id == playerID){
                //this is the player add + create local ref of ball
            }
            else{
                //this is the opponent add to ref of opponent
            }
        });
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