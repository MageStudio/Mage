import { createWorker } from '../lib/workers';
import { INIT_EVENT, UPDATE_EVENT, ADD_EVENT } from './messages';

const worker = createWorker(() => {

    let world,
        elements;

    const handleInitEvent = ({ dt, lib }) => {
        const { World } = lib;

        elements = [];
        world = new World({
            timestep: dt,
            iterations: 8,
            broadphase: 2,
            worldscale: 1,
            random: true,
            info: false
        });
    }

    const handleUpdateEvent = ({ }) => {
        if (world) {
            world.step();

            // send back update for mesh
            Object.keys(elements).forEach(uuid => {
                const position = elements[uuid].getPosition();
                const rotation = elements[uuid].getRotation();

                self.postMessage({
                    type: MESH_UPDATE,
                    position,
                    rotation,
                    uuid
                });
            })
        }
    }

    const handleAddEvent = ({ description, uuid }) => {
        if (world) {
            elements[uuid] = world.add(description);
        }
    }

    self.onmessage = ({ data }) => {
        switch(data.type) {
            case INIT_EVENT:
                handleInitEvent(data);
                break;
            case UPDATE_EVENT:
                handleUpdateEvent(data);
                break;
            case ADD_EVENT:
                handleAddEvent(data);
                break;
            default:
                break;
        }
    }
});

export default worker;

/*
var world;
    var minfo;
    var fps = 0;
    var f = [0,0,0];
    var body = [];
    self.onmessage = function(e) {

        if (e.data.oimoUrl && !world) {
            // Load oimo.js
            importScripts( e.data.oimoUrl );

            // Init physics
            world = new OIMO.World( { timestep:e.data.dt, iterations:8, broadphase:2, worldscale:1, random:true, info:false } );

            // Ground plane
            var ground = world.add({size:[200, 20, 200], pos:[0,-10,0]});

            var N = e.data.N;

            minfo = new Float32Array( N * 8 );

            var x, z;
            for(var i=0; i!==N; i++){
                x = -2 + Math.random()*4;
                z = -2 + Math.random()*4;
                if(N < N*0.5) body[i] = world.add({type:'sphere', size:[0.25], pos:[x,(0.5*i)+0.5,z], move:true});
                else body[i] = world.add({type:'box', size:[0.5,0.5,0.5], pos:[x,((0.5*i)+0.5),z], move:true});
            }

            setInterval( update, e.data.dt*1000 );
        }

    };

    var update = function() {

        // Step the world
        world.step();

        var n;

        body.forEach( function ( b, id ) {

            n = 8 * id;

            if( b.sleeeping ){

                minfo[ n + 7 ] = 1;

            } else {

                minfo[ n + 7 ] = 0;
                b.getPosition().toArray( minfo, n );
                b.getQuaternion().toArray( minfo, n+3 );

            }

        });

        f[1] = Date.now();
        if (f[1]-1000>f[0]){ f[0]=f[1]; fps=f[2]; f[2]=0; } f[2]++;

        self.postMessage({ perf:fps, minfo:minfo })

    }
*/
