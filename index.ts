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
    /** The ball controlled by the current local player */
    private localBall: Phaser.Physics.Matter.Sprite | null = null;
    private goalBall: Phaser.Physics.Matter.Sprite | null = null;
    private ballList: Phaser.Physics.Matter.Image[] = [];
    private arrow: GameObjects.Image | null = null;
    private dragCircle: GameObjects.Graphics | null = null;
    private lastUserInput: { direction: Phaser.Math.Vector2, force: number } | null = null;
    private dragCircleRadius = 50;
    private holeLocations = [{ x: 40, y: 40 }, { x: 760, y: 40 }, { x: 40, y: 560 }, { x: 760, y: 560 }];

    preload() {
        this.load.image('bg', 'assets/bg.png');
        this.load.image('ball', 'assets/ball.png');
        this.load.image('ball_local', 'assets/ball_local.png');
        this.load.image('ball_remote', 'assets/ball_remote.png');
        this.load.image('hole_local', 'assets/hole_local.png');
        this.load.image('hole_remote', 'assets/hole_remote.png');
        this.load.image('arrow', 'assets/arrow.png');

    }

    create() {
        const bg = this.add.image(400, 300, 'bg');
        bg.setScale(.5);
        this.localBall = this.createBall(200, 300, 'local');
        this.goalBall = this.createBall(400, 300, 'goal');

        this.dragCircle = this.add.graphics();
        this.dragCircle.lineStyle(2, 0xffffff, 1);
        this.dragCircle.strokeCircle(0, 0, this.dragCircleRadius);
        this.dragCircle.setVisible(false);

        this.arrow = this.add.image(400, 300, 'arrow');
        this.arrow.setVisible(false);
        this.arrow.setOrigin(0.5, 1);

        this.matter.world.setBounds(0, 0, 800, 600);
    }

    createBall(x: number, y: number, type: 'local' | 'goal' | 'remote') {
        let ballSprite = 'ball';
        let holeSprite: string | null = null;
        if (type === 'local') {
            ballSprite = 'ball_local';
            holeSprite = 'hole_local';
        } else if (type === 'remote') {
            ballSprite = 'ball_remote';
            holeSprite = 'hole_remote';
        }

        const ballRef = this.matter.add.sprite(x, y, ballSprite);
        ballRef.setCircle(5);
        ballRef.setFriction(0.0);
        ballRef.setBounce(0.99);
        ballRef.setDensity(0.1);

        // For each player ball create a unique hole.
        if (holeSprite !== null) {
            const holePos = this.holeLocations.pop()!;
            const hole = this.matter.add.sprite(holePos.x, holePos.y, holeSprite);
            hole.setStatic(true);
            hole.setOnCollide((collisionData: Phaser.Types.Physics.Matter.MatterCollisionData) => {
                if (
                    collisionData.bodyA.gameObject !== this.goalBall &&
                    collisionData.bodyB.gameObject !== this.goalBall) {
                    return;
                }
                // Goal ball was sinked by the player who owns `ballRef`.
                // Reset the goal ball.
                this.goalBall!.setPosition(400, 300);
            });
        }

        return ballRef;
    }

    drawUI() {
        if (!this.localBall || !this.arrow || !this.dragCircle) {
            return;
        }
        this.arrow.setPosition(this.localBall.x, this.localBall.y);
        const center = new Phaser.Math.Vector2(
            this.input.mousePointer.downX, this.input.mousePointer.downY);
        const direction = new Phaser.Math.Vector2(
            this.input.mousePointer.x,
            this.input.mousePointer.y).subtract(center);
        const force = Math.min(
            this.input.mousePointer.getDistance() / this.dragCircleRadius, 1)
        this.dragCircle.x = center.x;
        this.dragCircle.y = center.y;

        const arrowScale = .5 + force;
        const arrowRotation = Phaser.Math.Angle.BetweenPoints(
            // Vector pointing straight up.
            { x: 0, y: -1 },
            direction
        );

        this.arrow.setScale(arrowScale);
        this.arrow.setRotation(arrowRotation - Math.PI / 2);
        this.dragCircle.setVisible(true);
        this.arrow!.setVisible(true);
        this.lastUserInput = { direction, force };
    }

    hideUI() {
        this.dragCircle!.setVisible(false);
        this.arrow!.setVisible(false);
    }

    update(time: number, delta: number) {
        if (this.input.mousePointer.isDown) {
            this.drawUI();
        } else {
            // If the mouse was held down for more then 200ms register a hit.
            if (this.input.mousePointer.getDuration() > 200) {
                this.hitBall(this.lastUserInput!.direction, this.lastUserInput!.force);
            }
            this.hideUI();
        }
    }

    /**
     * Hit the ball towards `direction` with a force of `force`.
     * Force is a number between 0 and 1 with 0 representing the _minimum_ force
     * and 1 representating the maximum. A force of 0 simply means to use the
     * minimum force, not that no force should be applied.
     */
    hitBall(direction: Phaser.Math.Vector2, force: number) {
        direction = direction.multiply(new Phaser.Math.Vector2(-1, -1));
        this.localBall!.applyForce(direction.scale(force * 0.01));
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
            if (snapshot.val().id == playerID) {
                //this is the player add + create local ref of ball
            }
            else {
                //this is the opponent add to ref of opponent
            }
        });

        await set(playerRef, {
            id: playerID,
            name: "Anonymous",
            ballX: 0,
            ballY: 0,
            ballVX: 0,
            ballVY: 0,
            ballForce: 0,

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