export const PREFIX = "[Mage]";
export const DEPRECATED = "[DEPRECATED]";

export const DEPRECATIONS = {
    PARTICLES_ADD_PARTICLE_EMITTER: `${PREFIX} ${DEPRECATED} Particles.addParticleEmitter is deprecated, use Particles.add instead. Will be removed in the next major release`,
    MODELS_GETMODEL: `${PREFIX} ${DEPRECATED} Models.getModel is deprecated, use Models.get instead. Will be removed in next major release`,
    SCRIPTS_CREATE: `${PREFIX} ${DEPRECATED} Scripts.create is deprecated, use Scripts.register instead. Will be removed in next major release.`,
    ELEMENT_SET_TEXTURE_MAP: `${PREFIX} ${DEPRECATED} Element.setTextureMap is deprecated, use Element.setTexture() instead. Will be removed in next major release.`,
    SET_ORBIT_CONTROL: `${PREFIX} ${DEPRECATED} Controls.setOrbitControl() is deprecated, use Controls.setOrbitControls() instead. Will be removed in next major release.`,
    SET_TRANSFORM_CONTROL: `${PREFIX} ${DEPRECATED} Controls.setTransformControl() is deprecated, use Controls.setTransformControls() instead. Will be removed in next major release.`,
    SET_FIRST_PERSON_CONTROL: `${PREFIX} ${DEPRECATED} Controls.setFirstPersonControl() is deprecated, use Controls.setFirstPersonControls() instead. Will be removed in next major release.`,
    SET_FLY_CONTROL: `${PREFIX} ${DEPRECATED} Controls.setFlyControl() is deprecated, use Controls.setFlyControls() instead. Will be removed in next major release.`,
};

export const MALFORMED_ONCREATE_FUNCTION = `${PREFIX} Something wrong in your onCreate method.`;
export const ONCREATE_NOT_AVAILABLE = `${PREFIX} Your scene needs a onCreate method.`;

export const PATH_NOT_FOUND = `${PREFIX} can't find requested path`;

export const NEW_REDUCER_ERROR = `${PREFIX} Impossible adding new reducer`;
export const STORE_DOESNT_EXIST = `${PREFIX} Store hasn't been created yet.`;

export const LOCALSTORAGE_NOT_AVAILABLE = `${PREFIX} localStorage is not available.`;
export const WORKERS_NOT_AVAILABLE = `${PREFIX} Your browser doesn't support Workers.`;
export const BOUNDINGBOX_NOT_AVAILABLE = `${PREFIX} Selected element does not have a computed bounding box.`;

export const INVALID_EMITTER_ID = `${PREFIX} The selected emitter id is not valid.`;
export const EMITTER_NOT_FOUND = `${PREFIX} The requested emitter could not be found`;

export const FEATURE_NOT_SUPPORTED = `${PREFIX} The following features are not supported: `;

export const METHOD_NOT_SUPPORTED = `${PREFIX} This method is not supported.`;

export const ANIMATION_NOT_FOUND = `${PREFIX} Required animation can't be found.`;
export const ANIMATION_HANDLER_NOT_FOUND = `${PREFIX} AnimationHander hasn't been defined yet.`;

export const ELEMENT_NOT_SET = `${PREFIX} Body hasn't been defined yet.`;
export const ELEMENT_NO_MATERIAL_SET = `${PREFIX} This element doesn't have a material.`;
export const ELEMENT_NAME_NOT_PROVIDED = `${PREFIX} Desired element name wasn't provided.`;
export const ELEMENT_NO_GEOMETRY_SET = `${PREFIX} This element doesn't have a geometry.`;
export const ELEMENT_NO_MATERIAL_CANT_SET_TEXTURE = `${PREFIX} This element doesn't have a material, can't set texture.`;
export const ELEMENT_SET_COLOR_MISSING_COLOR = `${PREFIX} Can't set color for this element, missing color`;
export const ELEMENT_MATERIAL_NO_SUPPORT_FOR_TEXTURE = `${PREFIX} This element's material does not support texture: `;

