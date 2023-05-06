import { CreateCylinder, CreateRibbon, CreateTorusKnot, KeyboardEventTypes, Mesh } from '@babylonjs/core';
import { Scene } from '@babylonjs/core/scene';
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { Vector2, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { CreateBox } from '@babylonjs/core';

class Renderer {
    constructor(canvas, engine, material_callback, ground_mesh_callback) {
        this.canvas = canvas;
        this.engine = engine;
        this.scenes = [
            {
                scene: new Scene(this.engine),
                background_color: new Color4(0.1, 0.1, 0.1, 1.0),
                materials: null,
                ground_subdivisions: [50, 50],
                ground_mesh: null,
                camera: null,
                ambient: new Color3(0.2, 0.2, 0.2),
                lights: [],
                models: []
            },
            {
                scene: new Scene(this.engine),
                background_color: new Color4(0.0, 0.5, 1.0, 0.15),
                materials: null,
                ground_subdivisions: [50, 50],
                ground_mesh: null,
                camera: null,
                ambient: new Color3(0.2, 0.2, 0.2),
                lights: [],
                models: []
            },
            {
                scene: new Scene(this.engine),
                background_color: new Color4(0.0, 0.5, 1.0, 0.15),
                materials: null,
                ground_subdivisions: [50, 50],
                ground_mesh: null,
                camera: null,
                ambient: new Color3(0.2, 0.2, 0.2),
                lights: [],
                models: []
            }
        ];
        this.active_scene = 0;
        this.active_light = 0;
        this.shading_alg = 'gouraud';

        this.lightSpeed = new Vector3(0, 0, 0);

        this.scenes.forEach((scene, idx) => {
            scene.materials = material_callback(scene.scene);
            scene.ground_mesh = ground_mesh_callback(scene.scene, scene.ground_subdivisions);
            this['createScene' + idx](idx);
        });
    }

    createScene0(scene_idx) {
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 10.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, 1.8, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 0.1;
        current_scene.camera.maxZ = 100.0;

        // Create point light sources
        let light0 = new PointLight('light0', new Vector3(1.0, 1.0, 5.0), scene);
        light0.diffuse = new Color3(0.1, 1.0, 1.0);
        light0.specular = new Color3(0.1, 1.0, 1.0);
        current_scene.lights.push(light0);

        let light1 = new PointLight('light1', new Vector3(0.0, 3.0, 0.0), scene);
        light1.diffuse = new Color3(1.0, 0.1, 0.1);
        light1.specular = new Color3(1.0, 0.1, 0.1);
        current_scene.lights.push(light1);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture('/heightmaps/default.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.metadata = {
            mat_color: new Color3(1, 1, 1),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 100,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap
        }
        ground_mesh.material = materials['ground_' + this.shading_alg];

        // Create other models
        let sphere = CreateSphere('sphere', { segments: 10 }, scene);
        sphere.position = new Vector3(1.0, 0.5, 3.0);
        sphere.metadata = {
            mat_color: new Color3(0.10, 0.35, 0.88),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        sphere.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere);


        scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN:
                    switch (kbInfo.event.key) {
                        case "a":
                            this.lightSpeed.x = -5;
                            break;
                        case "d":
                            this.lightSpeed.x = 5;
                            break;
                        case "r":
                            this.lightSpeed.y = 5;
                            break;
                        case "f":
                            this.lightSpeed.y = -5;
                            break;
                        case "w":
                            this.lightSpeed.z = -5;
                            break;
                        case "s":
                            this.lightSpeed.z = 5;
                            break;
                        default:
                            break;
                    }
                    console.log("KEY DOWN: ", kbInfo.event.key);
                    break;
                case KeyboardEventTypes.KEYUP:
                    switch (kbInfo.event.key) {
                        case "a":
                            this.lightSpeed.x = 0;
                            break;
                        case "d":
                            this.lightSpeed.x = 0;
                            break;
                        case "r":
                            this.lightSpeed.y = 0;
                            break;
                        case "f":
                            this.lightSpeed.y = 0;
                            break;
                        case "w":
                            this.lightSpeed.z = 0;
                            break;
                        case "s":
                            this.lightSpeed.z = 0;
                            break;
                        default:
                            break;
                    }
                    console.log("KEY UP: ", kbInfo.event.code);
                    break;
                default:
                    break;
            }
        });

        // Animation function - called before each frame gets rendered
        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)

            //console.log(this.lightSpeed);
            current_scene.lights[this.active_light].position.x += this.lightSpeed.x * scene.getAnimationRatio() / 60.0;
            current_scene.lights[this.active_light].position.y += this.lightSpeed.y * scene.getAnimationRatio() / 60.0;
            current_scene.lights[this.active_light].position.z += this.lightSpeed.z * scene.getAnimationRatio() / 60.0;

            // ...
            //console.log(current_scene.models[0].position);
            // update uniforms in shader programs
            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });
    }

    createScene1(scene_idx) {
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 10.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, 1.8, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 0.1;
        current_scene.camera.maxZ = 100.0;

        // Create point light sources
        let light0 = new PointLight('light0', new Vector3(1.0, 1.0, 5.0), scene);
        light0.diffuse = new Color3(1.0, 1.0, 1.0);
        light0.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light0);

        let light1 = new PointLight('light1', new Vector3(0.0, 3.0, 0.0), scene);
        light1.diffuse = new Color3(1.0, 0.0, 0.0);
        light1.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light1);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let checkerboard = new Texture('/textures/wood.jpg', scene);
        let ground_heightmap = new Texture('/heightmaps/newhieghtmap.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.metadata = {
            mat_color: new Color3(0.10, 0.65, 0.15),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 100,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap
        }
        ground_mesh.material = materials['ground_' + this.shading_alg];

        // Create other models
        let box = CreateBox('box', { segments: 20 }, scene);
        box.position = new Vector3(1.0, 2.0, 3.0);
        box.metadata = {
            mat_color: new Color3(0.99, 0.01, 0.01),
            mat_texture: checkerboard,
            mat_specular: new Color3(0.1, 0.1, 0.1),
            mat_shininess: 20,
            texture_scale: new Vector2(1.0, 1.0)
        }
        box.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(box);

        // Create other models
        let sphere = CreateSphere('sphere', { segments: 10 }, scene);
        sphere.position = new Vector3(8.0, 5.0, -8.0);
        sphere.metadata = {
            mat_color: new Color3(1.0, 1.0, 0.0),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        sphere.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere);


        scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN:
                    switch (kbInfo.event.key) {
                        case "a":
                            this.lightSpeed.x = -5;
                            break;
                        case "d":
                            this.lightSpeed.x = 5;
                            break;
                        case "r":
                            this.lightSpeed.y = 5;
                            break;
                        case "f":
                            this.lightSpeed.y = -5;
                            break;
                        case "w":
                            this.lightSpeed.z = -5;
                            break;
                        case "s":
                            this.lightSpeed.z = 5;
                            break;
                        default:
                            break;
                    }
                    console.log("KEY DOWN: ", kbInfo.event.key);
                    break;
                case KeyboardEventTypes.KEYUP:
                    switch (kbInfo.event.key) {
                        case "a":
                            this.lightSpeed.x = 0;
                            break;
                        case "d":
                            this.lightSpeed.x = 0;
                            break;
                        case "r":
                            this.lightSpeed.y = 0;
                            break;
                        case "f":
                            this.lightSpeed.y = 0;
                            break;
                        case "w":
                            this.lightSpeed.z = 0;
                            break;
                        case "s":
                            this.lightSpeed.z = 0;
                            break;
                        default:
                            break;
                    }
                    console.log("KEY UP: ", kbInfo.event.code);
                    break;
                default:
                    break;
            }
        });

        // Animation function - called before each frame gets rendered
        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)

            //console.log(this.lightSpeed);
            current_scene.lights[this.active_light].position.x += this.lightSpeed.x * scene.getAnimationRatio() / 60.0;
            current_scene.lights[this.active_light].position.y += this.lightSpeed.y * scene.getAnimationRatio() / 60.0;
            current_scene.lights[this.active_light].position.z += this.lightSpeed.z * scene.getAnimationRatio() / 60.0;

            // ...
            //console.log(current_scene.models[0].position);
            // update uniforms in shader programs
            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });
    }

    createScene2(scene_idx) {
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 12.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, 1.8, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 0.1;
        current_scene.camera.maxZ = 100.0;

        // Create point light sources
        let light0 = new PointLight('light0', new Vector3(2.0, 1.0, 5.0), scene);
        light0.diffuse = new Color3(1.0, 0.0, 0.0);
        light0.specular = new Color3(1.0, 0.0, 0.0);
        current_scene.lights.push(light0);

        let light1 = new PointLight('light1', new Vector3(-2.0, 1.0, 5.0), scene);
        light1.diffuse = new Color3(0.0, 0.0, 1.0);
        light1.specular = new Color3(0.0, 0.0, 1.0);
        current_scene.lights.push(light1);

        let light2 = new PointLight('light2', new Vector3(-2.0, 1.0, 0.0), scene);
        light2.diffuse = new Color3(0.0, 1.0, 0.0);
        light2.specular = new Color3(0.0, 1.0, 0.0);
        current_scene.lights.push(light2);

        let light3 = new PointLight('light3', new Vector3(2.0, 1.0, 0.0), scene);
        light3.diffuse = new Color3(0.0, 1.0, 1.0);
        light3.specular = new Color3(0.0, 1.0, 1.0);
        current_scene.lights.push(light3);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture('/heightmaps/newhieghtmap.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.metadata = {
            mat_color: new Color3(0, 1, 0),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 100,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap
        }
        ground_mesh.material = materials['ground_' + this.shading_alg];

        let head = CreateSphere('head', {segments: 20}, scene);
        head.position = new Vector3(0.0, 1.0, 3.0);
        head.scaling = new Vector3(3.0, 3.0, 3.0);
        head.metadata = {
            mat_color: new Color3(1.0, 1.0, 0.0),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        head.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(head);

        let lefteye = CreateSphere('left', {segments:20}, scene);
        lefteye.position = new Vector3(-0.5, 1.75, 4.0);
        lefteye.scaling = new Vector3(0.5, 0.5, 0.5);
        lefteye.metadata = {
            mat_color: new Color3(0.0, 0.0, 0.0),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 100, 
            texture_scale: new Vector2(1.0, 1.0)
        }
        lefteye.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(lefteye);

        let righteye = CreateSphere('right', {segments:20}, scene);
        righteye.position = new Vector3(0.5, 1.75, 4.0);
        righteye.scaling = new Vector3(0.5, 0.5, 0.5);
        righteye.metadata = {
            mat_color: new Color3(0.0, 0.0, 0.0),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 100, 
            texture_scale: new Vector2(1.0, 1.0)
        }
        righteye.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(righteye);

        let base = CreateCylinder('base', {segments :20}, scene);
        base.position = new Vector3(0.0, 2.2, 3.0);
        base.scaling = new Vector3(3.0, 0.1, 3.0);
        base.metadata = {
            mat_color: new Color3(1.0, 0.0, 1.0),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 100, 
            texture_scale: new Vector2(1.0, 1.0)
        }
        base.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(base);

        let top = CreateCylinder('top', {segments :20}, scene);
        top.position = new Vector3(0.0, 3.0, 3.0);
        top.scaling = new Vector3(1.8, 1.0, 1.8);
        top.metadata = {
            mat_color: new Color3(1.0, 0.0, 1.0),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 100, 
            texture_scale: new Vector2(1.0, 1.0)
        }
        top.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(top);

        let leftarm = CreateBox('leftarm', {segments :20}, scene);
        leftarm.position = new Vector3(0.0, 1.2, 3.0);
        leftarm.scaling = new Vector3(5.0, 0.5, 0.5);
        leftarm.metadata = {
            mat_color: new Color3(1.0, 1.0, 0.0),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 100, 
            texture_scale: new Vector2(1.0, 1.0)
        }
        leftarm.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(leftarm);

        let leftleg = CreateBox('leftleg', {segments :20}, scene);
        leftleg.position = new Vector3(-0.5, 0.5, 3.0);
        leftleg.scaling = new Vector3(0.5, 4.0, 0.5);
        leftleg.metadata = {
            mat_color: new Color3(1.0, 1.0, 0.0),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 100, 
            texture_scale: new Vector2(1.0, 1.0)
        }
        leftleg.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(leftleg);

        let rightleg = CreateBox('rightleg', {segments :20}, scene);
        rightleg.position = new Vector3(0.5, 0.5, 3.0);
        rightleg.scaling = new Vector3(0.5, 4.0, 0.5);
        rightleg.metadata = {
            mat_color: new Color3(1.0, 1.0, 0.0),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 100, 
            texture_scale: new Vector2(1.0, 1.0)
        }
        rightleg.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(rightleg);

        let mouth = CreateBox('mouth', {segments :20}, scene);
        mouth.position = new Vector3(0.0, 0.5, 4.4);
        mouth.scaling = new Vector3(2.0, 0.2, 0.2);
        mouth.metadata = {
            mat_color: new Color3(1.0, 0.0, 0.0),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 100, 
            texture_scale: new Vector2(1.0, 1.0)
        }
        mouth.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(mouth);

        scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN:
                    switch (kbInfo.event.key) {
                        case "a":
                            this.lightSpeed.x = -5;
                            break;
                        case "d":
                            this.lightSpeed.x = 5;
                            break;
                        case "r":
                            this.lightSpeed.y = 5;
                            break;
                        case "f":
                            this.lightSpeed.y = -5;
                            break;
                        case "w":
                            this.lightSpeed.z = -5;
                            break;
                        case "s":
                            this.lightSpeed.z = 5;
                            break;
                        default:
                            break;
                    }
                    console.log("KEY DOWN: ", kbInfo.event.key);
                    break;
                case KeyboardEventTypes.KEYUP:
                    switch (kbInfo.event.key) {
                        case "a":
                            this.lightSpeed.x = 0;
                            break;
                        case "d":
                            this.lightSpeed.x = 0;
                            break;
                        case "r":
                            this.lightSpeed.y = 0;
                            break;
                        case "f":
                            this.lightSpeed.y = 0;
                            break;
                        case "w":
                            this.lightSpeed.z = 0;
                            break;
                        case "s":
                            this.lightSpeed.z = 0;
                            break;
                        default:
                            break;
                    }
                    console.log("KEY UP: ", kbInfo.event.code);
                    break;
                default:
                    break;
            }
        });

        // Animation function - called before each frame gets rendered
        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)

            //console.log(this.lightSpeed);
            current_scene.lights[this.active_light].position.x += this.lightSpeed.x * scene.getAnimationRatio() / 60.0;
            current_scene.lights[this.active_light].position.y += this.lightSpeed.y * scene.getAnimationRatio() / 60.0;
            current_scene.lights[this.active_light].position.z += this.lightSpeed.z * scene.getAnimationRatio() / 60.0;

            // ...
            //console.log(current_scene.models[0].position);
            // update uniforms in shader programs
            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });
    }

    updateShaderUniforms(scene_idx, shader) {
        let current_scene = this.scenes[scene_idx];
        shader.setVector3('camera_position', current_scene.camera.position);
        shader.setColor3('ambient', current_scene.scene.ambientColor);
        shader.setInt('num_lights', current_scene.lights.length);
        let light_positions = [];
        let light_colors = [];
        current_scene.lights.forEach((light) => {
            light_positions.push(light.position.x, light.position.y, light.position.z);
            light_colors.push(light.diffuse);
        });
        shader.setArray3('light_positions', light_positions);
        shader.setColor3Array('light_colors', light_colors);
    }

    getActiveScene() {
        return this.scenes[this.active_scene].scene;
    }

    setActiveScene(idx) {
        this.active_scene = idx;
    }

    setShadingAlgorithm(algorithm) {
        this.shading_alg = algorithm;

        this.scenes.forEach((scene) => {
            let materials = scene.materials;
            let ground_mesh = scene.ground_mesh;

            ground_mesh.material = materials['ground_' + this.shading_alg];
            scene.models.forEach((model) => {
                model.material = materials['illum_' + this.shading_alg];
            });
        });
    }

    setHeightScale(scale) {
        this.scenes.forEach((scene) => {
            let ground_mesh = scene.ground_mesh;
            ground_mesh.metadata.height_scalar = scale;
        });
    }

    setActiveLight(idx) {
        console.log(idx);
        this.active_light = idx;
    }
}

export { Renderer }
