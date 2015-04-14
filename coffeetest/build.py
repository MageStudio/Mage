import os

modules = {
    'audio': [
        'sound',
        'sound.background',
        'sound.mesh',
        'sound.ambient',
        'sound.directional'
    ],
    'core': [
        'entity',
        'screen',
        'world',
        'assets',
        'control',
        'game',
        'app'
    ],
    'controls': [
        'controller',
        'free.controller',
        'lock.controller'
    ],
    'devices': [
        'mouse',
        'leap'
    ],
    'entities': [
        'camera',
        'light',
        'light.ambient',
        'light.point',
        'mesh',
        'mesh.shader',
        'mesh.animated'
    ],
    'fx': ['shader'],
    'managers': [
        'assetsmanager',
        'audio.manager',
        'images.manager',
        'video.manager',
        'lights.manager',
        'shaders.manager'
    ],
    '_root_': ['wage']
}

order = [
    'core', 'audio', 'fx', 'controls', 'managers', 'entities', 'devices',
    '_root_'
]

_base_path = os.path.join(os.getcwd(), '..', 'compiled')
out = ""
for key in order:
    if key == "_root_":
        folder = ""
    else:
        folder = key
    path = os.path.join(_base_path, folder)
    for element in modules[key]:
        f = open(os.path.join(path, element+".js"), 'r')
        out += f.read()
        out += "\n"
        f.close()
f = open('libs/wage.js', 'w')
f.write(out)
f.close()
