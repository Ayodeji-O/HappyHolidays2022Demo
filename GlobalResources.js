// GlobalResources.js - Contains resources that are accessible
//                      from all areas of the demo
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -ResourceLoader.js
//  -WebGlUtility.js

function globalResources() {}

globalResources.keyLevel1 = "SnowDuneBunnyLevel1";
globalResources.keyLevel2 = "SnowDuneBunnyLevel2";
globalResources.keyLevel3 = "SnowDuneBunnyLevel3";
globalResources.keyLevel4 = "SnowDuneBunnyLevel4";
globalResources.keyLevel5 = "SnowDuneBunnyLevel5";
globalResources.introImageUri = "images/HappyHolidays2022Intro.jpg";

// Shader Resource Keys
globalResources.keyFragmentShaderGouraud = "fragmentShaderGouraud";
globalResources.keyFragmentShaderPointLightGouraud = "fragmentShaderPointLightGouraud";
globalResources.keyFragmentShaderSnowPointLightGouraud = "fragmentShaderSnowPointLightGouraud";
globalResources.keyFragmentShaderSnowPointLightGouraudFade = "fragmentShaderSnowPointLightGouraudFade";
globalResources.keyFragmentShaderGouraudTexture = "fragmentShaderGouraudTexture";
globalResources.keyFragmentShaderBackdrop = "fragmentShaderBackdrop";
globalResources.keyFragmentShaderSkyBackdrop = "fragmentShaderSkyBackdrop";
globalResources.keyFragmentShaderStandardTexture = "fragmentShaderStandardTexture";
globalResources.keyFragmentShaderStandardTextureOpacity = "fragmentShaderStandardTextureOpacity"
globalResources.keyFragmentShaderBlackFader = "fragmentShaderBlackFader";
globalResources.keyFragmentShaderSpiralBlurConverge = "fragmentShaderSpiralBlurConverge";
globalResources.keyVertexShaderSkyBackdrop = "vertexShaderSkybackdrop"
globalResources.keyVertexShaderStandardPosition = "vertexShaderStandardPosition";
globalResources.keyVertexShaderBezierSurfaceTerrain = "vertexShaderBezierSurfaceTerrain";

globalResources.audioBackgroundMusicKey = "audioBackgroundMusic";

globalResources.keyModelRabbitProtagonist = "modelRabbitProtagonist";
globalResources.keyModelSnowTube = "modelSnowTube";
globalResources.keyModelSmoothRock1 = "modelSmoothRock1";
globalResources.keyModelSmoothRock2 = "modelSmoothRock2";
globalResources.keyModelSmoothRock3 = "modelSmoothRock3";
globalResources.keyModelRockPile = "modelRockPile";
globalResources.keyModelWinterTree = "modelWinterTree";
globalResources.keyModelEnemyCoronaVirusMonster = "modelCoronavirusMonster";
globalResources.keyModelEnemyGrinch = "modelGrinch";
globalResources.keyModelEnemyEvilChristmasTree = "modelEvilChristmasTree";
globalResources.keyModelPlacemarkerFlag = "modelPlacemarkerFlag";

/**
 * Initializes the global resources, loading
 *  any resources that require pre-loading
 * @param completionFuction {function} Completion function executed
 *                                     upon completion of all global
 *                                     resource loading
 */
