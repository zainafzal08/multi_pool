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