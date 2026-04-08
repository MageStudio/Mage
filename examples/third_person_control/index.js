import {
    Router,
    store,
    Level,
    Box,
    Cube,
    Scene,
    Controls,
    AmbientLight,
    HemisphereLight,
    SunLight,
    PALETTES,
    constants,
} from "../../dist/mage.js";

export default class ThirdPersonExample extends Level {
    addLights() {
        AmbientLight.create({
            color: PALETTES.FRENCH_PALETTE.SPRAY,
            intensity: 0.5,
        });

        HemisphereLight.create({
            color: {
                sky: PALETTES.FRENCH_PALETTE.SQUASH_BLOSSOM,
                ground: PALETTES.FRENCH_PALETTE.REEF_ENCOUNTER,
            },
            intensity: 0.6,
        });

        SunLight.create({
            color: PALETTES.FRENCH_PALETTE.MELON_MELODY,
            intensity: 1,
            far: 50,
            mapSize: 2048,
        }).setPosition({ y: 10, z: -5, x: -5 });
    }

    createGround() {
        const ground = new Box(50, 1, 50, 0x808080);
        ground.setMaterialFromName(constants.MATERIALS.STANDARD, {
            roughness: 0.8,
            metalness: 0.2,
        });
        ground.setPosition({ y: -0.5 });
        ground.enablePhysics({ mass: 0 });
    }

    createObstacles() {
        const colors = [0xe74c3c, 0x2ecc71, 0xf39c12, 0x9b59b6, 0x1abc9c];
        const positions = [
            { x: 5, y: 1, z: 5 },
            { x: -6, y: 1.5, z: 3 },
            { x: 3, y: 0.75, z: -7 },
            { x: -4, y: 2, z: -5 },
            { x: 8, y: 1, z: -3 },
        ];
        const sizes = [2, 3, 1.5, 4, 2];

        positions.forEach((pos, i) => {
            const obstacle = new Cube(sizes[i], colors[i]);
            obstacle.setPosition(pos);
            obstacle.setMaterialFromName(constants.MATERIALS.STANDARD, {
                roughness: 0.5,
                metalness: 0.3,
            });
            obstacle.enablePhysics({ mass: 0 });
        });
    }

    onCreate() {
        this.addLights();
        this.createGround();
        this.createObstacles();

        // Create the player character
        const character = new Cube(1, 0x3498db);
        character.setPosition({ x: 0, y: 2, z: 0 });
        character.setMaterialFromName(constants.MATERIALS.STANDARD, {
            roughness: 0.4,
            metalness: 0.6,
        });
        character.enablePhysics({
            mass: 80,
            colliderType: "PLAYER",
            friction: 1,
        });

        // Set up third-person camera controls
        // All options are customisable:
        //   distance      - camera distance from character (default: 5)
        //   heightOffset  - camera height above character (default: 2)
        //   sensitivity   - mouse look sensitivity (default: 0.002)
        //   speed         - movement speed (default: 2)
        //   jumpSpeed     - jump velocity (default: 2)
        //   height        - character height for ground detection (default: 1.8)
        //   slowDownFactor - deceleration rate (default: 20)
        //   minPolarAngle - min vertical camera angle (default: 0.1)
        //   maxPolarAngle - max vertical camera angle (default: PI/2 - 0.1)
        //   physicsEnabled - use physics for movement and collisions (default: false)
        Controls.setThirdPersonControls({
            target: character,
            distance: 8,
            heightOffset: 3,
            sensitivity: 0.003,
            speed: 5,
            jumpSpeed: 5,
            physicsEnabled: true,
        });
    }
}

const config = {
    screen: {
        h: window.innerHeight,
        w: window.innerWidth,
        ratio: window.innerWidth / window.innerHeight,
        frameRate: 60,
        alpha: true,
    },

    lights: {
        shadows: true,
        shadowType: constants.SHADOW_TYPES.SOFT,
    },

    physics: {
        enabled: true,
        path: "dist/ammo.js",
        gravity: { x: 0, y: -9.8, z: 0 },
    },

    camera: {
        fov: 75,
        near: 0.1,
        far: 3000000,
    },
};

window.addEventListener("load", () => {
    store.createStore({}, {}, true);

    Router.on("/", ThirdPersonExample);

    Router.start(config, {});
});