globalResources.initialize = function(completionFunction) {
	// Create a key / value store of resources that will be 
	// used by the demo - these resources will be explicitly loaded
	// and processed directly (images can be loaded / processed by
	// the framework, and therefore should not be referenced in
	// this section).
	this.resourceSourceKeyValueStore = {};
	
	// Texture resources
	this.resourceSourceKeyValueStore[globalResources.keyTextureHourglass] = "textures/HourglassTexture.png";	
	
	// Shader resources
	this.resourceSourceKeyValueStore[globalResources.keyFragmentShaderGouraud] = "shaders/FragmentShaderGouraud.shader";
	this.resourceSourceKeyValueStore[globalResources.keyFragmentShaderPointLightGouraud] = "shaders/FragmentShaderPointLightGouraud.shader"
	this.resourceSourceKeyValueStore[globalResources.keyFragmentShaderSnowPointLightGouraudFade] = "shaders/FragmentShaderPointLightGouraudFade.shader"
	this.resourceSourceKeyValueStore[globalResources.keyFragmentShaderSnowPointLightGouraud] = "shaders/FragmentShaderSnowPointLightGouraud.shader"
	this.resourceSourceKeyValueStore[globalResources.keyFragmentShaderGouraudTexture] = "shaders/FragmentShaderGouraudTexture.shader"
	this.resourceSourceKeyValueStore[globalResources.keyFragmentShaderBackdrop] = "shaders/FragmentShaderBackdrop.shader"
	this.resourceSourceKeyValueStore[globalResources.keyFragmentShaderSkyBackdrop] = "shaders/FragmentShaderSkyBackdrop.shader"
	this.resourceSourceKeyValueStore[globalResources.keyFragmentShaderStandardTexture] = "shaders/FragmentShaderStandardTexture.shader";
	this.resourceSourceKeyValueStore[globalResources.keyFragmentShaderStandardTextureOpacity] = "shaders/FragmentShaderStandardTextureOpacity.shader";	
	this.resourceSourceKeyValueStore[globalResources.keyFragmentShaderBlackFader] = "shaders/FragmentShaderBlackFader.shader"
	this.resourceSourceKeyValueStore[globalResources.keyFragmentShaderSpiralBlurConverge] = "shaders/FragmentShaderSpiralBlurConverge.shader";
	this.resourceSourceKeyValueStore[globalResources.keyVertexShaderSkyBackdrop] = "shaders/VertexShaderSkyBackdrop.shader"
	this.resourceSourceKeyValueStore[globalResources.keyVertexShaderStandardPosition] = "shaders/VertexShaderStandardPosition.shader";
	this.resourceSourceKeyValueStore[globalResources.keyVertexShaderBezierSurfaceTerrain] = "shaders/VertexShaderBezierSurfaceTerrain.shader";
	
	// Audio resources
	this.resourceSourceKeyValueStore[globalResources.audioBackgroundMusicKey] = "audio/Punk Peanuts.mp3";

	// Level resources
	this.resourceSourceKeyValueStore[globalResources.keyLevel1] = "levels/SnowDuneBunnyLevel1.ssls";
	this.resourceSourceKeyValueStore[globalResources.keyLevel2] = "levels/SnowDuneBunnyLevel2.ssls";
	this.resourceSourceKeyValueStore[globalResources.keyLevel3] = "levels/SnowDuneBunnyLevel3.ssls";
	this.resourceSourceKeyValueStore[globalResources.keyLevel4] = "levels/SnowDuneBunnyLevel4.ssls";
	this.resourceSourceKeyValueStore[globalResources.keyLevel5] = "levels/SnowDuneBunnyLevel5.ssls";

	// Model resources
	this.resourceSourceKeyValueStore[globalResources.keyModelRabbitProtagonist] = "models/Rabbit.obj";
	this.resourceSourceKeyValueStore[globalResources.keyModelSnowTube] = "models/LifePreserver.obj";
	this.resourceSourceKeyValueStore[globalResources.keyModelSmoothRock1] = "models/Smooth_Rock_1.obj";
	this.resourceSourceKeyValueStore[globalResources.keyModelSmoothRock2] = "models/Smooth_Rock_2.obj";
	this.resourceSourceKeyValueStore[globalResources.keyModelSmoothRock3] = "models/Smooth_Rock_3.obj";
	this.resourceSourceKeyValueStore[globalResources.keyModelRockPile] = "models/Rock_Pile.obj";
	this.resourceSourceKeyValueStore[globalResources.keyModelWinterTree] = "models/Winter_Tree.obj";
	this.resourceSourceKeyValueStore[globalResources.keyModelEnemyCoronaVirusMonster] = "models/Coronavirus_Monster.obj";
	this.resourceSourceKeyValueStore[globalResources.keyModelEnemyGrinch] = "models/Grinch.obj";
	this.resourceSourceKeyValueStore[globalResources.keyModelEnemyEvilChristmasTree] = "models/Evil_Christmas_Tree.obj";
	this.resourceSourceKeyValueStore[globalResources.keyModelPlacemarkerFlag] = "models/Placemarker_Flag.obj";

	this.resourceBinaryStateKeyValueStore = {};
	this.resourceBinaryStateKeyValueStore[globalResources.keyLevel1] = true;
	this.resourceBinaryStateKeyValueStore[globalResources.keyLevel2] = true;
	this.resourceBinaryStateKeyValueStore[globalResources.keyLevel3] = true;
	this.resourceBinaryStateKeyValueStore[globalResources.keyLevel4] = true;
	this.resourceBinaryStateKeyValueStore[globalResources.keyLevel5] = true;	
	
	this.resourceBinaryStateKeyValueStore[globalResources.audioBackgroundMusicKey] = true;
		
	this.audioDataSourceKeys = [globalResources.audioBackgroundMusicKey];
	
	this.textureSourceKeys = [
		globalResources.keyTextureHourglass
	];

	this.textureKeyValueStore = {};
	this.textureSizeKeyValueStore = {};

	this.decodedAudioDataKeyValueStore = {};
	this.processedAudioDataSourceCount = 0;

	function mainResourceLoadCompletionFunction () {
		globalResources.loadTextureResources(globalResources.internalImageLoadProgressFunction, completionFunction,
			globalResources.getMainCanvasContext());
	}
	
	this.loadResources(mainResourceLoadCompletionFunction);	
}

