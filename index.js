var canvas = document.getElementById("renderCanvas"); // Get the canvas element
var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
let camera, spotLight, shadowGenerator, cameraTracker;

var backMeshes = [
	["LowBack", "LowBorder", "LowMesh"],
	["MidBack", "MidBorder", "MidMesh"],
	["HighBack", "HighBorder", "HighMesh"],
];

var armMeshes = [
	[""],
	["FixedArms"],
	["AdjustableArmsTop", "AdjustableArmsBottom"],
];

var meshMeshes = [
	["LowMesh", "LowBorder"],
	["MidMesh", "MidBorder"],
	["HighMesh", "HighBorder"],
];

var metalMeshes = ["ColumnLower", "WheelBase", "SeatBase"];

var plasticMeshes = [
	"Handle",
	"LowBack",
	"MidBack",
	"HighBack",
	"FixedArms",
	"AdjustableArmsBottom",
	"AdjustableArmsTop",
];

var meshMaterials = [
	["Graphite", "Cosm"],
	["Carbon", "Cosm"],
	["Mineral", "Cosm"],
	["Nightfall", "Cosm"],
	["Glacier", "Glacier"],
	["Canyon", "Canyon"],
];

var globalMaterials = ["Cosm", "Nightfall", "Glacier", "Canyon"];

let state = {
	backIndex: 0,
	armIndex: 1,
	meshIndex: 0,
	globalMaterial: 0,
	finishContainer: 0,
};

let materialsByName = {};
let meshesByName = {};

function getMatByName(name) {
	return materialsByName[name];
}

function getMeshByName(name) {
	return meshesByName[name];
}

function updateEnabledMeshes() {
	let backMeshesDisabled = [].concat.apply(
		[],
		backMeshes.filter((_val, ind) => {
			return ind !== state.backIndex;
		})
	);

	let armMeshesDisabled = [].concat.apply(
		[],
		armMeshes.filter((_val, ind) => {
			return ind !== state.armIndex;
		})
	);

	scene.meshes.forEach((mesh) => {
		if (
			backMeshesDisabled.includes(mesh.name) ||
			armMeshesDisabled.includes(mesh.name)
		) {
			mesh.setEnabled(false);
		} else if (
			backMeshes[state.backIndex].includes(mesh.name) ||
			armMeshes[state.armIndex].includes(mesh.name)
		) {
			mesh.setEnabled(true);
		}
	});
}

function updateMaterials() {
	let meshMat = getMatByName(`Mesh${meshMaterials[state.meshIndex][0]}`);
	let borderMat = getMatByName(meshMaterials[state.meshIndex][1]);

	meshMeshes.forEach((meshPair) => {
		var meshMesh = getMeshByName(meshPair[0]);
		meshMesh.material = meshMat;

		var meshBorder = getMeshByName(meshPair[1]);
		meshBorder.material = borderMat;
	});

	let globalMaterial = getMatByName(globalMaterials[state.globalMaterial]);
	let globalMaterialMetal = getMatByName(
		`${globalMaterials[state.globalMaterial]}Metal`
	);

	plasticMeshes.forEach((meshName) => {
		var mesh = getMeshByName(meshName);
		mesh.material = globalMaterial;
	});

	metalMeshes.forEach((meshName) => {
		var mesh = getMeshByName(meshName);
		mesh.material = globalMaterialMetal;
	});
}

