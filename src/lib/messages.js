export const PREFIX = '[Mage]';

export const MALFORMED_ONCREATE_FUNCTION = `${PREFIX} Something wrong in your onCreate method.`;
export const ONCREATE_NOT_AVAILABLE = `${PREFIX} Your scene needs a onCreate method.`;

export const PATH_NOT_FOUND = `${PREFIX} can't find requested path`;

export const NEW_REDUCER_ERROR = `${PREFIX} Impossible adding new reducer`;
export const STORE_DOESNT_EXIST = `${PREFIX} Store hasn't been created yet.`;

export const LOCALSTORAGE_NOT_AVAILABLE = `${PREFIX} localStorage is not available.`;
export const WORKERS_NOT_AVAILABLE = `${PREFIX} Your browser doesn't support Workers.`;
export const BOUNDINGBOX_NOT_AVAILABLE = `${PREFIX} Selected element does not have a computed bounding box.`;

export const INVALID_EMITTER_ID = `${PREFIX} The selected emitter id is not valid.`;

export const FEATURE_NOT_SUPPORTED = `${PREFIX} The following features are not supported: `;

export const ANIMATION_NOT_FOUND = `${PREFIX} Required animation can't be found.`;
export const ANIMATION_HANDLER_NOT_FOUND = `${PREFIX} AnimationHander hasn't been defined yet.`;

export const ELEMENT_NOT_SET = `${PREFIX} Body hasn't been defined yet.`;
export const ELEMENT_NO_MATERIAL_SET = `${PREFIX} This element doesn't have a material.`;
export const ELEMENT_NAME_NOT_PROVIDED = `${PREFIX} Desired element name wasn't provided.`;
export const ELEMENT_NO_GEOMETRY_SET = `${PREFIX} This element doesn't have a geometry.`;
export const ELEMENT_NO_MATERIAL_CANT_SET_TEXTURE = `${PREFIX} This element doesn't have a material, can't set texture.`;
export const ELEMENT_SET_COLOR_MISSING_COLOR = `${PREFIX} Can't set color for this element, missing color`;

export const ENTITY_TYPE_NOT_ALLOWED = `${PREFIX} The desired Entity type is not allowed.`;

export const ERROR_LOADING_TEXTURE = `${PREFIX} Error while loading texture:`;
export const CUBE_TEXTURES_NOT_LIST = `${PREFIX} CubeTextures have to be defined as array of images`;

export const TAG_CANT_BE_REMOVED = `${PREFIX} The default tag can't be removed.`;
export const TAG_ALREADY_EXISTS = `${PREFIX} The following tag has already been added: `;
export const TAG_NOT_EXISTING_REMOVAL= `${PREFIX} The following tag has can't be removed because it hasnt been added: `;

export const STATE_MACHINE_NOT_AVAILABLE = `${PREFIX} State Machine is not enabled.`;

export const EFFECT_COULD_NOT_BE_CREATED = `${PREFIX}  Could not create requested effect.`;
export const EFFECT_UNAVAILABLE = `${PREFIX}  Requested effect is not available.`;

export const SCRIPT_NOT_FOUND = `${PREFIX} Could not find desired script.`;

export const KEYBOARD_COMBO_ALREADY_REGISTERED = `${PREFIX} Keyboard combo already registered.`;
export const KEYBOARD_COMBO_IS_INVALID = `${PREFIX} Keyboard combo is not valid.`;

export const PHYSICS_ELEMENT_CANT_BE_REMOVED = `${PREFIX} This element can't be removed from physics world.`;
export const PHYSICS_ELEMENT_ALREADY_STORED = `${PREFIX} This element has already been added to the world.`;
export const PHYSICS_ELEMENT_MISSING = `${PREFIX} This element is missing from the world, please use the .enablePhysics(options) method first.`;


export const ASSETS_AUDIO_LOAD_FAIL = `${PREFIX} Could not load audio.`;
export const ASSETS_TEXTURE_LOAD_FAIL = `${PREFIX} Could not load texture.`;
export const ASSETS_IMAGE_LOAD_FAIL = `${PREFIX} Could not load image.`;
export const ASSETS_VIDEO_LOAD_FAIL = `${PREFIX} Could not load video.`;
export const ASSETS_MODEL_LOAD_FAIL = `${PREFIX} Could not load model.`;