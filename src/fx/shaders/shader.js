export default class Shader {

    constructor( name, attributes, uniforms, options ) {
        this.shader = M.fx.shadersEngine.get( name );
        if (!this.shader.instance) {
          this.name = this.shader.name;
          this.vertex = this.shader.vertex;
          this.fragment = this.shader.fragment;
          this.attributes = attributes ? attributes : this.shader.attributes;
          this.uniforms = uniforms ? uniforms : this.shader.uniforms;
          //creating shader options
          var object = {
            'attributes': this.attributes,
            'uniforms': this.uniforms,
            'vertexShader': this.shader.vertex,
            'fragmentShader': this.shader.fragment
          };
          //storing user options in shader options
          var opt = options ? options : this.shader.options;
          for ( o in opt ) {
            object[o] = opt[o];
          }
          //creating the actual material
          this.material = new THREE.ShaderMaterial( object );
        } else {
          this.instance = this.shader.instance;
        }
    }
});

// todo: fix also this one.