/**
 * Initiates the resource loading process
 *
 * @param completionFunction A function that will be invoked
 *                           after all resource load attempts have
 *                           been completed (regardless of success
 *                           or failure)
 */
globalResources.loadResources = function(completionFunction) {
	var resourceLoader = new ResourceLoader();
	
	// The progress function will be invoked after each resource has been
	// loaded (function will receive a fractional progress indicator).
	if (Utility.validateVar(globalResources.internalResourceLoadProgressFunction)) {
		resourceLoader.setProgressFunction(globalResources.internalResourceLoadProgressFunction);
	}
	
	for (var currentResourceKey in this.resourceSourceKeyValueStore) {
		// Images/textures are loaded/decoded by a separate routine.
		if (!this.textureSourceKeys.includes(currentResourceKey)) {		
			var resourceIsBinaryData = (Utility.validateVar(globalResources.resourceBinaryStateKeyValueStore[currentResourceKey]) && 
				(globalResources.resourceBinaryStateKeyValueStore[currentResourceKey] === true));
			
			resourceLoader.addResourceSourceUri(currentResourceKey, this.resourceSourceKeyValueStore[currentResourceKey],
				resourceIsBinaryData);
		}
	}	

	var resourceLoadCompletionFunction = completionFunction;
	var resourceLoadCompletionHandler = function (loadedResourceKeyValueStore) {
		globalResources.onResourceLoadCompletion(loadedResourceKeyValueStore);
		
		// !!!!Remove this function call instance when image loading is configured...
		resourceLoadCompletionFunction();

		function imageCompletionFunction() {
			// Decode any audio data as required (e.g. background music).
			resourceLoadCompletionFunction();
		}
		
		// image.onload = ....
		// image.src = ...
	}
	
	resourceLoader.initiateResourceLoading(resourceLoadCompletionHandler);
}

