import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import TextSprite from "@seregpie/three.text-sprite";
import Game from "./generals-utils/Game";
import { MapTile } from "./generals-utils/types";
import SceneTemplate from "./ThreeReactUtils/SceneTemplate";

class BoardScene extends SceneTemplate {
    game: Game;
    colors: number[][];
    controls: OrbitControls;

    playerMaterials: THREE.Material[];
    playerMutedMaterials: THREE.Material[];
    neutralMaterial: THREE.Material;
    neutralCityMaterial: THREE.Material;
    neutralMutedMaterial: THREE.Material;

    onesCubes: THREE.Mesh[];
    hundredsCubes: THREE.Mesh[];
    armyCounts: TextSprite[];

    tiles: THREE.Mesh[];
    mountains: THREE.Mesh[];
    swamps: THREE.Mesh[];
    cities: THREE.Mesh[];
    generals: THREE.Mesh[];

    setTurn = -1;


    private loadObj = (address: string): Promise<THREE.BufferGeometry> => {
        return new Promise((resolve, reject) => {
            const loader = new OBJLoader();
            loader.load(
                address,
                obj => {
                    obj.traverse(function (child) {
                        if (child instanceof THREE.Mesh) {
                            resolve(child.geometry);
                        }
                    });
                },
                null,
                error => {
                    reject(error);
                }
            );
        });
    };

