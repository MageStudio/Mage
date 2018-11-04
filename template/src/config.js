import {
    assets,
    game,
    FirstScene
} from './FirstScene';

export default {
    name: "First Game",
    author: "Your name goes here",
    description: "this is just a sample game",
    scenes: [
        {
            className: FirstScene,
            name: "BaseScene",
            assets,
            game
        }
    ]
};
