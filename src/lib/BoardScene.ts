import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import TextSprite from '@seregpie/three.text-sprite';
import Game from "./generals-utils/Game";
import { MapTile } from "./generals-utils/types";
import SceneTemplate from "./ThreeReactUtils/SceneTemplate";

class BoardScene extends SceneTemplate {
    game: Game;
    colors: number[][];
    controls: OrbitControls;
    onesCubes: THREE.Mesh[];
    hundredsCubes: THREE.Mesh[];
    tiles: THREE.Mesh[];
    generals: {
        mesh: THREE.Mesh;
        position: number;
    }[];
    cities: {
        mesh: THREE.Mesh;
        position: number;
    }[];
    playerMaterials: THREE.Material[];
    playerMutedMaterials: THREE.Material[];
    neutralMaterial: THREE.Material;
    neutralCityMaterial: THREE.Material;
    neutralMutedMaterial: THREE.Material;
    generalGeo: THREE.TorusGeometry;
    cityGeo: THREE.TorusGeometry;
    armyCounts: TextSprite[];
    setTurn = -1;

    public attach = (container: HTMLElement) => {
        super.attach(container);
    };
    public setup = () => {
        if (!this.game) throw new Error("Game is not set!");

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
                new THREE.MeshPhongMaterial({ color: `hsl(${hue}, ${Math.round(sat * 0.5)}%, ${moreBri}%)` })
            );
        }

        const cubeGeo = new THREE.BoxGeometry(1, 1);

        this.neutralMaterial = new THREE.MeshPhongMaterial({ color: "#666666" });
        this.neutralCityMaterial = new THREE.MeshPhongMaterial({ color: "#111" });
        this.neutralMutedMaterial = new THREE.MeshPhongMaterial({ color: "#CCCCCC" });
        this.neutralMaterial.side = THREE.DoubleSide;

        const mountainGeo = new THREE.CylinderGeometry(0.2, 0.707, 1, 4);
        const mountainMaterial = new THREE.MeshPhongMaterial({ color: "#666666" });

        const groundGeo = new THREE.PlaneGeometry(0.98, 0.98);

        const cityRadius = 0.5;

        this.cityGeo = new THREE.TorusGeometry(cityRadius * 1.4, 0.1, 4, 4);
        const cityMaterial = new THREE.MeshPhongMaterial({ color: "#666666" });
        cityMaterial.side = THREE.DoubleSide;

        this.generalGeo = new THREE.TorusGeometry(cityRadius * 1.4, 0.2, 8, 16);
        const generalMaterial = new THREE.MeshPhongMaterial({ color: "#666666" });
        generalMaterial.side = THREE.DoubleSide;

        this.onesCubes = [];
        this.hundredsCubes = [];
        this.tiles = [];
        this.generals = [];
        this.cities = [];
        this.armyCounts = [];
        for (let y = 0; y < this.game.map.height; y++) {
            for (let x = 0; x < this.game.map.width; x++) {
                const i = y * this.game.map.width + x;

                const offsetX = -x + this.game.map.width * 0.5;
                const offsetY = -y + this.game.map.height * 0.5;

                const textSprite = new TextSprite({
                    alignment: "center",
                    color: "#FFF",
                    fontFamily: "sans-serif",
                    fontSize: 0.3,
                    text: "0"
                });
                textSprite.position.set(offsetX, 0.25, offsetY);
                this.armyCounts.push(textSprite);
                this.scene.add(textSprite);

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

                const isCity = this.game.cities.includes(i);
                const isGeneral = this.game.generals.includes(i);
                const isMountain = this.game.map._map[i] === MapTile.MOUNTAIN;

                const plane = new THREE.Mesh(groundGeo, this.neutralMutedMaterial);
                plane.position.set(offsetX, 0, offsetY);
                plane.rotateX(Math.PI * -0.5);
                plane.receiveShadow = true;
                this.scene.add(plane);
                this.tiles.push(plane);

                if (isMountain) {
                    const cone = new THREE.Mesh(mountainGeo, mountainMaterial);
                    cone.position.set(offsetX, 0.5, offsetY);
                    cone.rotateY(Math.PI * 0.25);
                    cone.castShadow = true;
                    cone.receiveShadow = true;
                    this.scene.add(cone);
                } else {
                    if (isCity) {
                        const cylinder = new THREE.Mesh(this.cityGeo, this.getCityMaterial(i));
                        cylinder.position.set(offsetX, 0.05, offsetY);
                        cylinder.rotateX(Math.PI * 0.5);
                        cylinder.rotateZ(Math.PI * 0.25);
                        cylinder.castShadow = true;
                        cylinder.receiveShadow = true;
                        this.scene.add(cylinder);
                        this.cities.push({
                            mesh: cylinder,
                            position: i,
                        });
                    } else if (isGeneral) {
                        const cylinder = new THREE.Mesh(this.generalGeo, this.getMaterial(i));
                        cylinder.position.set(offsetX, 0.125, offsetY);
                        cylinder.rotateX(Math.PI * 0.5);
                        cylinder.castShadow = true;
                        cylinder.receiveShadow = true;
                        this.scene.add(cylinder);
                        this.generals.push({
                            mesh: cylinder,
                            position: i,
                        });
                    }
                }
            }
        }

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        const light = new THREE.DirectionalLight(0xffffff, 0.8);
        light.position.set(20, 15, 20);
        light.castShadow = true;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        const d = 15;

        light.shadow.camera.left = -d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = -d;

        //light.shadow.camera.near = 0.01;
        light.shadow.camera.far = 100;

        const ambient = new THREE.AmbientLight(0xa0a0a0);
        this.scene.add(light);
        this.scene.add(ambient);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 2;

        this.renderer.domElement.addEventListener("click", this.disableAutoRotate);
    };

    private disableAutoRotate = () => {
        this.controls.autoRotate = false;
    }

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
        //console.log(this.game);

        for (let i = 0; i < this.generals.length; i++) {
            if (!this.game.generals.includes(this.generals[i].position)) {
                this.generals[i].mesh.geometry = this.cityGeo;
                this.generals[i].mesh.rotateZ(Math.PI * 0.25);
                this.cities.push(this.generals[i]);
            }
        }
        this.generals = this.generals.filter(g => g.mesh.geometry !== this.cityGeo);

        for (let i = 0; i < this.cities.length; i++) {
            this.cities[i].mesh.material = this.getCityMaterial(this.cities[i].position);
        }

        for (let y = 0; y < this.game.map.height; y++) {
            for (let x = 0; x < this.game.map.width; x++) {
                const i = y * this.game.map.width + x;

                this.tiles[i].material = this.getMutedMaterial(i);

                const armySize = this.game.map._armies[i];
                const isCity = this.game.cities.includes(i);
                const isGeneral = this.game.generals.includes(i);

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
                    if(armySize > 20 || isCity || isGeneral) {
                        this.armyCounts[i].visible = true;
                        this.armyCounts[i].fontSize = 0.25 + 0.5 * Math.min(1, armySize / 100);
                        this.armyCounts[i].text = String(armySize);
                        this.armyCounts[i].position.setY(textHeight);
                    } else if(this.armyCounts[i].visible && armySize < 20 && !(isCity || isGeneral)) {
                        this.armyCounts[i].visible = false;
                    }
                }

                
            }
        }
    };
}

export default BoardScene;