    public attach = (container: HTMLElement) => {
        super.attach(container);
    };
    public setup = async () => {
        if (!this.game) throw new Error("Game is not set!");

        const cityGeo = await this.loadObj("obj/city.obj");
        const generalGeo = await this.loadObj("obj/general.obj");
        const mountainGeo = await this.loadObj("obj/mountain.obj");
        const swampGeo = await this.loadObj("obj/swamp.obj");

        this.scene.background = new THREE.Color("#222");

        this.camera.position.x = -10.21;
        this.camera.position.y = 13.04;
        this.camera.position.z = 9.98;

        this.playerMaterials = [];
        this.playerMutedMaterials = [];
        for (let i = 0; i < this.game.sockets.length; i++) {
            const color = this.colors[i];
            const hue = color[0];
            const sat = color[1];
            const bri = color[2];
            const moreBri = 100 - Math.round((100 - bri) * 0.5);
            //const hue = Math.round((i / this.game.sockets.length) * 360);
            this.playerMaterials.push(
                new THREE.MeshPhongMaterial({ color: `hsl(${hue}, ${sat}%, ${bri}%)` })
            );
            this.playerMaterials.slice(-1)[0].side = THREE.DoubleSide;
            this.playerMutedMaterials.push(
                new THREE.MeshPhongMaterial({
                    color: `hsl(${hue}, ${Math.round(sat * 0.5)}%, ${moreBri}%)`,
                })
            );
        }

        const cubeGeo = new THREE.BoxGeometry(1, 1);

        this.neutralMaterial = new THREE.MeshPhongMaterial({ color: "#666666" });
        this.neutralCityMaterial = new THREE.MeshPhongMaterial({ color: "#111" });
        this.neutralMutedMaterial = new THREE.MeshPhongMaterial({ color: "#CCCCCC" });
        this.neutralMutedMaterial.side = THREE.DoubleSide;
        this.neutralMaterial.side = THREE.DoubleSide;

        const mountainMaterial = new THREE.MeshPhongMaterial({ color: "#666666" });

        const groundGeo = new THREE.PlaneGeometry(0.98, 0.98);

        const cityMaterial = new THREE.MeshPhongMaterial({ color: "#666666" });
        cityMaterial.side = THREE.DoubleSide;

        const generalMaterial = new THREE.MeshPhongMaterial({ color: "#666666" });
        generalMaterial.side = THREE.DoubleSide;

        this.onesCubes = [];
        this.hundredsCubes = [];
        this.tiles = [];
        this.generals = [];
        this.cities = [];
        this.armyCounts = [];
        this.mountains = [];
        this.swamps = [];
        this.cities = [];
        this.generals = [];
        for (let y = 0; y < this.game.map.height; y++) {
            for (let x = 0; x < this.game.map.width; x++) {
                const i = y * this.game.map.width + x;

                //determine tile type
                const isCity = this.game.cities.includes(i);
                const isGeneral = this.game.generals.includes(i);
                const isMountain = this.game.map._map[i] === MapTile.MOUNTAIN;
                const isSwamp = this.game.map._map[i] === MapTile.SWAMP;

                //get position for all meshes for this tile
                const offsetX = -x + this.game.map.width * 0.5;
                const offsetY = -y + this.game.map.height * 0.5;

                //add tiles
                const plane = new THREE.Mesh(groundGeo, this.neutralMutedMaterial);
                plane.position.set(offsetX, -0.005, offsetY);
                plane.rotateX(Math.PI * -0.5);
                plane.receiveShadow = true;
                this.scene.add(plane);
                this.tiles.push(plane);

                //add mountains
                const mountain = new THREE.Mesh(mountainGeo, mountainMaterial);
                mountain.position.set(offsetX, 0, offsetY);
                mountain.rotateY(Math.PI * 0.5 * Math.floor(Math.random() * 4));
                mountain.scale.setY(Math.random() * 0.5 + 0.75);
                mountain.castShadow = true;
                mountain.receiveShadow = true;
                mountain.visible = isMountain;
                this.mountains.push(mountain);
                this.scene.add(mountain);

                //add swamps
                const swamp = new THREE.Mesh(swampGeo, mountainMaterial);
                swamp.position.set(offsetX, 0, offsetY);
                swamp.rotateY(Math.PI * 0.5 * Math.floor(Math.random() * 4));
                swamp.castShadow = true;
                swamp.receiveShadow = true;
                swamp.visible = isSwamp;
                this.swamps.push(swamp);
                this.scene.add(swamp);

                //add cities
                const city = new THREE.Mesh(cityGeo, this.getCityMaterial(i));
                city.position.set(offsetX, 0, offsetY);
                city.castShadow = true;
                city.receiveShadow = true;
                city.visible = isCity;
                this.scene.add(city);
                this.cities.push(city);

                //add generals
                const general = new THREE.Mesh(generalGeo, this.getMaterial(i));
                general.position.set(offsetX, 0, offsetY);
                general.castShadow = true;
                general.receiveShadow = true;
                general.visible = isGeneral;
                this.scene.add(general);
                this.generals.push(general);

                //add text sprites
                const textSprite = new TextSprite({
                    alignment: "center",
                    color: "#FFF",
                    fontFamily: "sans-serif",
                    fontSize: 0.3,
                    text: "0",
                });
                textSprite.position.set(offsetX, 0.25, offsetY);
                this.armyCounts.push(textSprite);
                this.scene.add(textSprite);

                //add army count visualizations
                const oneCube = new THREE.Mesh(cubeGeo, this.neutralMaterial);
                this.scene.add(oneCube);
                oneCube.position.set(offsetX, 0.05, offsetY);
                oneCube.scale.set(0, 0, 0);
                this.onesCubes.push(oneCube);

                const hundredCube = new THREE.Mesh(cubeGeo, this.neutralMaterial);
                this.scene.add(hundredCube);
                hundredCube.position.set(offsetX, 0.05, offsetY);
                hundredCube.scale.set(0, 0, 0);
                this.hundredsCubes.push(hundredCube);
            }
        }

        //setup lighting
        const ambient = new THREE.AmbientLight(0xa0a0a0);
        this.scene.add(ambient);
        const light = new THREE.DirectionalLight(0xffffff, 0.8);
        this.scene.add(light);
        light.position.set(20, 15, 20);

        //setup shadows
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        light.castShadow = true;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;

        const d = 15;
        light.shadow.camera.left = -d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = -d;

        light.shadow.camera.far = 100;
        light.shadow.bias = -0.00075;
        light.shadow.radius = 0;

        //setup orbit controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 2;

        //finishing up
        this.renderer.domElement.addEventListener("click", this.disableAutoRotate);
        this.isSetup = true;
    };