globalResources.loadTextureResources = function(progressFunction, completionFunction, webGlCanvasContext) {
	
	var totalImageCount = this.textureSourceKeys.length;
	var loadedImageCount = 0;
	
	if (this.textureSourceKeys.length > 0) {
		for (var currentTextureSourceKey of this.textureSourceKeys) {		
			var currentImage = new Image();
			currentImage.src = this.resourceSourceKeyValueStore[currentTextureSourceKey];		
			
			var makeOnLoadFunction = function(textureSourceKey) {
				var onLoadFunction = function () {			
					var imageTexture = WebGlUtility.createTextureFromImage(webGlCanvasContext, this, false);
					globalResources.textureKeyValueStore[textureSourceKey] = imageTexture;
					globalResources.textureSizeKeyValueStore[textureSourceKey] = [ this.width, this.height ];
					
					loadedImageCount++;
					if (typeof progressFunction === "function") {
						progressFunction(loadedImageCount / totalImageCount);
					}
					
					if ((loadedImageCount === totalImageCount) &&
						(typeof completionFunction === "function")) {
							
						completionFunction();				
					}
				};
				
				return onLoadFunction;			
			};
			
			currentImage.onload = makeOnLoadFunction(currentTextureSourceKey);
		}
	}
	else if (typeof completionFunction === "function") {
		completionFunction();
	}
}

/**
 * Sets the function that will receive progress
 *  events
 *
 * @param {function} A function that will receive a single,
 *                   number parameter between 0.0 - 1.0, inclusive,
 *                   representing the load progress.
 *
 */
globalResources.setLoadProgressFunction = function (progressFunction) {
	if (Utility.validateVar(progressFunction)) {		
		this.progressFunction = progressFunction;
	}
}

/**
 * Retrieves loaded resource data using a key in order
 *  to reference data within the internal key/value store
 * @param loadedResourceDataKey {String} Key into the key-value
 *                                       store containing loaded
 *                                       data
 *
 * @return {LoadedResourceData} Data associated with a loaded resource
 */
globalResources.getLoadedResourceDataByKey = function(loadedResourceDataKey) {
	return this.loadedResourceKeyValueStore[loadedResourceDataKey];
}

/**
 * Handler invoked after loading has been attempted/completed for
 *  all resources
 * 
 * @param loadedResourceKeyValueStore {Object} A key/value store containing all
 *                                             loaded resources
 */
globalResources.onResourceLoadCompletion = function (loadedResourceKeyValueStore) {
	this.loadedResourceKeyValueStore = loadedResourceKeyValueStore;
}


globalResources.internalResourceLoadProgressFunction = function (progressFraction) {
	if (typeof globalResources.progressFunction === "function") {		
		var totalProgressFraction = progressFraction *
			(Object.keys(globalResources.resourceSourceKeyValueStore).length /
			(globalResources.textureSourceKeys.length + Object.keys(globalResources.resourceSourceKeyValueStore).length));
		globalResources.progressFunction(totalProgressFraction);
	}
}

globalResources.internalImageLoadProgressFunction = function (progressFraction) {
	if (typeof globalResources.progressFunction === "function") {
		
		var baseProgressFraction =
			(Object.keys(globalResources.resourceSourceKeyValueStore).length /
			(globalResources.textureSourceKeys.length + Object.keys(globalResources.resourceSourceKeyValueStore).length));
		var totalProgressFraction = (1.0 - baseProgressFraction) * progressFraction + baseProgressFraction;
		globalResources.progressFunction(totalProgressFraction);		
	}	
}

/**
 * Decodes all loaded audio data
 *
 * @param completionFunction {Function} Completion function invoked after all
 *                                      audio data has been decoded
 */