export const ENTITY_NOT_SET = `${PREFIX} This entity does not have a body.`;
export const ENTITY_TYPE_NOT_ALLOWED = `${PREFIX} The desired Entity type is not allowed.`;
export const ENTITY_CANT_ADD_NOT_ENTITY = `${PREFIX} Entity.add requires an Entity.`;
export const ENTITY_CHILD_IS_NOT_ENTITY = `${PREFIX} The required child is not an instance of Entity.`;

export const ERROR_LOADING_TEXTURE = `${PREFIX} Error while loading texture:`;
export const CUBE_TEXTURES_NOT_LIST = `${PREFIX} CubeTextures have to be defined as array of images`;

export const TAG_CANT_BE_REMOVED = `${PREFIX} The default tag can't be removed.`;
export const TAG_ALREADY_EXISTS = `${PREFIX} The following tag has already been added: `;
export const TAG_NOT_EXISTING_REMOVAL = `${PREFIX} The following tag has can't be removed because it hasnt been added: `;

export const USER_DATA_IS_MISSING = `${PREFIX} This entity cannot hold custom data.`;
export const KEY_IS_MISSING = `${PREFIX} You need to provide a valid key`;
export const KEY_VALUE_IS_MISSING = `${PREFIX} You need to provide a valid key/value pair`;

export const STATE_MACHINE_NOT_AVAILABLE = `${PREFIX} State Machine is not enabled.`;

export const EFFECT_COULD_NOT_BE_CREATED = `${PREFIX}  Could not create requested effect.`;
export const EFFECT_UNAVAILABLE = `${PREFIX}  Requested effect is not available.`;

export const SCRIPT_NOT_FOUND = `${PREFIX} Could not find desired script.`;

export const KEYBOARD_COMBO_ALREADY_REGISTERED = `${PREFIX} Keyboard combo already registered.`;
export const KEYBOARD_COMBO_IS_INVALID = `${PREFIX} Keyboard combo is not valid.`;

export const PHYSICS_ELEMENT_CANT_BE_REMOVED = `${PREFIX} This element can't be removed from physics world.`;
export const PHYSICS_ELEMENT_ALREADY_STORED = `${PREFIX} This element has already been added to the world.`;
export const PHYSICS_ELEMENT_MISSING = `${PREFIX} This element is missing from the world, please enable its physics first.`;

export const ASSETS_AUDIO_LOAD_FAIL = `${PREFIX} Could not load audio.`;
export const ASSETS_AUDIO_FILE_LOAD_FAIL = `${PREFIX} Could not load desired audio file.`;
export const ASSETS_TEXTURE_LOAD_FAIL = `${PREFIX} Could not load texture.`;
export const ASSETS_IMAGE_LOAD_FAIL = `${PREFIX} Could not load image.`;
export const ASSETS_VIDEO_LOAD_FAIL = `${PREFIX} Could not load video.`;
export const ASSETS_MODEL_LOAD_FAIL = `${PREFIX} Could not load model.`;

export const AUDIO_CONTEXT_NOT_AVAILABLE = `${PREFIX} No Audio Context available, sorry.`;
export const AUDIO_UNABLE_TO_LOAD_SOUND = `${PREFIX} Unable to load sound, sorry.`;
export const AUDIO_SOURCE_NOT_DEFINED = `${PREFIX} No audio source defined. Set a source for this sound.`;

export const LIGHT_NOT_FOUND = `${PREFIX} This light was not created properly.`;
export const LIGHT_HOLDER_MODEL_NOT_FOUND = `${PREFIX} This light holder model can't be found.`;

export const LABEL_DOMELEMENT_MISSING = `${PREFIX} Could not create Label, domElement is missing. Did you forget to set the this.element ref on your component?`;