    private disableAutoRotate = () => {
        this.controls.autoRotate = false;
    };

    private getMaterial = (mapIndex: number) => {
        return this.game.map._map[mapIndex] < 0
            ? this.neutralMaterial
            : this.playerMaterials[this.game.map._map[mapIndex]];
    };

    private getMutedMaterial = (mapIndex: number) => {
        return this.game.map._map[mapIndex] < 0
            ? this.neutralMutedMaterial
            : this.playerMutedMaterials[this.game.map._map[mapIndex]];
    };

    private getCityMaterial = (mapIndex: number) => {
        return this.game.map._map[mapIndex] < 0
            ? this.neutralCityMaterial
            : this.playerMaterials[this.game.map._map[mapIndex]];
    };

    public update = () => {
        if (!this.isSetup) return;

        if (this.controls) {
            this.controls.update();
        }

        if (this.setTurn === this.game.turn) return;
        this.setTurn = this.game.turn;

        for (let y = 0; y < this.game.map.height; y++) {
            for (let x = 0; x < this.game.map.width; x++) {
                const i = y * this.game.map.width + x;

                //update tile color
                this.tiles[i].material = this.getMutedMaterial(i);

                //update city or general
                const isCity = this.game.cities.includes(i);
                const isGeneral = this.game.generals.includes(i);
                if(isCity || isGeneral) {
                    const material = this.getCityMaterial(i);
                    if(isCity) {
                        this.cities[i].visible = true;
                        this.generals[i].visible = false;
                        this.cities[i].material = material;
                    } else {
                        this.cities[i].visible = false;
                        this.generals[i].visible = true;
                        this.generals[i].material = material;
                    }
                }

                //update army size visualization
                const armySize = this.game.map._armies[i];
                if (armySize === 0) {
                    this.onesCubes[i].scale.set(0, 0, 0);
                    this.hundredsCubes[i].scale.set(0, 0, 0);
                    this.armyCounts[i].visible = false;
                } else {
                    let textHeight = 0;
                    if (armySize < 10) {
                        this.hundredsCubes[i].scale.set(0, 0, 0);

                        const size = (0.95 * armySize) / 10;
                        this.onesCubes[i].scale.set(size, 0.1, size);
                        this.onesCubes[i].position.setY(0.05);
                        this.onesCubes[i].material = this.getMaterial(i);

                        textHeight = 0.25;
                    } else {
                        const hundredCount = Math.floor(armySize / 10);
                        this.hundredsCubes[i].scale.set(0.95, 0.1 * hundredCount, 0.95);
                        this.hundredsCubes[i].position.setY(0.05 * hundredCount);
                        this.hundredsCubes[i].material = this.getMaterial(i);

                        const onesCount = armySize % 10;
                        const size = (0.95 * onesCount) / 10;
                        this.onesCubes[i].scale.set(size, 0.1, size);
                        this.onesCubes[i].position.setY(0.05 + 0.1 * hundredCount);
                        this.onesCubes[i].material = this.getMaterial(i);

                        textHeight = 0.05 + 0.1 * hundredCount + 0.25;
                    }

                    //dynamic threshold to render text
                    if (armySize > 20 || isCity || isGeneral) {
                        this.armyCounts[i].visible = true;
                        this.armyCounts[i].fontSize = 0.25 + 0.5 * Math.min(1, armySize / 100);
                        this.armyCounts[i].text = String(armySize);
                        this.armyCounts[i].position.setY(textHeight);
                    } else if (
                        this.armyCounts[i].visible &&
                        armySize < 20 &&
                        !(isCity || isGeneral)
                    ) {
                        this.armyCounts[i].visible = false;
                    }
                }
            }
        }
    };
}

export default BoardScene;