globalResources.decodeAllAudioData = function(completionFunction) {

	for (var currentAudioDataKeyIndex = 0; currentAudioDataKeyIndex < this.audioDataSourceKeys.length; currentAudioDataKeyIndex++) {
		
		var decodeTargetAudioDataKeyIndex = currentAudioDataKeyIndex;
		function decodeSuccessCallback(audioBuffer) {
			// Audio has been decoded successfully - store the buffer, and
			// invoke the provided completion function if decoding attempts
			// have been performed on all audio buffers.
			globalResources.decodedAudioDataKeyValueStore[globalResources.audioDataSourceKeys[decodeTargetAudioDataKeyIndex]] = audioBuffer;
			
			globalResources.processedAudioDataSourceCount++
			
			if ((globalResources.processedAudioDataSourceCount == globalResources.audioDataSourceKeys.length) &&
				Utility.validateVar(completionFunction)) {
					
				completionFunction();
			}
		}
		
		function decodeErrorCallBack(audioBuffer) {
			this.processedAudioDataSourceCount++			
		}
		
		// Decode the audio data...
		audioContext = globalResources.createAudioContext();
		if (Utility.validateVar(audioContext) && Utility.validateVar(this.loadedResourceKeyValueStore) &&
			Utility.validateVar(this.loadedResourceKeyValueStore[this.audioDataSourceKeys[currentAudioDataKeyIndex]])) {

			var encodedAudioData = this.loadedResourceKeyValueStore[this.audioDataSourceKeys[currentAudioDataKeyIndex]].resourceDataStore;
			audioContext.decodeAudioData(encodedAudioData, decodeSuccessCallback, decodeErrorCallBack);
		}
	}
}

/**
 *  Creates an AudioContext object that will be required
 *   to play the background audio
 *  
 *  @return {AudioContext} AudioContext object required to play
 *                         the background audio
 */
globalResources.createAudioContext = function() {
	var audioContext = null;
	if (typeof(window.AudioContext) !== "undefined") {
		audioContext = new window.AudioContext();
	}
	else {
		// Used by Safari (validated against version 12.x)
		audioContext = new window.webkitAudioContext();
	}
	
	return audioContext;
}

/**
 *  Initiates playback of the background audio - this method must
 *   be invoked from within a click event handler in order for
 *   the audio to be played on all supported browsers (it should not
 *   be invoked an any other handler, even if the request being
 *   handled was invoked from within the click handler)
 */
globalResources.playBackgroundAudio = function() {
	globalResources.audioContext = globalResources.createAudioContext();
	globalResources.audioContext.resume();
	if (globalResources.audioContext !== null) {	
		function initiateBackgroundAudioPlayback() {
			if (Utility.validateVar(globalResources.decodedAudioDataKeyValueStore[globalResources.audioBackgroundMusicKey])) {
				var audioSource = globalResources.audioContext.createBufferSource();
				audioSource.buffer = globalResources.decodedAudioDataKeyValueStore[globalResources.audioBackgroundMusicKey];
				audioSource.connect(globalResources.audioContext.destination);
				audioSource.loop = true;
				audioSource.start(0);
			}
		}
			
		globalResources.decodeAllAudioData(initiateBackgroundAudioPlayback);
	}
}

globalResources.conditionallyRequestAccelerometerPermission = function(completionFunction) {

	if ((typeof(DeviceOrientationEvent) !== "undefined") && typeof(DeviceOrientationEvent.requestPermission) === "function") {
		// Standard method for requesting accelerometer permission under
		// Safari.
		DeviceOrientationEvent.requestPermission().then(response => {
			completionFunction();
		});
	}	
	else if (Utility.validateVar(completionFunction)) {
		completionFunction()
	}
}

globalResources.conditionallyRequestGyroscopePermission = function(completionFunction) {
	if ((typeof(DeviceMotionEvent) !== "undefined") && typeof(DeviceMotionEvent.requestPermission) === "function") {
		// Standard method for requesting gyroscope permission under
		// Safari.
		DeviceMotionEvent.requestPermission().then(response => {
			completionFunction();
		});
	}
	else if (Utility.validateVar(completionFunction)) {
		completionFunction()
	}	
}



/**
 * Retrieves the "main" canvas context used for drawing data
 *  to the browser window
 * @return {CanvasRenderingContext2D / WebGLRenderingContext}
 *			The canvas context used for drawing data to the
 *			browser window
 */
