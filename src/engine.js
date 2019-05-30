import { GridMaterial } from "@babylonjs/materials";
import Weapon from "./weapon";


export default class Engine{
    constructor(){
        // Scene setup
        this.canvas = document.getElementById("renderCanvas");
        this.engine = new BABYLON.Engine(this.canvas);       
        this.scene = new BABYLON.Scene(this.engine);
        
        
        // Camera setup
        this.camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(0, 2.01, -8), this.scene);        
        this.camera.attachControl(this.canvas, true);
        this.camera.speed = 0.2;       
        this.camera.ellipsoid = new BABYLON.Vector3(1, 1, 1); // Collision box for the camera
        this.camera.checkCollisions = true;
        this.camera.applyGravity = true; 

        // Enable collisions and gravity in scene
        this.scene.collisionsEnabled = true;
        this.scene.gravity = new BABYLON.Vector3(0, -0.05, 0);

        // Entities
        this.player = 0;
}

    assetManager(){
        var camera = this.camera;
        var scene = this.scene;
        var player = this.player;
        // Add lights to the scene
        var light0 = new BABYLON.DirectionalLight("Omni", new BABYLON.Vector3(-2, -5, 2), scene);
        var light1 = new BABYLON.PointLight("Omni", new BABYLON.Vector3(2, -5, -2), scene); 

        // Asset loading
        var assetsManager = new BABYLON.AssetsManager(scene);     
        // Called when a single task has been sucessfull
        assetsManager.onTaskSuccessObservable.add(function(task) {        
            //console.log("task successful", task);            

            // Setting ground material
            var ground = scene.getMeshByName("ground");           
            ground.material = new GridMaterial("groundMaterial", scene);    
            ground.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
            ground.material.backFaceCulling = false;            

            //Setting up the weapon's mesh in the scene
            var gun = scene.getMeshByName("SMDImport");// Pistol                             
            gun.parent = camera;        
            gun.rotation.z =  Math.PI;        
            gun.rotation.y = -Math.PI;        
            gun.scaling = new BABYLON.Vector3( 0.1, 0.1, 0.1);
            gun.position = new BABYLON.Vector3(1, -1, 1);

            // Setting up the weapon's object in the player            
            player.weapon = new Weapon("deagle", gun, gun.rotation);            
            //player.weapon.setAnimations();
        });         
        // Called when all tasks in the assetsManger are done
        assetsManager.onTasksDoneObservable.add(function(tasks) {

            var errors = tasks.filter(function(task) {return task.taskState === BABYLON.AssetTaskState.ERROR;});
            var successes = tasks.filter(function(task) {return task.taskState !== BABYLON.AssetTaskState.ERROR;}); 
            //console.log(tasks);
        });

        // We add single tasks to the assetsManager
        assetsManager.addMeshTask("task", "", "../assets/models/", "test6.babylon");
        assetsManager.addMeshTask("task", "", "../assets/models/", "deagle.obj");

        // Now let the assetsManger load/excecute every task
        assetsManager.load();
    }


    pointerLock(){
        var canvas = this.canvas;
        var scene = this.scene;
        var camera = this.camera;
        var player = this.player;
        var isLocked = false;
    
        scene.onPointerDown = function (evt) {
    
            if (document.pointerLockElement !== canvas) {
                console.log("Was Already locked: ", document.pointerLockElement === canvas);
    
                if (!isLocked) {
                    canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock || false;
                    
                    if (canvas.requestPointerLock) {
                        canvas.requestPointerLock();
                    }
                }
            }
            //continue with shooting requests or whatever :P
            //evt === 0 (left mouse click)
            //evt === 1 (mouse wheel click (not scrolling))
            //evt === 2 (right mouse click)

            if(evt.button == 0){             

                //Play current Weapon's animation
                scene.beginAnimation(player.weapon.mesh, 0, 100, false); 
                
                // Destroy camera's ray target
                let ray = camera.getForwardRay(10000);
                let hit = scene.pickWithRay(ray);
                let model = hit.pickedMesh;             
        
                if(hit !== null && model !== null){
                    console.log("Target Destroyed :" + model.name);
                    scene.getMeshByName(model.name).dispose();       
                }                               
            }            
        };   
        

        // Event listener when the pointerlock is updated (or removed by pressing ESC for example).
        var pointerlockchange = function () {
            var controlEnabled = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement || document.msPointerLockElement || false;
            
            // If the user is already locked
            if (!controlEnabled) {
                camera.detachControl(canvas);                
                isLocked = false;
                
            } else {
                camera.attachControl(canvas);                
                isLocked = true;
                this.active = true;
            }
        };
    
        // Attach events to the document
        document.addEventListener("pointerlockchange", pointerlockchange, false);
        document.addEventListener("mspointerlockchange", pointerlockchange, false);
        document.addEventListener("mozpointerlockchange", pointerlockchange, false);
        document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
    }

    render(){
        // Render every frame
        this.engine.runRenderLoop(() => {
            
            this.scene.render();                        
        });    
    }
}