import { Level, Box, Cube, Scene, Controls } from '../../../../dist/mage';

export default class Intro extends Level {

    onCreate() {
        Controls.setOrbitControl();

        Scene
            .getCamera()
            .setPosition({ y: 15, z: 45 });

        const floor = new Box(50, 1, 50, 0xffffff);
        const cube = new Cube(2, 0xff0000);
        const two = new Cube(2, 0x00ff00);
        const three = new Cube(2, 0x0000ff);

        cube.setPosition({ y: 15 });
        two.setPosition({ y: 4, x: 1 });
        three.setPosition({ y: 5, x: 2, z: 1 });

        floor.enablePhysics({ mass: 0, debug: true });

        cube.enablePhysics({ mass: 1, debug: true });
        two.enablePhysics({ mass: 1, debug: true });
        three.enablePhysics({ mass: 1, debug: true })
    }
}
