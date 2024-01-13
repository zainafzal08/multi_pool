class Main extends Phaser.Scene {
        preload () {
        }

        create () {
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