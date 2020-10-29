import { Level, Box, Scene, Cylinder, Controls, Models, AmbientLight } from '../../../../dist/mage';

function createWheel(index) {
    return Models.getModel(`wheel${index}`);
}

function createCar(w, h, l) {
    return Models.getModel('car');
}

export default class Intro extends Level {

    addAmbientLight() {
        this.ambientLight = new AmbientLight({ color: 0xffffff });
    }

    onCreate() {
        this.addAmbientLight();
        Controls.setOrbitControl();

        Scene
            .getCamera()
            .setPosition({ y: 15, z: 45 });

        const floor = new Box(50, 1, 50, 0xffffff);
        floor.enablePhysics({ mass: 0, debug: true });
        
        const car = createCar(1.8, .6, 4);
        car.setPosition({ y: 14 });

        const wheels = [
            createWheel(1),
            createWheel(2),
            createWheel(3),
            createWheel(4),
        ];

        car.addScript('BaseCar', {
            wheels,
            mass: 1000,
            debug: true,
            wheelsOptions: {
                back: {
                    axisPosition: -1.25,
                    radius: .35,
                    halfTrack: 1,
                    axisHeight: 0
                },
                front: {
                    axisPosition: 1.2,
                    radius: .35,
                    halfTrack: 1,
                    axisHeight: 0
                }
            },
            suspensions: {
                stiffness: 20.0,
                damping: 2.3,
                compression: 4.4,
                restLength: 0.6
            }
        });
    }
}
