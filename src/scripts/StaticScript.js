/*
    This is a static script. It is a script that does not require any update
    during the game loop. It is a simple script that is used to store/initalize
    data or functions that are not required to be updated during the game loop.
*/

export default class StaticScript {
    __isStatic() {
        return true;
    }
}