globalResources.getMainCanvasContext = function() {
	return typeof this.mainCanvasContext !== "undefined" ?
		this.mainCanvasContext : null;
}

/**
 * Retrieves the overlay canvas context used for drawing data
 *  to the browser window (gauge)
 * @return {CanvasRenderingContext2D / WebGLRenderingContext}
 *			The canvas context used for drawing to be
 *			superimposed on the main canvas
 */
globalResources.getGaugeOverlayCanvasContext = function() {
	return typeof this.gaugeOverlayCanvasContext !== "undefined" ?
		this.gaugeOverlayCanvasContext : null;
}


/*
 * Retrieves the overlay canvas context used for drawing data
 *  to the browser window (full screen data)
 * @return {CanvasRenderingContext2D / WebGLRenderingContext}
 *			The canvas context used for drawing to be
 *			superimposed on the main canvas
 */
globalResources.getFullScreenOverlayCanvasContext = function() {
	return typeof this.fullScreenOverlayCanvasContext !== "undefined" ?
		this.fullScreenOverlayCanvasContext : null;
}

/**
 * Sets the "main" canvas context used for drawing data to the
 *  browser window
 * @param mainCanvasContext {CanvasRenderingContext2D / WebGLRenderingContext}
 *						    The canvas context the
 *                          will be retrieved for drawing data to the browser
 *                          window
 */
globalResources.setMainCanvasContext = function(mainCanvasContext) {
	this.mainCanvasContext = mainCanvasContext;
}

/**
 * Sets the overlay canvas context used for drawing data that is
 *  to be superimposed on the main canvas (gauge)
 * @param overlayCanvasContext {CanvasRenderingContext2D / WebGLRenderingContext}
 *						       The canvas context that will be retrieved for
 *                             drawing data over the main canvas
 */
globalResources.setGaugeOverlayCanvasContext = function(overlayCanvasContext) {
	this.gaugeOverlayCanvasContext = overlayCanvasContext;
}

/**
 * Sets the overlay texture used for drawing data that is
 *  to be superimposed on the main scene (gauge)
 * @param overlayTexture {WebGLTexture} The texture that is to be used
 *                                      as an overlay texture
 */
globalResources.setGaugeOverlayTexture = function(overlayTexture) {
	this.gaugeOverlayTexture = overlayTexture;
}

/**
 *  Retrieves the overlay texture used for superimposing data
 *   that is to be drawn over the main scene (gauge)
 *  
 *  @return {WebGLTexture} The texture that is to be used
 *                         as the overlay texture
 */
globalResources.getGaugeOverlayTexture = function() {
	return this.gaugeOverlayTexture;


}

/**
 * Sets the overlay canvas context used for drawing data that is
 *  to be superimposed on the main canvas (full screen data)
 * @param overlayCanvasContext {CanvasRenderingContext2D / WebGLRenderingContext}
 *						       The canvas context that will be retrieved for
 *                             drawing data over the main canvas
 */
globalResources.setFullScreenOverlayCanvasContext = function(overlayCanvasContext) {
	this.fullScreenOverlayCanvasContext = overlayCanvasContext;
}
	
/**
 *  Retrieves the overlay texture used for superimposing data
 *   that is to be drawn over the main scene (full screen data)
 */
globalResources.getFullScreenOverlayTexture = function() {
	return this.fullScreenOverlayTexture;
}

/**
 * Sets the overlay texture used for drawing data that is
 *  to be superimposed on the main scene (full screen data)
 * @param overlayTexture {WebGLTexture} The texture that is to be used
 *                                      as an overlay texture
 */
globalResources.setFullScreenOverlayTexture = function(overlayTexture) {
	this.fullScreenOverlayTexture = overlayTexture;
}

/**
 * Retrieves the URI of the intro image
 * @return {String} The URI of the intro image
 */
globalResources.getIntroImageUri = function () {
	return globalResources.introImageUri;
}