function createCallbacks() {
	let suspensionName = document.getElementById("suspension-material-name");
	let suspensionImages = document.getElementById(
		"suspension-material-images"
	);

	for (let index = 0; index < suspensionImages.children.length; index++) {
		const element = suspensionImages.children[index];

		element.addEventListener("click", (e) => {
			let oldElement = suspensionImages.children[state.meshIndex];
			oldElement.classList.remove("image-selected");
			element.classList.add("image-selected");

			suspensionName.innerText = meshMaterials[index][0];

			state.meshIndex = index;
			updateMaterials();
		});
	}

	let backHeightContainer = document.getElementById("back-height");
	for (let index = 1; index < backHeightContainer.children.length; index++) {
		const element = backHeightContainer.children[index];

		element.addEventListener("click", (e) => {
			let oldElement =
				backHeightContainer.children[state.backIndex + 1].children[0];
			oldElement.classList.remove("button-selected");
			element.children[0].classList.add("button-selected");

			state.backIndex = index - 1;
			updateEnabledMeshes();
		});
	}

	let armsContainer = document.getElementById("arms-options");
	for (let index = 1; index < armsContainer.children.length; index++) {
		const element = armsContainer.children[index];

		element.addEventListener("click", (e) => {
			let oldElement =
				armsContainer.children[state.armIndex + 1].children[0];
			oldElement.classList.remove("button-selected");
			element.children[0].classList.add("button-selected");

			state.armIndex = index - 1;
			updateEnabledMeshes();
		});
	}

	let finishContainer = document.getElementById("finish-style");
	for (let index = 1; index < finishContainer.children.length; index++) {
		const element = finishContainer.children[index];

		element.addEventListener("click", (e) => {
			let oldElement =
				finishContainer.children[state.finishContainer + 1].children[0];
			oldElement.classList.remove("button-selected");
			element.children[0].classList.add("button-selected");

			state.finishContainer = index - 1;

			let oldMeshIndex = state.meshIndex;

			if (state.finishContainer == 0) {
				state.meshIndex = 1;
				state.globalMaterial = 0;
			} else if (state.finishContainer == 1) {
				state.meshIndex = 4;
				state.globalMaterial = 2;
			} else if (state.finishContainer == 2) {
				state.meshIndex = 3;
				state.globalMaterial = 1;
			} else if (state.finishContainer == 3) {
				state.meshIndex = 5;
				state.globalMaterial = 3;
			}

			suspensionImages.children[oldMeshIndex].classList.remove(
				"image-selected"
			);
			suspensionImages.children[state.meshIndex].classList.add(
				"image-selected"
			);
			suspensionName.innerText = meshMaterials[state.meshIndex][0];

			updateMaterials();
		});
	}
}

var createScene = function () {
	createCallbacks();

	var scene = new BABYLON.Scene(engine);

	// scene.debugLayer.show();

	var env256 = BABYLON.CubeTexture.CreateFromPrefilteredData(
		"photoStudio.env",
		scene
	);
	env256.name = "photoStudio_256";
	env256.gammaSpace = false;
	scene.environmentTexture = env256;

	scene.createDefaultSkybox(env256, true, 1000);
	// scene.clearColor = new BABYLON.Color3(1, 1, 1);

	camera = new BABYLON.ArcRotateCamera(
		"Camera",
		Math.PI / 2,
		Math.PI / 2,
		2,
		new BABYLON.Vector3(0, 0, 0),
		scene
	);
	camera.attachControl(canvas, true);
	camera.inputs.attached.pointers.buttons = [0];
	camera.lowerRadiusLimit = 1;
	camera.upperRadiusLimit = 4;
	camera.wheelPrecision = 50;

	camera.minZ = 0.001;

	var hemiLight = new BABYLON.HemisphericLight(
		"HemiLight",
		new BABYLON.Vector3(0, 1, 0),
		scene
	);
	hemiLight.diffuse = new BABYLON.Color3.FromHexString("#fffae6");
	hemiLight.specular = new BABYLON.Color3.FromHexString("#ffffff");
	hemiLight.groundColor = new BABYLON.Color3.FromHexString("#484668");
	hemiLight.intensity = 0.5;

	spotLight = new BABYLON.SpotLight(
		"SpotLight",
		new BABYLON.Vector3(-1, 1, 1),
		new BABYLON.Vector3(0.017, -0.019, -0.025),
		1.5708,
		0,
		scene
	);
	spotLight.intensity = 15;
	spotLight.shadowEnabled = true;
	spotLight.shadowMinZ = 0.001;
	spotLight.shadowMaxZ = 10;

	shadowGenerator = new BABYLON.ShadowGenerator(2048, spotLight, true);
	shadowGenerator.bias = 0.001;
	shadowGenerator.normalBias = 0.005;
	shadowGenerator.filter = 2;
	shadowGenerator.transparencyShadow = true;

	loadObjects();

	return scene;
};

function loadObjects() {
	BABYLON.SceneLoader.ImportMesh("", "", "Chair.gltf", scene, function (
		meshes,
		_pS,
		_s
	) {
		meshes.forEach((mesh) => {
			if (mesh.name === "__root__") {
				mesh.position = new BABYLON.Vector3(0, -0.65, 0);
			} else if (mesh.name.includes("MatHolder")) {
				mesh.dispose();
			}

			shadowGenerator.addShadowCaster(mesh);
			mesh.receiveShadows = true;
		});

		scene.materials.forEach((material) => {
			materialsByName[material.name] = material;
		});

		scene.meshes.forEach((mesh) => {
			meshesByName[mesh.name] = mesh;
		});

		updateEnabledMeshes();
		updateMaterials();
	});
}

var scene = createScene();

engine.runRenderLoop(function () {
	scene.render();
});
