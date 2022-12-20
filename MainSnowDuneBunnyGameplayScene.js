// Author: Ayodeji Oshinnaiye
// Dependent upon:


function MainSnowDuneBunnyGameplayScene() {
}

/**
 * Initializes the scene - invoked before scene execution
 * 
 * @param completionFunction {Function} Function to be invoked upon completion
 *                                      of the initialization process
 *
 * @see sceneExecution()
 */
MainSnowDuneBunnyGameplayScene.prototype.initialize = function (completionFunction) {
	this.totalElapsedSceneTimeMs = 0.0;
	
	// Minimum framerate value used internally during
	// time-quantum based evaluations.
	this.constMinEvaluatedFrameRate = 15.0;
	
	// Maximum time quantum that will be used to evaluate
	// time-quantum based operations
	this.maxExpressibleTimeQuantum = (1.0 / this.constMinEvaluatedFrameRate) * Constants.millisecondsPerSecond;	

	// Number of floating point values that comprise a vertex
	this.constVertexSize = 3;
	// Number of floating point values that comprise a vector
	this.constVectorSize = 3;
	// Number of floating point values that comprise a vertex
	// color
	this.constVertexColorSize = 4;
	// Number of floating point values that comprise a texture
	// coordinate
	this.constTextureCoordinateSize = 2;

	// 3D-transformation matrix size - 4 x 4
	this.constTransformationMatrixRowCount = 4;
	this.constTransformationMatrixColumnCount = 4;
	
	this.constModelPivotAxisX = 0,
	this.constModelPivotAxisY = 1,
	this.constModelPivotAxisZ = 2,
	
	// Scaling factor used to appropriately adjust the world scale to the
	// WebGL coordinate system. Each world scale measurement unit is
	// roughly equivalent to 1 meter; the world scale does not change
	// the actual equivalent unit length - it only adjusts the scale
	// used for rendering.
	// 1 meter = x rendering coordinate space units
	this.constWorldScale = 0.23;
	
	// Gravitational acceleration, expressed in meters / millisecond²
	this.constGravitationalAccelerationMetersPerMsSq = 9.8 /
		(Constants.millisecondsPerSecond * Constants.millisecondsPerSecond);	

	// Base size for the rabbit protagonist - the model is loaded
	// at a normalized height of 1.0 render space units. Scale the
	// model to be the appropriate size in relation to the level
	// scale.
	this.constRabbitProtagonistBaseScaleMultiplier = 0.95
	this.constScaleFactorDefaultRabbitProtagonist =
		this.constRabbitProtagonistBaseScaleMultiplier * this.constWorldScale;
		
	// Degree to which acceleration induced by the rabbit protagonist is
	// reduced when the protagonist is not in contact with the terrain.
	this.floatingAccelerationDampingFactor = 0.7;
		
	this.constScaleFactorDefaultSnowTube = 1.0 * this.constWorldScale;		
	
	// Scale factors applied to the models after loading
	this.constModelInitializationScaleFactors = {};
	this.constModelInitializationScaleFactors[globalResources.keyModelRabbitProtagonist] =
		this.constScaleFactorDefaultRabbitProtagonist;
	this.constModelInitializationScaleFactors[globalResources.keyModelSnowTube] =
		this.constScaleFactorDefaultSnowTube;
	this.constModelInitializationScaleFactors[globalResources.keyModelSmoothRock1] = this.constWorldScale;
	this.constModelInitializationScaleFactors[globalResources.keyModelSmoothRock2] = this.constWorldScale;
	this.constModelInitializationScaleFactors[globalResources.keyModelSmoothRock3] = this.constWorldScale;
	this.constModelInitializationScaleFactors[globalResources.keyModelRockPile] = this.constWorldScale * 1.8;
	this.constModelInitializationScaleFactors[globalResources.keyModelEnemyCoronaVirusMonster] = this.constWorldScale * 1.0;
	this.constModelInitializationScaleFactors[globalResources.keyModelEnemyGrinch] = this.constWorldScale * 1.0;
	this.constModelInitializationScaleFactors[globalResources.keyModelWinterTree] = this.constWorldScale * 4.0;
	this.constModelInitializationScaleFactors[globalResources.keyModelEnemyEvilChristmasTree] = this.constWorldScale * 2.5;
	this.constModelInitializationScaleFactors[globalResources.keyModelPlacemarkerFlag] = this.constWorldScale * 1.0;

	this.modelBaseZOffsetFractions = {};
	this.modelBaseZOffsetFractions[globalResources.keyModelRabbitProtagonist] = 0.6;
	this.modelBaseZOffsetFractions[globalResources.keyModelSmoothRock1] = 0.0;
	this.modelBaseZOffsetFractions[globalResources.keyModelSmoothRock2] = 0.0;
	this.modelBaseZOffsetFractions[globalResources.keyModelSmoothRock3] = 0.0;
	this.modelBaseZOffsetFractions[globalResources.keyModelRockPile] = -0.4;
	this.modelBaseZOffsetFractions[globalResources.keyModelWinterTree] = -0.6;
	this.modelBaseZOffsetFractions[globalResources.keyModelEnemyCoronaVirusMonster] = -0.5;
	this.modelBaseZOffsetFractions[globalResources.keyModelEnemyGrinch] = -0.8;
	this.modelBaseZOffsetFractions[globalResources.keyModelEnemyEvilChristmasTree] = -0.3;
	this.modelBaseZOffsetFractions[globalResources.keyModelPlacemarkerFlag] = -0.5;
	
	this.levelProgressionRateMultiplierKey = "levelProgressionRateMultiplier";

	// "Reference" model dimensions for loaded models - represents
	// the dimensions of models before they were loaded (before
	// any applied transformations) (ModelDimensions collection)
	this.modelRefDimensionKeyValStore = {};
	
	// "Base" transformation matrix used to orient the model in the
	// proper initial direction/resting pose
	this.modelBaseMatrixKeyValStore = {};

	// Model WebGL buffers (WebGL vertex buffer data) -
	// All models (including those for the rabbit
	// protagonist) have an associated buffer, which is
	// required for rendering.
	this.webGlBufferDataKeyValStore = {};	

	// Compiled shader programs
	this.shaderPointLightStandardObject = null;
	this.shaderPointLightStandardObjectFade = null;
	this.shaderStandardOverlayTextureRender = null;	
	this.shaderSkyBackdrop = null;
	this.shaderSpiralBlurConverge = null;
	this.shaderBezierSurfaceTerrain = null;
	this.shaderBlackFader = null;

	// Background color for the "game over" overlay
	this.gameEndOverlayBackgroundColor = new RgbColor(0.0, 0.0, 0.0, 0.4);	

	// Color used to clear the WebGL canvas
	this.constCanvasClearColor = new RgbColor(0.0, 0.0, 0.0, 0.0);
	
	this.guideLightColor = new RgbColor(0.1, 0.1, 0.1, 1.0);
	
	this.pointLightIntensityDuskTransition = 0.4;

	// Default/standard terrain color
	this.constDefaultTerrainColor = new RgbColor(1.0, 1.0, 1.0, 1.0);

	var webGlCanvasContext = globalResources.getMainCanvasContext();	
	webGlCanvasContext.clearColor(this.constCanvasClearColor.getRedValue(), this.constCanvasClearColor.getGreenValue(),
		this.constCanvasClearColor.getBlueValue(), this.constCanvasClearColor.getAlphaValue());	
		
	// Enable alpha blending.
	webGlCanvasContext.enable(webGlCanvasContext.BLEND);
	webGlCanvasContext.blendFunc(webGlCanvasContext.SRC_ALPHA, webGlCanvasContext.ONE_MINUS_SRC_ALPHA);
	
	webGlCanvasContext.enable(webGlCanvasContext.CULL_FACE);
	webGlCanvasContext.cullFace(webGlCanvasContext.BACK);
	
	var floatTextureExt = webGlCanvasContext.getExtension("OES_texture_float");

	// Vector indicating the direction of the
	// ambient light source
	this.constAmbientLightVector = new Float32Array([
		-0.4, -0.3, -0.4
	]);

	// Exponent for power function applied to acquired unit input values for protagonist movement
	// (reduces sensitivity for low-magnitude inputs).
	this.constDeviceAccelResultExpoFactor = 3.5;	

	// Keys used to reference level data within the
	// resource key/value store
	this.levelKeyCollection =
	[
		globalResources.keyLevel1,
		globalResources.keyLevel2,
		globalResources.keyLevel3,
		globalResources.keyLevel4,
		globalResources.keyLevel5,
	];

	this.levelBuiltInModelSymbolToModelKeyDict = {};
	this.levelBuiltInModelSymbolToModelKeyDict["BuiltInModel_SmoothRock1"] = globalResources.keyModelSmoothRock1;
	this.levelBuiltInModelSymbolToModelKeyDict["BuiltInModel_SmoothRock2"] = globalResources.keyModelSmoothRock2;
	this.levelBuiltInModelSymbolToModelKeyDict["BuiltInModel_SmoothRock3"] = globalResources.keyModelSmoothRock3;
	this.levelBuiltInModelSymbolToModelKeyDict["BuiltInModel_RockPile"] = globalResources.keyModelRockPile;
	this.levelBuiltInModelSymbolToModelKeyDict["BuiltInModel_WinterTree"] = globalResources.keyModelWinterTree;
	this.levelBuiltInModelSymbolToModelKeyDict["BuiltInModel_EnemyGrinch"] = globalResources.keyModelEnemyGrinch;
	this.levelBuiltInModelSymbolToModelKeyDict["BuiltInModel_EnemyCoronaVirus"] = globalResources.keyModelEnemyCoronaVirusMonster;
	this.levelBuiltInModelSymbolToModelKeyDict["BuiltInModel_EnemyEvilChristmasTree"] = globalResources.keyModelEnemyEvilChristmasTree;
	this.levelBuiltInModelSymbolToModelKeyDict["BuiltInModel_PlacemarkerFlag"] = globalResources.keyModelPlacemarkerFlag;
	
	this.constLevelSymbolContactDamageSpecifier = "contactDamage";
	this.constLevelSymbolTypeGoalSpecifier = "ElementType_Goal";	
	this.constLevelSymbolTypeEnemySpecifier = "ElementType_Enemy";

	this.levelTileAdvanceLookupZ = 20;
	this.levelTileRecedingLookupZ = 15;
	
	// Render-space terrain extent - includes active and inactive regions.
	this.constTerrainSpan = 16.0;
	
	// Render-space terrain extent for the "active" portion of the terrain
	this.constActiveTerrainSpan = 4.0;
	
	// Number of segments along each axis, for the construction of the
	// tessalated terrain.
	this.constTerrainAxisSegments = 80;
	
	// Surface control point grid size
	this.constSurfaceControlPointCountX = 16;
	this.constSurfaceControlPointCountZ = 32;
	
	// Surface control points (used as a buffer to provide information to the vertex
	// shader) - the control points are spaced at regular intervals; therefore, only
	// the heights of control points are stored. The row index is inversely proportional
	// to the Z-axis coordinate value (that is, lower index rows are further away from
	// the viewer than higher-index rows).
	this.surfaceControlPointHeightMap = [
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,		
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,	
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
	];
	
	this.factorialTexture = null;
	
	// Offset fraction, with respect to a single row in
	// surfaceControlPointHeightMap
	this.controlPointOffsetFractionZ = 0.0;

	// Rabbit protagonist maximum lateral movement velocity (8 miles / hour)
	this.currentRabbitProtagonistMaxLateralMovementVelocity = 3.57632 /
		Constants.millisecondsPerSecond;
		
	// (20 miles / hour)
	this.baseRabbitProtagonistMaxForwardVelocity = 8.9408 /
		Constants.millisecondsPerSecond;
		
	this.constMinEffectiveSlopeLateralAcceleration = 0.01;
		
	this.rabbitProtagonistBounceDampingFactor = 0.60;

	// Presentation offset, in world space, used when composing the rendered
	// scene - determines the relative position of the rabbit protagonist
	// with the screen space origin along the Z-axis
	this.constRabbitProtagonistPresentOffsetWorldCoordZ = -1.4;
	
	this.constLeadingLevelMargin = -5.0;
	
	this.constTotalAssessedLevelMargin = this.constRabbitProtagonistPresentOffsetWorldCoordZ +
		this.constLeadingLevelMargin;
	
	// Value that represents the minimum difference between two height values,
	// in world coordinates, required to indicate that the values are different
	this.constHeightEquivalenceEpsilon = 0.0001;
	
	// Camera position, in world coordinates
	this.cameraWorldPosition = new Point3d(0.0, 1.2, 0.2);
	
	// Camera "look at" target point, in world coordinates
	this.cameraLookAtWorldPosition = new Point3d(0.0, 0.0, 3.0);
	
	// Maximum extent in either direction along the X-axis, with respect to
	// the origin, of the protagonist position
	this.maxRabbitProtagonistWorldCoordMagnitudeX = 2.20;
	
	this.rabbitProtagonistWorldPosition = new Point3d(0.0, 0.0, 0.0);
	
	// Offset, independent of the snow tube
	this.rabbitProtagonistWorldPositionAdditionalOffset = new Point3d(0.0, 0.0, 0.0);
	
	// Rabbit protagonist velocity, expressed in meters/millisecond
	this.currentRabbitProtagonistVelocity = new Vector3d(0.0, 0.0, 0.0);
	
	this.rabbitProtagonistPoseMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	this.rabbitProtagonistPoseMatrix.setToIdentity();
	
	// Matrix used to adjust rabbit protagonist attitude during
	// the "Game Over" launch
	this.rabbitProtagonistLaunchPoseMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	this.rabbitProtagonistPoseMatrix.setToIdentity();
	
	this.snowTubePerturbationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	this.snowTubePerturbationMatrix.setToIdentity();

	// Rabbit protagonist lateral acceleration, expressed in
	// meters / millisecond²
	this.rabbitProtagonistLateralAccelerationMetersPerMsSq = 5.0 /
		(Constants.millisecondsPerSecond * Constants.millisecondsPerSecond);

	// Rabbit protagonist base lateral deceleration, expressed in
	// meters / millisecond²
	this.rabbitProtagonistLateralDecelerationMetersPerMsSq = 2.25 /
		(Constants.millisecondsPerSecond * Constants.millisecondsPerSecond);	
		
	// Rabbit protagonist forward acceleration, expressed in
	// meters / millisecond²
	this.rabbitProtagonistForwardAccelerationMetersPerMsSq = 4.0 /
		(Constants.millisecondsPerSecond * Constants.millisecondsPerSecond);
		
	// Enemy/dynamic object base lateral acceleration, used for
	// protagonist tracking, expressed in meters / millisecond²		
	this.baseDynamicObjectTrackingAccelerationMetersPerMsSq = 2.0 /
		(Constants.millisecondsPerSecond * Constants.millisecondsPerSecond);	

	// Dimensionless acceleration along the Y-axis that is being
	// explicitly applied to the rabbit protagonist (corresponds
	// directly to the associated input magnitude).	
	this.currentRabbitProtagonistUnitAccelerationAxisX = 0.0;

	// Dimensionless acceleration along the Z-axis that is being
	// explicitly applied to the rabbit protagonist (managed by
	// game state logic).	
	this.currentRabbitProtagonistUnitAccelerationAxisZ = 0.0;
	
	// "Game Over" launch velocity for rabbit protagonist
	this.zAxisrabbitProtagonistLaunchVelocityMetersPerMs = 35.0 /
		Constants.millisecondsPerSecond;
	this.yAxisrabbitProtagonistLaunchVelocityMetersPerMs = 13.0 /
		Constants.millisecondsPerSecond;
	
	// Minimum / maximum absolute rabbit protagonist "health" values
	this.constRabbitProtagonistMinHealth = 0.0;
	this.constRabbitProtagonistMaxHealth = 200.0;
	
	this.constGeneralInvulnerabilityDurationMs = 3000.0;

	// Spirit gauge overlay position
	this.gaugeOverlayTopOffsetY = 0.05;
	this.gaugeOverlayHeight = 0.10;

	this.constFullScreenOverlayHeight = 2.0;

	this.progressOverlayWebGlData = null;
	this.gaugeOverlayRenderWebGlData = null;

	// Spirit Gauge colors
	this.constSpiritGaugeMaxValueColor = new RgbColor(0.0, 1.0, 0.0, 0.75);
	this.constSpiritGaugeMinValueColor = new RgbColor(0.8, 0.0, 0.0, 0.75);
	this.constSpiritGaugeLeadingEdgeColor = new RgbColor(1.0, 1.0, 1.0, 1.0);
	this.constSpiritGaugeLeadingEdgeFraction = 0.92;
	this.constSpiritGaugeOutlineColor = new RgbColor(1.0, 1.0, 1.0, 0.9);

	this.constSpiritGaugeWidth = 650;

	// Left margin of the gauge overlay text
	this.constOverlayTextLeftMargin = 15;
	
	// Canvas used to render the spirit gauge / spirit label
	this.spiritLabelCanvasBuffer = new StaticTextLineCanvasBuffer(Constants.labelFontSizePx,
		Constants.labelFont, Constants.labelFontStyle);
	this.spiritLabelCanvasBuffer.updateStaticTextString(Constants.stringVitalityLabel);		
	
	// Background color for the text section.
	this.defaultTextAreaBackgroundColor =  new RgbColor(
		Constants.defaultTextBackgroundUnitIntensity,
		Constants.defaultTextBackgroundUnitIntensity,
		Constants.defaultTextBackgroundUnitIntensity,		
		Constants.defaultTextBackgroundUnitAlpha);	

	// Interval, in milliseconds, at which overlay textures will
	// be updated (updates may involve updating textures, which
	// can be a relatively slow process).
	this.constOverlayUpdateIntervalMs = 400;

	// Ensure that an initial update is performed.
	this.currentOverlayUpdateElapsedInterval = this.constOverlayUpdateIntervalMs;

	// Sky backdrop geometry
	this.webGlBufferDataSkyBackdrop = null;

	// Base terrain geometry (geometry is perturbed during rendering)
	this.webGlBufferDataTerrain = null;
	
	this.fullScreenOverlayWebGlData = null;

	// Caches uniform locations for shader uniform look-ups.
	// The cache is keyed by a caller-provided key (should be
	// unique for each used shader. The object associated
	// with each key returns a key/value store, keyed by the
	// uniform name.
	this.uniformLocationCache = {};

	var canvasContext = globalResources.getMainCanvasContext();
	this.buildShaderPrograms(canvasContext);

	var constStartingLevelIndex = 0;
	
	// Represents the spatial data / element attribute specification
	// of the current level.
	this.currentLevelRepresentation = null;
		
	this.skyStartColor = new RgbColor(0.0, 1.0, 1.0, 1.0);
	this.skyEndColor = new RgbColor(0.0, 0.3, 1.0, 1.0);
	this.cloudColor = new RgbColor(1.0, 1.0, 1.0, 1.0);
	
	this.skyDuskStartColor = new RgbColor(0.5, 0.02, 0.1, 1.0);
	this.skyDuskEndColor = new RgbColor(0.0, 0.02, 0.02, 1.0);
	
	// Divisor used to generate the sky offset position from the
	// current world space Z offset.
	this.constSkyOffsetPositionDivisor = 2000.0;

	// Internal scale factor applied to device acceleration values acquired for protagonist movement
	this.constDeviceAttitudeAccelScaleFactor = 8.0;

	// Input event receivers - keyboard, device orientation and device touch.
	this.keyboardInputEventReceiver = new KeyboardInputEventReceiver(window);
	this.deviceAttitudeInputEventReceiver = new DeviceAttitudeInputEventReceiver(window);
	this.touchInputEventReceiver = new DeviceTouchInputEventReceiver(window);
	this.deviceAttitudeInputEventReceiver.setScaleFactor(this.constDeviceAttitudeAccelScaleFactor);

	// Abstractly manages input device binding.
	this.inputEventInterpreter = new InputEventInterpreter();
	
	// Collection of enemy objects which exist within the
	// active level (EnemyInstanceData type)
	this.enemyInstanceDataCollection = [];
	
	// Level end/goal instance marker data
	this.goalInstanceInfo = null;
	
	// Maximum Z-distance (world coordinates) before the rabbit protagonist at
	// which dynamic objects will be rendered
	this.maxDynamicObjectRenderWorldDistanceLeadingZ = 24.0;

	// Maximum Z-distance (world coordinates) after the rabbit protagonist at
	// which enemy objects will be rendered	
	this.maxDynamicObjectRenderWorldDistanceTrailingZ = 5.0;
	
	this.fadeTransitionController = new FadeTransitionController();
	
	// Miscellaneous timer management
	this.timers = new ExternalSourceTimerCollection();
	
	this.constTimerIdDamageAnimation = "TimerId_DamageAnimation";
	// Oscillations/second
	this.constDamageAnimationOscFrequencyYz = 0.7;
	this.constDamageAnimationOscFrequencyXy = 3.1;
	this.constMaxDamageAngleXy = Math.PI / 5.0;
	this.constMaxDamageAngleYz = Math.PI / 20.0;	
	this.constDamageAnimationDurationMs = 3000;
	
	// Rotations/second
	this.constGameOverRotationFrequency = 3.0;
	
	// Will be true when the "Game Over" screen content has
	// been rendered
	this.gameEndOverlayContentHasBeenGenerated = false;
	
	this.gameCompletionOverlayContentHasBeenGenerated = false;
	
	this.fadeOverlayContentHasBeenGenerated = false;	
	
	// General game state
	this.gameState = new GameState();
	this.gameState.setMinProtagonistFortitudeValue(this.constRabbitProtagonistMinHealth);
	this.gameState.setMaxProtagonistFortitudeValue(this.constRabbitProtagonistMaxHealth);
	this.gameState.setLevelCount(this.levelKeyCollection.length);
	
	this.gameRenderStateUtility = new GameRenderStateUtility();	
	
	this.levelEndPointCoordZ = 0;

	var sceneInstance = this;	
	function finalizeInitialization() {
		sceneInstance.clearAlpha(webGlCanvasContext);
		
		// Build the Bézier surface terrain shader separately, after the
		// model construction progress display has been completed. This
		// shader may take a relatively long time to build; relocating
		// the delay immediately towards the end of the progress
		// indicator can have the effect of reducing the perceived delay.
		sceneInstance.shaderBezierSurfaceTerrain =
			sceneInstance.buildShaderProgramWithResourceKeys(canvasContext, globalResources.keyVertexShaderBezierSurfaceTerrain,
			globalResources.keyFragmentShaderSnowPointLightGouraud);
		sceneInstance.initializeFactorialTexture(webGlCanvasContext);
		sceneInstance.setupNewLevelState(constStartingLevelIndex);
		sceneInstance.setupInputEventHandler();
		webGlCanvasContext.clear(canvasContext.COLOR_BUFFER_BIT);
		completionFunction();
	}

	this.generateDynamicElementPredeterminedMatrices();
	this.prepareGeometricRenderData(finalizeInitialization);
}

/**
 * Converts a value, represented in render-space units, to world-space units
 *  (meters)
 *
 * @param renderSpaceLength {Number} Render-space length specification
 *
 * @return {Number} World-space length specification (meters)
 */
MainSnowDuneBunnyGameplayScene.prototype.renderSpaceLengthToWorldSpaceLength = function (renderSpaceLength) {
	return Utility.returnValidNumOrZero(renderSpaceLength) / this.constWorldScale;
}

/**
 * Converts a value, represented in world-space units, to render-space units
 *  (meters)
 *
 * @param worldSpaceLength {Number} World-space length specification
 *
 * @return {Number} Render-space length specification
 */
MainSnowDuneBunnyGameplayScene.prototype.worldSpaceLengthToRenderSpaceLength = function (worldSpaceLength) {
	return Utility.returnValidNumOrZero(worldSpaceLength) * this.constWorldScale;	
}

/**
 * Converts a position in three-dimensional render space (meters) to world-space
 *  units
 *
 * @param coordX {Number} X-axis position
 * @param coordY {Number} Y-axis position
 * @param coordZ {Number} Z-axis position
 *
 * @return {Point3d} A position in world space
 */
MainSnowDuneBunnyGameplayScene.prototype.renderSpacePositionToWorldSpacePosition = function (coordX, coordY, coordZ) {
	var renderSpacePoint = new Point3d(
		this.renderSpaceLengthToWorldSpaceLength(Utility.returnValidNumOrZero(coordX)),
		this.renderSpaceLengthToWorldSpaceLength(Utility.returnValidNumOrZero(coordY)),
		this.renderSpaceLengthToWorldSpaceLength(Utility.returnValidNumOrZero(coordZ)));
	
	return renderSpacePoint;	
}

/**
 * Converts a position in three-dimensional world space (meters) to render-space
 *  units
 *
 * @param coordX {Number} X-axis position
 * @param coordY {Number} Y-axis position
 * @param coordZ {Number} Z-axis position
 *
 * @return {Point3d} A position in render-space
 */
MainSnowDuneBunnyGameplayScene.prototype.worldSpacePositionToRenderSpacePosition = function (coordX, coordY, coordZ) {
	var renderSpacePoint = new Point3d(
		this.worldSpaceLengthToRenderSpaceLength(Utility.returnValidNumOrZero(coordX)),
		this.worldSpaceLengthToRenderSpaceLength(Utility.returnValidNumOrZero(coordY)),
		this.worldSpaceLengthToRenderSpaceLength(Utility.returnValidNumOrZero(coordZ)));
	
	return renderSpacePoint;
}

/**
 * Compiles a shader program, using the provided resource keys that
 *  correspond to shader source
 * @param vertexShaderKey {String} Key used to access the vertex shader
 *                                 source
 * @param fragmentShaderKey {String} Key used to access the fragment
 *                                   shader source
 *
 * @return {WebGLProgram} A WebGL shader program upon success, null otherwise
 */
MainSnowDuneBunnyGameplayScene.prototype.buildShaderProgramWithResourceKeys = function(canvasContext, vertexShaderKey, fragmentShaderKey) {
	var shaderProgram = null;

	if (Utility.validateVar(vertexShaderKey) && Utility.validateVar(fragmentShaderKey)) {
		var vertexShader = globalResources.getLoadedResourceDataByKey(vertexShaderKey);
		var fragmentShader = globalResources.getLoadedResourceDataByKey(fragmentShaderKey);

		shaderProgram = WebGlUtility.createShaderProgram(canvasContext, vertexShader.resourceDataStore, fragmentShader.resourceDataStore);
	}

	return shaderProgram;
}

/**
 * Compiles all WebGL shader programs required to render
 *  a scene
 *
 * @param canvasContext {WebGLRenderingContext2D} WebGL context that is required to
 *                                                compile shader programs
 *
 */
MainSnowDuneBunnyGameplayScene.prototype.buildShaderPrograms = function(canvasContext) {
	this.shaderPointLightStandardObject = this.buildShaderProgramWithResourceKeys(canvasContext, globalResources.keyVertexShaderStandardPosition,
		globalResources.keyFragmentShaderPointLightGouraud);	
	this.shaderPointLightStandardObjectFade = this.buildShaderProgramWithResourceKeys(canvasContext, globalResources.keyVertexShaderStandardPosition,
		globalResources.keyFragmentShaderSnowPointLightGouraudFade);
	this.shaderSkyBackdrop = this.buildShaderProgramWithResourceKeys(canvasContext, globalResources.keyVertexShaderSkyBackdrop,
		globalResources.keyFragmentShaderSkyBackdrop);
	this.shaderBlackFader = this.buildShaderProgramWithResourceKeys(canvasContext, globalResources.keyVertexShaderStandardPosition,
		globalResources.keyFragmentShaderBlackFader);
	this.shaderStandardOverlayTextureRender = this.buildShaderProgramWithResourceKeys(canvasContext, globalResources.keyVertexShaderStandardPosition,
		globalResources.keyFragmentShaderStandardTexture);
	this.shaderSpiralBlurConverge = this.buildShaderProgramWithResourceKeys(canvasContext,
		globalResources.keyVertexShaderStandardPosition, globalResources.keyFragmentShaderSpiralBlurConverge);
}

/**
 * Returns the expected attribute location specifiers (as required for use with
 *  WebGLRenderingContext.getAttribLocation()) used with all employed shaders
 *
 * @param useTextures {Boolean} Indicates whether or not the associated shader
 *                              is expected to use textures
 *
 * @return {WebGlUtility.AttributeLocationData()} A collection of expected attribute
 *                                                location specifiers
 */
MainSnowDuneBunnyGameplayScene.prototype.getStandardShaderWebGlAttributeLocations = function(useTextures) {
	var attributeLocationData = new WebGlUtility.AttributeLocationData();
	attributeLocationData.vertexPositionAttributeLocation = "aVertexPosition";
	attributeLocationData.vertexColorAttributeLocation = "aVertexColor";
	attributeLocationData.vertexNormalAttributeLocation = "aVertexNormal";
	attributeLocationData.ambientLightVectorAttributeLocation = "uniform_ambientLightVector";
	
	if (Utility.validateVar(useTextures) && useTextures) {
		attributeLocationData.textureCoordinateAttributeLocation = "aTextureCoord";
	}
	else {
		attributeLocationData.textureCoordinateAttributeLocation = null;		
	}
	
	attributeLocationData.transformationMatrixAttributeLocation = "uniform_transformationMatrix";
	attributeLocationData.projectionMatrixAttributeLocation = "uniform_projectionMatrix";
	
	return attributeLocationData;
}

/**
 * Initializes a texture that is used a factorial look-up table
 *  (Unused - not all devices support texture look-ups from
 *  vertex shaders)
 *
 *
 * @param webGlCanvasContext {WebGLRenderingContext2D} WebGL context that is required to
 *                                                	   create rendering resources
 *
 */
MainSnowDuneBunnyGameplayScene.prototype.initializeFactorialTexture = function(webGlCanvasContext) {	
	var sourceFactorials = this.factorialTable();
	
	var factorials = new Float32Array(sourceFactorials);
	
	this.factorialTexture = webGlCanvasContext.createTexture();
	webGlCanvasContext.bindTexture(webGlCanvasContext.TEXTURE_2D, this.factorialTexture);
	webGlCanvasContext.texParameterf(webGlCanvasContext.TEXTURE_2D,
		webGlCanvasContext.TEXTURE_MIN_FILTER, webGlCanvasContext.NEAREST)
	webGlCanvasContext.texParameterf(webGlCanvasContext.TEXTURE_2D,
		webGlCanvasContext.TEXTURE_MAG_FILTER, webGlCanvasContext.NEAREST)		
	webGlCanvasContext.texImage2D(webGlCanvasContext.TEXTURE_2D, 0, webGlCanvasContext.RGBA,
		8, 1, 0, webGlCanvasContext.RGBA, webGlCanvasContext.FLOAT, factorials);		
}

/**
 * Returns a collection of constants that represent default values
 *  (sizes, etc.) pertaining to the storage of WebGL data, or general
 *  operational values
 *
 * @return {WebGlUtility.AttributeData()} A collection of constants pertaining to the
 *                                        storage of WebGL data/rendering behavior
 */
MainSnowDuneBunnyGameplayScene.prototype.getDefaultWebGlAttributeData = function() {
	var attributeData = new WebGlUtility.AttributeData();
	
	attributeData.vertexDataSize = this.constVertexSize;
	attributeData.vertexColorSize = this.constVertexColorSize;
	attributeData.vectorSize = this.constVectorSize;
	attributeData.ambientLightVector = this.constAmbientLightVector;
	attributeData.textureCoordinateSize = this.constTextureCoordinateSize;

	return attributeData;
}

/**
 * Prepares all procedural and pre-generated geometry data for
 *  use
 *
 * completionFunction {function} Function invoked upon the completion of model data
 *                               preparation
 */
MainSnowDuneBunnyGameplayScene.prototype.prepareGeometricRenderData = function(completionFunction) {
	this.prepareRenderDataForGaugeOverlay();
	this.prepareRenderDataForFullScreenOverlay();
	this.prepareRenderDataForProgressOverlay();
	this.prepareGeneratedGeometryRenderData();
	this.prepareModelRenderData(completionFunction);
}

/**
 * Decodes model data in preparation for rendering, applying any required
 *  post-processing, as necessary; reports progress visually during the
 *  preparation process. 
 *
 * completionFunction {function} Function invoked upon the completion of model data
 *                               preparation
 */
MainSnowDuneBunnyGameplayScene.prototype.prepareModelRenderData = function(completionFunction) {
	var modelKeys = this.getAllModelKeys();

	this.renderModelPreparationProgressIndicatorImmediate(0);

	if (modelKeys.length > 0) {
		var preparedModelCount = 0;

		for (var currentModelKey of modelKeys) {
			var sceneInstance = this;				
			function scheduleModelPreparation(targetModelKey) {
				
				function prepareModel () {
					sceneInstance.prepareModelRenderDataFromKeyedObjBuffer(targetModelKey);
					preparedModelCount++;
					sceneInstance.renderModelPreparationProgressIndicatorImmediate(preparedModelCount / modelKeys.length);
					
					if (preparedModelCount === modelKeys.length) {					
						setTimeout(completionFunction, 0);
					}
				}				
				setTimeout(prepareModel, 0);
			}
			
			scheduleModelPreparation(currentModelKey);
		}
	}
}

/**
 * Decodes render model data, encoded in OBJ model format, and applies an
 *  required pre-processing in preparation for use
 *
 * @param modelKey {String} Key used to access the model data which exists
 *                          in the resource key-value store.
 *
 */
MainSnowDuneBunnyGameplayScene.prototype.prepareModelRenderDataFromKeyedObjBuffer = function(modelKey) {
	if (Utility.validateVar(modelKey)) {
		this.webGlBufferDataKeyValStore[modelKey] = ModelUtility.prepareModelRenderDataFromObjBuffer(
			globalResources.getMainCanvasContext(),
			this.constModelInitializationScaleFactors[modelKey],
			globalResources.getLoadedResourceDataByKey(modelKey).resourceDataStore,
			this.constVertexSize, this.modelRefDimensionKeyValStore,
			modelKey);
	}
}

/**
 * Renders a visual representation of a provided operation progress
 *  fraction value
 *
 * @param progressFraction {Number} Number representing an
 *                                  approximate progress fraction (0.0 - 1.0,
 *                                  inclusive)
 *
 * @see MainSnowDuneBunnyGameplayScene.prepareModelRenderData
 */
MainSnowDuneBunnyGameplayScene.prototype.renderModelPreparationProgressIndicatorImmediate = function (progressFraction) {
	if (Utility.validateVar(progressFraction)) {
		var overlayTexture = globalResources.textureKeyValueStore[globalResources.keyTextureHourglass];
		var textureSize = globalResources.textureSizeKeyValueStore[globalResources.keyTextureHourglass];
		
		// The "horizontal blur convergence" applies a blur, evaluated
		// horitonally for each texel, that decreases in span s the progress
		// fraction approaches one (at which point the source image/
		// texture will appear in its unaltered form).
		var colorSplitProgressRenderWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(	
			this.progressOverlayWebGlData, this.shaderSpiralBlurConverge);
		
		var canvasContext = globalResources.getMainCanvasContext();
		var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
			this.constTransformationMatrixColumnCount);
		transformationMatrix.setToIdentity();
		var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(true);
		var webGlAttributeData = this.getDefaultWebGlAttributeData();	

		function horizontalBlurConvergeUniformSetup(shaderProgram) {			
			var textureOffsetUniformLocation = canvasContext.getUniformLocation(shaderProgram, "twistUnitMagnitude");
			canvasContext.uniform1f(textureOffsetUniformLocation, progressFraction);

			var imageWidthUniformLocation = canvasContext.getUniformLocation(shaderProgram, "imageWidth");
			canvasContext.uniform1f(imageWidthUniformLocation, textureSize[0]);
		}
		
		canvasContext.colorMask(true, true, true, true);
		canvasContext.clear(canvasContext.COLOR_BUFFER_BIT);
		WebGlUtility.renderGeometry(colorSplitProgressRenderWebGlData, transformationMatrix, transformationMatrix,
			overlayTexture, canvasContext, webGlAttributeLocationData, webGlAttributeData, horizontalBlurConvergeUniformSetup);
		canvasContext.finish();
	}
}

/**
 * Creates WebGL buffers for the full-screen overlay quad, ensuring that data
 *  can be immediately rendered
 */
MainSnowDuneBunnyGameplayScene.prototype.prepareRenderDataForProgressOverlay = function() {	
	this.progressOverlayWebGlData = this.prepareRenderDataForGeneralOverlay(1.0, 2.0, 0.0, 0.0);
}

/**
 * Generates data required to render representations of
 *  procedurally-generated geometry data (e.g., base terrain
 *  geometry)
 */
MainSnowDuneBunnyGameplayScene.prototype.prepareGeneratedGeometryRenderData = function() {
	this.webGlBufferDataSkyBackdrop = WebGlUtility.createWebGlBufferDataFromAggregateVertexData(
		globalResources.getMainCanvasContext(), this.skyBackdropAggregateVertexData(),
		this.constVertexSize);

	// Base terrain geometry data
	this.webGlBufferDataTerrain = WebGlUtility.createWebGlBufferDataFromAggregateVertexData(
		globalResources.getMainCanvasContext(), this.generateBaseTerrianAggregateVertexData(),
		this.constVertexSize);
}

/**
 * Generates data suitable for rendering a texture onto
 *  geometry that represents an overlay.
 * 
 * @param width {number} Length of the quad along the X-axis
 * @param height {number} Length of the quad along the Y-axis
 * @param centerX {number} Center coordinate of the quad along the X-axis
 * @param centerY {number} Center coordinate of the quad along the Y-axis 
 */
MainSnowDuneBunnyGameplayScene.prototype.prepareRenderDataForGeneralOverlay = function (width, height, centerX, centerY) {	
	var overlayQuadVertices = this.quadCoordArray(width, height, centerX, centerY, -1.0)
	
	var webGlBufferData = new WebGlUtility.WebGlBufferData();
	
	webGlBufferData.objectWebGlVertexBuffer = WebGlUtility.createWebGlBufferFromData(globalResources.getMainCanvasContext(),
		overlayQuadVertices);
	webGlBufferData.objectWebGlTexCoordBuffer = WebGlUtility.createWebGlBufferFromData(globalResources.getMainCanvasContext(),
		this.zPlaneQuadTextureCoords());

	webGlBufferData.vertexCount = overlayQuadVertices.length / this.constVertexSize;	
	
	return webGlBufferData;	
}

/**
 * Creates WebGL buffers for the gauge overlay quad, ensuring that data
 *  can be immediately rendered
 */
MainSnowDuneBunnyGameplayScene.prototype.prepareRenderDataForGaugeOverlay = function() {
	var constGaugeOverlayTopOffsetY = 0.05;
	var constGaugeOverlayHeight = 0.10;
	var constAxisSpanX = 2.0;
	
	this.gaugeOverlayRenderWebGlData = this.prepareRenderDataForGeneralOverlay(constAxisSpanX,
		constGaugeOverlayHeight, 0.0, 1.0 - constGaugeOverlayHeight);
}

/**
 * Creates WebGL buffers for the full-screen overlay quad, ensuring that data
 *  can be immediately rendered
 */
MainSnowDuneBunnyGameplayScene.prototype.prepareRenderDataForFullScreenOverlay = function() {	
	var constAxisSpanX = 2.0;

	this.fullScreenOverlayWebGlData = this.prepareRenderDataForGeneralOverlay(
		constAxisSpanX, this.constFullScreenOverlayHeight, 0.0, 0.0);
}

/**
 * Creates geometry for a Z-plane aligned quad
 *
 * @param xAxisSpan {number} Length of the quad along the X-axis
 * @param yAxisSpan {number} Length of the quad along the Y-axis
 * @param centerX {number} Center of the quad along the X-axis
 * @param centerY {number} Center of the quad along the Y-axis
 * @param zCoord {number} Z-plane coordinate in which the quad lies
 *
 * @return {Array} Array of Triangle objects which comprise the Z-plane
 *                 aligned quad
 */
MainSnowDuneBunnyGameplayScene.prototype.zPlaneQuadTriangles = function (xAxisSpan, yAxisSpan, centerX, centerY, zCoord) {
	var normalVector = new Vector3d(0.0, 0.0, -1.0);
	
	var firstTriangleVertexA = new Vertex3d(-xAxisSpan / 2.0 + centerX,		yAxisSpan / 2.0 + centerY,		zCoord);
	var firstTriangleVertexB = new Vertex3d(-xAxisSpan / 2.0 + centerX, 	-yAxisSpan / 2.0 + centerY,		zCoord);
	var firstTriangleVertexC = new Vertex3d(xAxisSpan / 2.0 + centerX, 		-yAxisSpan / 2.0 + centerY,		zCoord);
	
	var secondTriangleVertexA = new Vertex3d(xAxisSpan / 2.0 + centerX, 	-yAxisSpan / 2.0 + centerY,		zCoord);
	var secondTriangleVertexB = new Vertex3d(xAxisSpan / 2.0 + centerX, 	yAxisSpan / 2.0 + centerY, 		zCoord);
	var secondTriangleVertexC = new Vertex3d(-xAxisSpan / 2.0 + centerX, 	yAxisSpan / 2.0 + centerY,		zCoord);

	firstTriangleVertexA.setSurfaceMappingCoords(0.0, 0.0);
	firstTriangleVertexB.setSurfaceMappingCoords(0.0, 1.0);
	firstTriangleVertexC.setSurfaceMappingCoords(1.0, 1.0);
	
	secondTriangleVertexA.setSurfaceMappingCoords(1.0, 1.0);
	secondTriangleVertexB.setSurfaceMappingCoords(1.0, 0.0);
	secondTriangleVertexC.setSurfaceMappingCoords(0.0, 0.0);
	
	var vertices = [
		firstTriangleVertexA,
		firstTriangleVertexB,
		firstTriangleVertexC,
		secondTriangleVertexA,
		secondTriangleVertexB,
		secondTriangleVertexC,
	];
	
	vertices.forEach(function(vertex) {
		vertex.setNormalVector(normalVector);
	});
	
	return [ new Triangle(firstTriangleVertexA, firstTriangleVertexB, firstTriangleVertexC),
		new Triangle(secondTriangleVertexA, secondTriangleVertexB, secondTriangleVertexC) ];
}

/**
 * Generates texture coordinates that are suitable for use with
 *  a vertex buffer that represents a quad
 *
 * @return {Float32Array} Array of Float-32 values which can be directly
 *                        used to represent texture coordintes
 *                        within a quad vertex buffer
 */
MainSnowDuneBunnyGameplayScene.prototype.zPlaneQuadTextureCoords = function () {
	return new Float32Array([
		// Upper-left (triangle #1)
		0.0, 0.0,
		// Lower-left (triangle #1)
		0.0, 1.0,
		// Lower-right (triangle #1)		
		1.0, 1.0,
		
		// Lower-right (triangle #2)	
		1.0, 1.0,
		// Upper-right (triangle #2)
		1.0, 0.0,
		// Upper-left (triangle #2)
		0.0, 0.0
	]);
}

/**
 * Creates an array suitable for generation of a vertex buffer that
 *  represents a quad
 *
 * @param xAxisSpan {number} Length of the quad along the X-axis
 * @param yAxisSpan {number} Length of the quad along the Y-axis
 * @param centerX {number} Center of the quad along the X-axis
 * @param centerY {number} Center of the quad along the Y-axis
 * @param zCoord {number} Z-plane coordinate in which the quad lies
 *
 * @return {Float32Array} Array of Float-32 values which can be directly
 *                        used to generate a vertex buffer
 *
 * @see WebGlUtility.createWebGlBufferFromData
 */
MainSnowDuneBunnyGameplayScene.prototype.quadCoordArray = function (xAxisSpan, yAxisSpan, centerX, centerY, zCoord) {
	return new Float32Array([
		// Upper-left (triangle #1)
		-xAxisSpan / 2.0 + centerX, 		yAxisSpan / 2.0 + centerY,			zCoord,
		// Lower-left (triangle #1)
		-xAxisSpan / 2.0 + centerX, 		-yAxisSpan / 2.0 + centerY,			zCoord,
		// Lower-right (triangle #1)
		xAxisSpan / 2.0 + centerX, 			-yAxisSpan / 2.0 + centerY,			zCoord,
		
		// Lower-right (triangle #2)
		xAxisSpan / 2.0 + centerX, 			-yAxisSpan / 2.0 + centerY,			zCoord,
		// Upper-right (triangle #2)		
		xAxisSpan / 2.0 + centerX, 			yAxisSpan / 2.0 + centerY, 			zCoord,
		// Upper-left (triangle #2)
		-xAxisSpan / 2.0 + centerX, 		yAxisSpan / 2.0 + centerY, 			zCoord,
	]);
}


/**
 * Generates vertex data used to render the sky backdrop
 *
 * @return {AggregateWebGlVertexData} Object which contains WebGL vertex
 *                                    data that can be directly buffered by
 *                                    WebGL
 */
MainSnowDuneBunnyGameplayScene.prototype.skyBackdropAggregateVertexData = function() {
	var skyBackdropCoordSpan = 2.0;
	
	var quadTriangles = this.zPlaneQuadTriangles(skyBackdropCoordSpan, skyBackdropCoordSpan, 0.0, 0.0, 1.0)
	var skyBackdropWebGlVertexData = new WebGlUtility.generateAggregateVertexDataFromTriangleList(
		quadTriangles);
	
	return skyBackdropWebGlVertexData;
}

/**
 * Returns all keys that are used to access models within
 *  the key-value store
 *
 * @return {Array} A collection keys associated with all models
 */
MainSnowDuneBunnyGameplayScene.prototype.getAllModelKeys = function () {		
	return this.getAllDynamicObjectKeys();
}

/**
 * Returns a collection of dynamic object keys (objects that can
 *  damage the protagonist, move, etc.) used in a key-value store
 *
 * @return {Array} A collection of enemy keys
 */
MainSnowDuneBunnyGameplayScene.prototype.getAllDynamicObjectKeys = function () {
	return [
		globalResources.keyModelRabbitProtagonist,
		globalResources.keyModelSnowTube,
		globalResources.keyModelSmoothRock1,
		globalResources.keyModelSmoothRock2,
		globalResources.keyModelSmoothRock3,
		globalResources.keyModelRockPile,
		globalResources.keyModelWinterTree,
		globalResources.keyModelEnemyCoronaVirusMonster,
		globalResources.keyModelEnemyGrinch,
		globalResources.keyModelEnemyEvilChristmasTree,
		globalResources.keyModelPlacemarkerFlag
	];
}

/**
 * Builds pre-determined matrices that are required to properly orient
 *  models, as necessary
 */
MainSnowDuneBunnyGameplayScene.prototype.generateDynamicElementPredeterminedMatrices = function() {
	var dynamicElementKeys = this.getAllDynamicObjectKeys();
	
	for (var currentDynamicElementKey of dynamicElementKeys) {
		var transformationMatrix = null;
		switch (currentDynamicElementKey) {
			case globalResources.keyModelRabbitProtagonist:
				transformationMatrix = MathUtility.generateRotationMatrix3dAxisY(Math.PI);
				break;
			case globalResources.keyModelSnowTube:
				transformationMatrix = MathUtility.generateRotationMatrix3dAxisX(-Math.PI / 2.0);
				break;
			case globalResources.keyModelSmoothRock1:
				transformationMatrix = MathUtility.generateRotationMatrix3dAxisY(0.0);
				break;
			case globalResources.keyModelSmoothRock2:
				transformationMatrix = MathUtility.generateRotationMatrix3dAxisY(0.0);
				break;
			case globalResources.keyModelSmoothRock3:
				transformationMatrix = MathUtility.generateRotationMatrix3dAxisY(0.0);
				break;
			case globalResources.keyModelRockPile:
				transformationMatrix = MathUtility.generateRotationMatrix3dAxisX(-Math.PI / 2.0);
				break;
			case globalResources.keyModelEnemyGrinch:
				transformationMatrix = MathUtility.generateRotationMatrix3dAxisY(Math.PI);
				break;
			case globalResources.keyModelEnemyCoronaVirusMonster:
				transformationMatrix = MathUtility.generateRotationMatrix3dAxisY(Math.PI);
				break;
			case globalResources.keyModelWinterTree:
				transformationMatrix = MathUtility.generateRotationMatrix3dAxisY(0.0);
				break;
			case globalResources.keyModelEnemyEvilChristmasTree:
				transformationMatrix = MathUtility.generateRotationMatrix3dAxisX(-Math.PI / 2.0);
				break;
			case globalResources.keyModelPlacemarkerFlag:
				transformationMatrix = MathUtility.generateRotationMatrix3dAxisX(-Math.PI / 2.0);			
			default:
				break;
		}
		
		if (transformationMatrix !== null) {
			this.modelBaseMatrixKeyValStore[currentDynamicElementKey] = transformationMatrix;
		}
	}
}

/**
 * Returns the primary transformation matrix required to position the
 *  rabbit protagonist.
 *
 * @return {MathExt.Matrix} Transformation matrix required to properly position the rabbit
 *                          protagonist
 */
MainSnowDuneBunnyGameplayScene.prototype.generateRabbitProtagonistTransformationMatrix = function() {
	var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);

	var renderSpacePosition = this.worldSpacePositionToRenderSpacePosition(
		this.rabbitProtagonistWorldPosition.xCoord + this.rabbitProtagonistWorldPositionAdditionalOffset.xCoord,
		this.rabbitProtagonistWorldPosition.yCoord + this.rabbitProtagonistWorldPositionAdditionalOffset.yCoord,
		this.rabbitProtagonistWorldPosition.zCoord + this.rabbitProtagonistWorldPositionAdditionalOffset.zCoord);
	var translationMatrix = MathUtility.generateTranslationMatrix3d(renderSpacePosition.getX(),
		renderSpacePosition.getY(), renderSpacePosition.getZ());

	transformationMatrix = translationMatrix;

	return transformationMatrix;
}

/**
 * Returns the primary transformation matrix required to position the
 *  snow tube associated rabbit protagonist.
 *
 * @return {MathExt.Matrix} Transformation matrix required to properly position the snow
 *                          tube
 */
MainSnowDuneBunnyGameplayScene.prototype.generateSnowTubeTransformationMatrix = function() {
	var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);

	transformationMatrix.setToIdentity();
	
	var baseRenderSpacePosition = this.worldSpacePositionToRenderSpacePosition(
		this.rabbitProtagonistWorldPosition.xCoord,
		this.rabbitProtagonistWorldPosition.yCoord,
		this.rabbitProtagonistWorldPosition.zCoord);
	
	// Vertical displacement of the protagonist, relative to
	// half of the tube height, with respect to the tube centerline.
	var protagonistHalfDepthFraction = 0.80;
	
	// (The Z-axis value is the height of the snow tube model, before
	// it is transformed to the appropriate orientation)
	var protagonistAlignmentOffsetY =
		(protagonistHalfDepthFraction * this.modelRefDimensionKeyValStore[globalResources.keyModelSnowTube].dimensionZ / 2.0)  -
		this.modelRefDimensionKeyValStore[globalResources.keyModelRabbitProtagonist].dimensionY / 2.0;

	transformationMatrix = 
		MathUtility.generateTranslationMatrix3d(baseRenderSpacePosition.getX(),
			protagonistAlignmentOffsetY + baseRenderSpacePosition.getY(),
			baseRenderSpacePosition.getZ()).multiply(
		transformationMatrix);

	return transformationMatrix;
}

/**
 * Generates a render-space bounding box, centered at the render-space
 *  origin, that represents that approximately represents the
 *  physical area of the associated object, and completely represents
 *  the interactive area of the object
 *
 * @param modelDataKey {String} Key used to access the model data which exists
 *                              in the resource key-value store.
 *
 * @return {Box} Render-space bounding box
 */
MainSnowDuneBunnyGameplayScene.prototype.originCenteredRenderBoundingBox = function(modelDataKey) {
	var boundingBox = null;
	
	var refDimensionX = Utility.returnValidNumOrZero(this.modelRefDimensionKeyValStore[modelDataKey].dimensionX);
	var refDimensionY = Utility.returnValidNumOrZero(this.modelRefDimensionKeyValStore[modelDataKey].dimensionY);
	var refDimensionZ = Utility.returnValidNumOrZero(this.modelRefDimensionKeyValStore[modelDataKey].dimensionZ);	
	
	switch (modelDataKey) {
		case globalResources.keyModelSnowTube:
			boundingBox = new Box(new Point3d(0.0, 0.0, 0.0), refDimensionX, refDimensionZ, refDimensionY);
			break;
		case globalResources.keyModelWinterTree:
			boundingBox = new Box(new Point3d(0.0, 0.0, 0.0), refDimensionX * 0.20, refDimensionY, refDimensionZ * 0.20);
			break;
		default:
			boundingBox = new Box(new Point3d(0.0, 0.0, 0.0), refDimensionX, refDimensionY, refDimensionZ);
			break;
	}
	 
	return boundingBox;
}

/**
 * Generates a world-space bounding box, centered at the world-space
 *  origin, that represents that approximately represents the
 *  physical area of the associated object, and completely represents
 *  the interactive area of the object
 *
 * @param modelDataKey {String} Key used to access the model data which exists
 *                              in the resource key-value store.
 *
 * @return {Box} World-space bounding box
 */
MainSnowDuneBunnyGameplayScene.prototype.originCenteredWorldBoundingBox = function(modelDataKey) {
	var worldBoundingBox = null;
	
	var renderBoundingBox = this.originCenteredRenderBoundingBox(modelDataKey);
	
	if (renderBoundingBox != null) {
		worldBoundingBox = new Box(renderBoundingBox.centerPoint,
			this.renderSpaceLengthToWorldSpaceLength(renderBoundingBox.axisLengthX),
			this.renderSpaceLengthToWorldSpaceLength(renderBoundingBox.axisLengthY),
			this.renderSpaceLengthToWorldSpaceLength(renderBoundingBox.axisLengthZ))
	}
	
	return worldBoundingBox;
}

/**
 * Generates a composite, world-space bounding box that represents that approximate
 *  represents the physical area of the rabbit protagonist and the snow tube, and
 *  completely represents their interactive area
 *
 * @return {Box} World-space bounding box
 */
MainSnowDuneBunnyGameplayScene.prototype.rabbitProtagonistBoundingBox = function() {
	var rabbitBoundingBox = this.originCenteredWorldBoundingBox(globalResources.keyModelRabbitProtagonist).boxWithOffset(
		this.rabbitProtagonistWorldPosition.xCoord,
		this.rabbitProtagonistWorldPosition.yCoord,
		this.rabbitProtagonistWorldPosition.zCoord);

	var snowTubeBoundingBox = this.originCenteredWorldBoundingBox(globalResources.keyModelSnowTube).boxWithOffset(
		this.rabbitProtagonistWorldPosition.xCoord,
		this.rabbitProtagonistWorldPosition.yCoord,
		this.rabbitProtagonistWorldPosition.zCoord);

	return rabbitBoundingBox.unionBox(snowTubeBoundingBox);
}

/**
 * Generates a world-space bounding box that represents that approximate
 *  represents the physical volume the dynamic object, and completely
 *  represents its interactive volume
 *
 * @param dynamicObjectInstance {DynamicItemInstanceData} Information that represents
 *                                                        the dynamic object instance
 *
 * @return {Box} World-space bounding box
 */
MainSnowDuneBunnyGameplayScene.prototype.dynamicObjectBoundingBox = function(dynamicObjectInstance) {
	return this.originCenteredWorldBoundingBox(dynamicObjectInstance.modelDataKey).boxWithOffset(
		dynamicObjectInstance.modelWorldSpacePosition.xCoord,
		dynamicObjectInstance.modelWorldSpacePosition.yCoord,
		dynamicObjectInstance.modelWorldSpacePosition.zCoord);
}


// Generates a render-space transformation matrix used to translate scene
// components to the origin
MainSnowDuneBunnyGameplayScene.prototype.generateOriginBasedRenderSpaceMatrix = function() {
	var transformationMatrix = MathUtility.generateTranslationMatrix3d(0.0, 0.0,
		-this.worldSpaceLengthToRenderSpaceLength(this.rabbitProtagonistWorldPosition.zCoord -
		this.constRabbitProtagonistPresentOffsetWorldCoordZ));

	return transformationMatrix;
}

MainSnowDuneBunnyGameplayScene.prototype.controlPointHeightMapDecimalMinCoordZ = function () {
	return this.rabbitProtagonistWorldPosition.zCoord + this.constTotalAssessedLevelMargin;
}

MainSnowDuneBunnyGameplayScene.prototype.controlPointHeightMapMinCoordZ = function () {
	return Math.floor(this.controlPointHeightMapDecimalMinCoordZ());	
}

MainSnowDuneBunnyGameplayScene.prototype.controlPointHeightMapMaxCoordZ = function () {
	return this.controlPointHeightMapMinCoordZ() + this.constSurfaceControlPointCountZ;
}

MainSnowDuneBunnyGameplayScene.prototype.populateControlPointHeightMap = function() {
	// True starting world point along X-axis should be a negative value
	// equivalent to the working area half-width
	var minCoordX = 0;//Math.round(-this.constSurfaceControlPointCountX / 2.0);
	
	var minCoordZ = this.controlPointHeightMapMinCoordZ();
	
	for (var zLoop = 0; zLoop < this.constSurfaceControlPointCountZ; zLoop++) {
		for (var xLoop = 0; xLoop < this.constSurfaceControlPointCountX; xLoop++) {
			var coordX = minCoordX + xLoop;
			var coordZ = minCoordZ + zLoop;
			var pointHeight = this.controlPointHeightAtWorldSpacePosition(new Point3d(coordX, 0.0, coordZ));			
		
			var targetIndexZ = (this.constSurfaceControlPointCountZ - 1) - zLoop
			this.surfaceControlPointHeightMap[(this.constSurfaceControlPointCountX * targetIndexZ) + xLoop] =
				this.worldSpaceLengthToRenderSpaceLength(pointHeight);
		}
	}
}

/**
 * Returns the attributes associated with the specified tile type
 *  at the provided world space location 
 *
 * @param position {Point3d} Location in world space
 *
 * @return {Object} Object containing attributes associated with the level tile type
 */
MainSnowDuneBunnyGameplayScene.prototype.tileAttributesAtWorldSpacePosition = function(position) {
	var tileAttributes = null;
	
	//var tileOffsetX = this.currentLevelRepresentation.getTileGridWidth() / 2.0;
	
	if (Utility.validateVarAgainstType(position, Point3d)/* && Utility.validateVar(tileColumnOffset) &&
		Utility.validateVar(tileRowOffset)*/) {

		var tileType = this.currentLevelRepresentation.getTileTypeAtPosition(
			Math.round(position.zCoord),
			Math.round(position.xCoord));
		
		if (Utility.validateVar(tileType)) {
			tileAttributes = this.currentLevelRepresentation.getTileTypeAttributes(tileType);
		}
	}
	
	return tileAttributes;
}

/**
 * Returns the index corresponding to the level data row that contains
 *  the specified world-space Z-coordinate
 *
 * @return {number} Tile index of the row containing the specified Z-coordinate
 */
MainSnowDuneBunnyGameplayScene.prototype.tileRowIndexAtWorldSpaceCoordZ = function(coordZ) {
	return Math.max(0, Math.floor(coordZ));
}

/**
 * Returns the elevation of the Bézier control point situated at the
 *  specified world-space position
 *
 * @param position {Point3d} Location in world space
 *
 * @return {number} Elevation of the associated Bézier control point, in
 *                  world coordinates
 */
MainSnowDuneBunnyGameplayScene.prototype.controlPointHeightAtWorldSpacePosition = function(position) {
	// True starting world point along X-axis should be a negative value
	// equivalent to the working area half-width	
	var controlPointHeight = 0.0;
	
	if (Utility.validateVarAgainstType(position, Point3d)) {
		var tileAttributes = this.tileAttributesAtWorldSpacePosition(position);
		var tileType = this.currentLevelRepresentation.getTileTypeAtPosition(
			Math.round(position.zCoord),
			Math.round(position.xCoord))
		
		if (Utility.validateVar(tileType)) {
			tileAttributes = this.currentLevelRepresentation.getTileTypeAttributes(tileType);
			
			if (Utility.validateVar(tileAttributes.elevation)) {
				controlPointHeight = tileAttributes.elevation +
					this.dynamicDriftPulseHeightDelta(tileAttributes);
			}
		}
	}

	return controlPointHeight;
}

/**
 * Determines the immediate (time-based) elevation delta between the
 *  fixed terrain elevation and a snow drift pulse, if
 *  applicable
 *
 * @param tileAttributes {Object} Attributes associated with a tile situated
 *                                at a particular location within the level
 *
 * @return {number} Immediate elevation of the snow drift pulse, in
 *                  world coordiantes
 */
MainSnowDuneBunnyGameplayScene.prototype.dynamicDriftPulseHeightDelta = function(tileAttributes) {
	var heightDelta = 0.0;
	
	if (Utility.validateVar(tileAttributes.driftPulseAmplitude) &&
		Utility.validateVar(tileAttributes.driftPulseFrequency) &&
		Utility.validateVar(tileAttributes.driftPulsePhaseShift)
	) {
		var baseSineInput =
			this.totalElapsedSceneTimeMs / Constants.millisecondsPerSecond * 2.0 * Math.PI;
			
		heightDelta = tileAttributes.driftPulseAmplitude *
			(2.0 * Math.sin((baseSineInput * tileAttributes.driftPulseFrequency) +
			tileAttributes.driftPulsePhaseShift) + 1.0) / 2.0;
	}
	
	return heightDelta;
}

/**
 * Generates vertex data used to build terrain geometry.
 *
 * @return {AggregateWebGlVertexData} Object which contains WebGL vertex
 *                                    data that can be directly buffered by
 *                                    WebGL
 */
MainSnowDuneBunnyGameplayScene.prototype.generateBaseTerrianAggregateVertexData = function() {	
	var terrainGenerator = new TessellatedPlanarRectGenerator(this.constTerrainSpan, this.constTerrainSpan, new Point3d(0.0, 0.0, 0.0));
	terrainGenerator.setColor(this.constDefaultTerrainColor);
	terrainGenerator.setWidthSegmentCount(this.constTerrainAxisSegments);
	terrainGenerator.setLengthSegmentCount(this.constTerrainAxisSegments);
	terrainGenerator.generateGeometry();

	var terrainVertexData = WebGlUtility.generateAggregateVertexDataFromTriangleList(
		terrainGenerator.getTriangleList());

	return terrainVertexData;
}

/**
 * Returns a table containing factorials, each index of which corresponds
 *  to the operand of the computed factorial at that particular index
 *
 * @return {Array} Array of factorial values
 */
MainSnowDuneBunnyGameplayScene.prototype.factorialTable = function() {
	return [
		1.0,
		1.0,
		2.0,
		6.0,
		24.0,
		120.0,
		720.0,
		5040.0,
		40320.0,
		362880.0,
		3628800.0,
		39916800.0,
		479001600.0,
		6227020800.0,
		87178291200.0,
		1307674368000.0,
		20922789888000.0,
		355687428096000.0,
		6402373705728000.0,
		121645100408832000.0,
		2432902008176640000.0,
		51090942171709440000.0,
		1.1240007277776077e+21,
		2.585201673888498e+22,
		6.204484017332394e+23,
		1.5511210043330986e+25,
		4.0329146112660565e+26,
		1.0888869450418352e+28,
		3.0488834461171384e+29,
		8.841761993739701e+30,
		2.6525285981219103e+32,
		8.222838654177922e+33,		
	];
}

/**
 * Computes the result of a Bernstein polynomial evaluation
 *
 * @param degree {number} Degree of the Bernstein polynomial (control point count - 1)
 * @param iteration {number} Iteration within the basis function
 * @param param {number} Parameterization value (0.0 - 1.0, inclusive)
 *
 * @return {number} The result of the Bernstein polynomial
 *                  evaluation
 */
MainSnowDuneBunnyGameplayScene.prototype.computeBernstein = function(degree, iteration, param) {
	var factorials = this.factorialTable();
	
	return (factorials[degree] / (factorials[iteration] * (factorials[degree - iteration]))) * Math.pow(param, iteration) * Math.pow((1.0 - param), degree - iteration)	
}

/**
 * Returns the elevation of the terrain at a world-space point projected onto the X-Z plane
 *
 * @param coordX World-space X-axis coordinate
 * @param coordz World-space Z-axis coordinate
 *
 * @return {number} Elevation of the associated Bézier control point, in
 *                  world coordinates
 */
MainSnowDuneBunnyGameplayScene.prototype.terrainHeightAtWorldCoord = function(coordX, coordZ) {
	var terrainHeight = 0.0;

	if ((coordZ >= this.controlPointHeightMapMinCoordZ()) && (coordZ <= this.controlPointHeightMapMaxCoordZ())) {		
		var paramX = (coordX + this.constSurfaceControlPointCountX / 2.0) / this.constSurfaceControlPointCountX;	
		var paramZ = ((coordZ - this.controlPointHeightMapMinCoordZ()) / this.constSurfaceControlPointCountZ);		

		for (var xLoop = 0; xLoop < this.constSurfaceControlPointCountX; xLoop++) {
			var bersteinX = this.computeBernstein(this.constSurfaceControlPointCountX - 1, xLoop, paramX);

			for (var zLoop = 0; zLoop < this.constSurfaceControlPointCountZ; zLoop++) {
				var workingIndexZ = (this.constSurfaceControlPointCountZ - zLoop - 1);
		
				var yCoord = this.controlPointHeightAtWorldSpacePosition(new Point3d(xLoop,
					0.0, Math.floor(this.controlPointHeightMapMinCoordZ() + zLoop)));

				terrainHeight += (bersteinX *
					this.computeBernstein(this.constSurfaceControlPointCountZ - 1, zLoop, paramZ) * yCoord);
			}
		}
	}

	return terrainHeight;
}

/**
 * Returns the partial, X-axis derivative of the Bézier surface at a
 *  world-space point projected onto the X-Z plane
 *
 * @param coordX World-space X-axis coordinate
 * @param coordz World-space Z-axis coordinate
 *
 * @return {Vector3d} Derivative of the Bézier surface at the specified
 *                    coordinates
 */
MainSnowDuneBunnyGameplayScene.prototype.xBernsteinDerivativeAtWorldCoord = function(coordX, coordZ) {
	var vector = new Vector3d(0.0, 0.0, 0.0);

	if ((coordZ >= this.controlPointHeightMapMinCoordZ()) && (coordZ <= this.controlPointHeightMapMaxCoordZ())) {		
		var paramX = (coordX + this.constSurfaceControlPointCountX / 2.0) / this.constSurfaceControlPointCountX;	
		var paramZ = ((coordZ - this.controlPointHeightMapMinCoordZ()) / this.constSurfaceControlPointCountZ);		


		for (var zLoop = 0; zLoop < this.constSurfaceControlPointCountZ; zLoop++) {
			var bersteinZ = this.computeBernstein(this.constSurfaceControlPointCountZ - 1, zLoop, paramZ);

			for (var xLoop = 0; xLoop < (this.constSurfaceControlPointCountX - 1); xLoop++) {
				var workingIndexZ = (this.constSurfaceControlPointCountZ - zLoop - 1);
		
				var yCoord = this.controlPointHeightAtWorldSpacePosition(new Point3d(xLoop,
					0.0, Math.floor(this.controlPointHeightMapMinCoordZ() + zLoop)));
				var yCoord2 = this.controlPointHeightAtWorldSpacePosition(new Point3d(xLoop + 1,
					0.0, Math.floor(this.controlPointHeightMapMinCoordZ() + zLoop)));

				var intermediateVector = 
					(new Vector3d(xLoop + 1, yCoord2, Math.floor(this.controlPointHeightMapMinCoordZ() + zLoop))).subtractVector(
					new Vector3d(xLoop, yCoord, Math.floor(this.controlPointHeightMapMinCoordZ() + zLoop)));

				intermediateVector = intermediateVector.multiplyByScalar(bersteinZ *
					this.computeBernstein(this.constSurfaceControlPointCountX - 1, xLoop, paramX));
					
				vector = vector.addVector(intermediateVector);
			}
		}
	}

	return vector;
}

/**
 * Returns the partial, Z-axis derivative of the Bézier surface at a
 *  world-space point projected onto the X-Z plane
 *
 * @param coordX World-space X-axis coordinate
 * @param coordz World-space Z-axis coordinate
 *
 * @return {Vector3d} Derivative of the Bézier surface at the specified
 *                    coordinates
 */
MainSnowDuneBunnyGameplayScene.prototype.zBernsteinDerivativeAtWorldCoord = function(coordX, coordZ) {
	var vector = new Vector3d(0.0, 0.0, 0.0);

	if ((coordZ >= this.controlPointHeightMapMinCoordZ()) && (coordZ <= this.controlPointHeightMapMaxCoordZ())) {		
		var paramX = (coordX + this.constSurfaceControlPointCountX / 2.0) / this.constSurfaceControlPointCountX;	
		var paramZ = ((coordZ - this.controlPointHeightMapMinCoordZ()) / this.constSurfaceControlPointCountZ);		

		for (var xLoop = 0; xLoop < this.constSurfaceControlPointCountX; xLoop++) {		
			var bersteinX = this.computeBernstein(this.constSurfaceControlPointCountX - 1, xLoop, paramX);

			for (var zLoop = 0; zLoop < this.constSurfaceControlPointCountZ - 1; zLoop++) {				
				var workingIndexZ = (this.constSurfaceControlPointCountZ - zLoop - 1);
		
				var yCoord = this.controlPointHeightAtWorldSpacePosition(new Point3d(xLoop,
					0.0, Math.floor(this.controlPointHeightMapMinCoordZ() + zLoop)));
				var yCoord2 = this.controlPointHeightAtWorldSpacePosition(new Point3d(xLoop,
					0.0, Math.floor(this.controlPointHeightMapMinCoordZ() + zLoop + 1)));

				var intermediateVector = 
					(new Vector3d(xLoop, yCoord2, Math.floor(this.controlPointHeightMapMinCoordZ() + zLoop + 1))).subtractVector(
					new Vector3d(xLoop, yCoord, Math.floor(this.controlPointHeightMapMinCoordZ() + zLoop)));

				intermediateVector = intermediateVector.multiplyByScalar(bersteinX *
					this.computeBernstein(this.constSurfaceControlPointCountZ - 1, zLoop, paramZ));
					
				vector = vector.addVector(intermediateVector);
			}
		}
	}

	return vector;
}

/**
 * Returns the normal vector of the Bézier surface at the
 *  world-space point projected onto the X-Z plane
 *
 * @param coordX World-space X-axis coordinate
 * @param coordz World-space Z-axis coordinate
 *
 * @return {Vector3d} Normal vector of the Bézier surface
 */
MainSnowDuneBunnyGameplayScene.prototype.terrainNormalAtWorldCoord = function(coordX, coordZ) {
	var tangentVectorX = this.xBernsteinDerivativeAtWorldCoord(
		this.rabbitProtagonistWorldPosition.xCoord,
		this.rabbitProtagonistWorldPosition.zCoord);
		
	var tangentVectorZ = this.zBernsteinDerivativeAtWorldCoord(
		this.rabbitProtagonistWorldPosition.xCoord,
		this.rabbitProtagonistWorldPosition.zCoord);			
		
	var normalVector = tangentVectorZ.crossProduct(tangentVectorX);
	
	normalVector.normalize();
	
	return normalVector;
}

/**
 * Provides a color value for the rabbit protagonist guide light
 *
 * @return {RgbColor} rabbit protagonist guide light color
 */
MainSnowDuneBunnyGameplayScene.prototype.rabbitProtagonistGuideLightColor = function() {
	return this.guideLightColor;
}

/**
 * Updates any immediate animation states for the rabbit protagonist,
 *  based upon the internally-maintained state data
 *
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 */
MainSnowDuneBunnyGameplayScene.prototype.updateRabbitProtagonistAnimationStates = function(timeQuantum) {
	if (this.gameState.protagonistIsInvulnerable) {
		this.gameRenderStateUtility.incrementInvulnerabilityFrameCount();
	}
	else {
		this.gameRenderStateUtility.resetInvulnerabilityFrameCount();
	}
}

/** 
 * Initiates the rabbit protagonist damage animation, if
 *  is not already in progress
 */
MainSnowDuneBunnyGameplayScene.prototype.invokeRabbitProtagonistDamageAnimation = function() {
	this.timers.addTimer(new ExternalSourceTimer(this.constDamageAnimationDurationMs, function() {},
		this.constTimerIdDamageAnimation));
}

/**
 * Determines if the rabbit protagonist should be rendered
 *  at the present moment
 *
 * @return {boolean} True if the rabbit protagonist should be
 *                   rendered
 */
MainSnowDuneBunnyGameplayScene.prototype.shouldRenderRabbitProtagonist = function(timeQuantum, targetCanvasContext) {
	return (!this.gameState.protagonistIsInvulnerable || this.gameRenderStateUtility.shouldRenderProtagonist());
}

/**
 * Returns the elevation of the terrain at a world-space point projected onto the X-Z plane
 *
 * @param coordX World-space X-axis coordinate
 * @param coordz World-space Z-axis coordinate
 *
 * @return {number} Elevation of the associated Bézier control point, in
 *                  world coordinates
 */
MainSnowDuneBunnyGameplayScene.prototype.yCoordForRabbitProtagonistWithTerrainContact = function(xCoord, zCoord) {
	return this.terrainHeightAtWorldCoord(xCoord, zCoord) + this.modelBaseOffsetZ(globalResources.keyModelRabbitProtagonist)
}

/**
 * Generates the immediate angular value, in radians, used for
 *  the rotation of the rabbit protagonist in the X-Y plane
 *  while the damage animation is active
 *
 * @return {number} Rotation angle, in the X-Y plane of the rabbit
 *                  protagonist (radians)
 */
MainSnowDuneBunnyGameplayScene.prototype.rabbitProtagonistDamageAnimationAngleXy = function() {
	var damageAnimationTimer = this.timers.timerWithId(this.constTimerIdDamageAnimation);

	return ((damageAnimationTimer != null) && (!damageAnimationTimer.isExpired()))
		? this.damageAngleFromTimerAndFrequency(damageAnimationTimer, this.constDamageAnimationOscFrequencyXy,
			this.constMaxDamageAngleXy)
		: 0.0;
}

/**
 * Generates the immediate angular value, in radians, used for
 *  the rotation of the rabbit protagonist in the Y-Z plane
 *  while the damage animation is active
 *
 * @return {number} Rotation angle, in the Y-Z plane of the rabbit
 *                  protagonist, (radians)
 */
MainSnowDuneBunnyGameplayScene.prototype.rabbitProtagonistDamageAnimationAngleYz = function() {
	var damageAnimationTimer = this.timers.timerWithId(this.constTimerIdDamageAnimation);

	return ((damageAnimationTimer != null) && (!damageAnimationTimer.isExpired()))
		? this.damageAngleFromTimerAndFrequency(damageAnimationTimer, this.constDamageAnimationOscFrequencyYz,
			this.constMaxDamageAngleYz)
		: 0.0;
}

/**
 * Determines the completion fraction of a timed operation
 *  that is tracked using an ExternalSourceTimer instance 
 *
 * @param timer {ExternalSourceTimer} Timer from which the completion
 *                                    fraction will be derived
 *
 * @return {number} Unitless completion fraction
 */
MainSnowDuneBunnyGameplayScene.prototype.completionFractionFromTimer = function(timer) {	
	if (Utility.validateVarAgainstType(timer, ExternalSourceTimer) && (timer.targetDurationMs > 0.0)) {
		completionFraction = timer.elapsedTimeMs / timer.targetDurationMs;		
	}
	
	return completionFraction;
}

/**
 * Generates the immediate angular value, in radians, used for
 *  the rotation of the rabbit protagonist  while the damage
 *  animation is active
 *
 * @param timer {ExternalSourceTimer} Timer used to track the damage
 *                                    animation progression
 * @param frequencyPerSecond {number} Oscillation frequency of the
 *                                    animation
 * @param maxAngle {number} Maximum rotation angle (radians)
 *
 * @return {number} Rotation angle, in the Y-Z plane of the rabbit
 *                  protagonist, (radians)
 */
MainSnowDuneBunnyGameplayScene.prototype.damageAngleFromTimerAndFrequency = function(timer, frequencyPerSecond, maxAngle) {
	var damageAngle = 0.0;
	
	if (Utility.validateVarAgainstType(timer, ExternalSourceTimer)) {	
		damageAngleSineSource = (2.0 * Math.PI * frequencyPerSecond) * timer.elapsedTimeMs / Constants.millisecondsPerSecond;
	}
	
	return Math.sin(damageAngleSineSource) * maxAngle * (1.0 - this.completionFractionFromTimer(timer));
}

/**
 * Updates matrices used to apply context-based transformations
 *  to the rabbit protagonist model
 *
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 */
MainSnowDuneBunnyGameplayScene.prototype.updateRabbitProtagonistPoseMatrices = function(timeQuantum) {
	var normal = this.terrainNormalAtWorldCoord(this.rabbitProtagonistWorldPosition.xCoord,
		this.rabbitProtagonistWorldPosition.yCoord);
		
	var yAxis = new Vector(0.0, 1.0);
	var xyPlaneVector = new Vector(normal.xComponent, normal.yComponent);

	var xyPlaneAngle = Math.acos(yAxis.dotProduct(xyPlaneVector) / (yAxis.magnitude() * xyPlaneVector.magnitude()));
	var xyPlaneCrossProduct = new Vector3d(normal.xComponent, normal.yComponent, 0.0).crossProduct(new Vector3d(0.0, 1.0, 0.0));

	var signedXyPlaneAngle = xyPlaneAngle * ((xyPlaneCrossProduct.zComponent >= 0.0) ? 1.0 : -1.0) +
		this.rabbitProtagonistDamageAnimationAngleXy();
	
	var yzPlaneVector = new Vector(normal.zComponent, normal.yComponent);
	
	var yzPlaneAngle = Math.acos(yAxis.dotProduct(yzPlaneVector) / (yAxis.magnitude() * yzPlaneVector.magnitude())) +
		this.rabbitProtagonistDamageAnimationAngleYz();
	var yzPlaneCrossProduct = new Vector3d(normal.xComponent, 0.0, normal.zComponent).crossProduct(new Vector3d(0.0, 1.0, 0.0));
	
	var signedYzPlaneAngle = yzPlaneAngle * ((yzPlaneCrossProduct.xComponent >= 0.0 ) ? -1.0 : 1.0);

	// Add a displacement in order to ensure that the rabbit protagonist is rotated
	// its base, rather than its center point, as the terrain is
	// traversed.
	var xyPlaneRabbitRotationAlignmentOffset = this.modelRefDimensionKeyValStore[globalResources.keyModelRabbitProtagonist].dimensionY / 2.0;
	var tiltPointTranslationMatrix = MathUtility.generateTranslationMatrix3d(0.0, xyPlaneRabbitRotationAlignmentOffset, 0.0);
	var finalPositionTranslationMatrix = MathUtility.generateTranslationMatrix3d(0.0, -xyPlaneRabbitRotationAlignmentOffset, 0.0);

	var rabbitTerrainPerturbationMatrix = finalPositionTranslationMatrix.multiply(
		MathUtility.generateRotationMatrix3dAxisZ(signedXyPlaneAngle).multiply(
		MathUtility.generateRotationMatrix3dAxisX(yzPlaneAngle)).multiply(
		tiltPointTranslationMatrix));
		
	var terrainPerturbationMatrix = MathUtility.generateRotationMatrix3dAxisZ(signedXyPlaneAngle).multiply(
		MathUtility.generateRotationMatrix3dAxisX(yzPlaneAngle));		
		
	this.rabbitProtagonistPoseMatrix = rabbitTerrainPerturbationMatrix;		
	this.snowTubePerturbationMatrix = terrainPerturbationMatrix;
}

/**
 * Updates matrices used to apply a transformation to the rabbit
 *  protagonist model that is specific to the "Game Over" game
 *  state
 *
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 */
MainSnowDuneBunnyGameplayScene.prototype.updateRabbitProtagonistGameOverPoseMatrix = function(timeQuantum) {
	if (this.gameState.isInGameOverState()) {		
		var rotationAngle = this.totalElapsedSceneTimeMs / Constants.millisecondsPerSecond * 2.0 * Math.PI *
			this.constGameOverRotationFrequency;
		
		this.rabbitProtagonistLaunchPoseMatrix = MathUtility.generateRotationMatrix3dAxisX(-rotationAngle);
	}
	else {
		this.rabbitProtagonistLaunchPoseMatrix.setToIdentity();
	}
}

/**
 * Updates the immediate position of the rabbit protagonist,
 *  based on the current velocity/game state
 *
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 */
MainSnowDuneBunnyGameplayScene.prototype.updateRabbitProtagonistPosition = function (timeQuantum) {
	this.rabbitProtagonistWorldPosition.xCoord += (this.currentRabbitProtagonistVelocity.xComponent * timeQuantum);
	this.rabbitProtagonistWorldPosition.xCoord = Math.max(Math.min(this.rabbitProtagonistWorldPosition.xCoord,
		this.maxRabbitProtagonistWorldCoordMagnitudeX), -this.maxRabbitProtagonistWorldCoordMagnitudeX);
	
	this.rabbitProtagonistWorldPosition.yCoord += (this.currentRabbitProtagonistVelocity.yComponent * timeQuantum);
	this.rabbitProtagonistWorldPosition.zCoord += (this.currentRabbitProtagonistVelocity.zComponent * timeQuantum);
	
	if (this.isRabbitProtagonistInContactWithTerrain()) {
		this.rabbitProtagonistWorldPosition.yCoord = this.yCoordForRabbitProtagonistWithTerrainContact(
			this.rabbitProtagonistWorldPosition.xCoord,
			this.rabbitProtagonistWorldPosition.zCoord);
	}	
}

/**
 * Updates the immediate position of the rabbit protagonist,
 *  using positional update logic that is specific to the
 *  "Game Over" game state
 *
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 */
MainSnowDuneBunnyGameplayScene.prototype.updateRabbitProtagonistPositionForGameOverState = function (timeQuantum) {
	this.rabbitProtagonistWorldPositionAdditionalOffset.yCoord +=
		this.yAxisrabbitProtagonistLaunchVelocityMetersPerMs * timeQuantum;	 
	this.rabbitProtagonistWorldPositionAdditionalOffset.zCoord +=
		this.zAxisrabbitProtagonistLaunchVelocityMetersPerMs * timeQuantum;
}

/**
 * Updates the immediate position of the rabbit protagonist,
 *  based on the currently-applied input/game state
 *
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 */
MainSnowDuneBunnyGameplayScene.prototype.updateRabbitProtagonistVelocity = function (timeQuantum) {
	var inContactWithTerrain = this.isRabbitProtagonistInContactWithTerrain();
	
	if (Math.abs(this.rabbitProtagonistWorldPosition.xCoord) >= this.maxRabbitProtagonistWorldCoordMagnitudeX) {
		this.currentRabbitProtagonistVelocity.xComponent = 0;
	}

	var lateralAccelerationFromSlope = this.rabbitProtagonistLateralAccelFromSlope();
	if (inContactWithTerrain) {
		this.currentRabbitProtagonistVelocity.xComponent +=
			lateralAccelerationFromSlope *
			this.constGravitationalAccelerationMetersPerMsSq * timeQuantum;
	}
	
	if (this.isRabbitProtagonistLateralAccelerationactive()) {
		this.currentRabbitProtagonistVelocity.xComponent +=
			(timeQuantum * this.currentRabbitProtagonistUnitAccelerationAxisX *
			this.accelerationDampingFactor() *
			this.rabbitProtagonistLateralAccelerationMetersPerMsSq);
	}
	else {
		var directionMultiplier = (this.currentRabbitProtagonistVelocity.xComponent >= 0.0) ? -1.0 : 1.0;
		
		var velocityDifference = timeQuantum * this.rabbitProtagonistLateralDecelerationMetersPerMsSq;
		if (velocityDifference <= Math.abs(this.currentRabbitProtagonistVelocity.xComponent)) {
			this.currentRabbitProtagonistVelocity.xComponent += velocityDifference * directionMultiplier;
		}
		else {
			this.currentRabbitProtagonistVelocity.xComponent = 0.0;
		}
	}
	
	this.currentRabbitProtagonistVelocity.zComponent +=
		(timeQuantum * this.rabbitProtagonistForwardAccelerationMetersPerMsSq);
	this.currentRabbitProtagonistVelocity.zComponent = Math.min(this.currentRabbitProtagonistVelocity.zComponent,
		this.maxRabbitProtagonistForwardVelocity())

	if (!inContactWithTerrain) {
		this.currentRabbitProtagonistVelocity.yComponent -=
			this.constGravitationalAccelerationMetersPerMsSq * timeQuantum;
	}
	else {
		if (this.currentRabbitProtagonistVelocity.yComponent < 0.0) {
			this.currentRabbitProtagonistVelocity.yComponent *= -this.bounceDampingFactor();
		}
		else {
			
		}
		//this.currentRabbitProtagonistVelocity.yComponent = 0.0;
	}
}

/**
 * Computes the lateral acceleration induced by the
 *  rabbit protagonist being situated on a slope
 *
 * @param slopeVector Vector which represents the slope of the
 *                    terrain (derivative) at a single point
 * 
 * @return A lateral acceleration value, expressed in meters/millisecond²
 */
MainSnowDuneBunnyGameplayScene.prototype.lateralAccerationFromSlope = function(slopeVector) {
	var yAxisNegVector = new Vector3d(0.0, -1.0, 0.0);

	var angleCos = slopeVector.dotProduct(yAxisNegVector) / (yAxisNegVector.magnitude() * slopeVector.magnitude());

	return this.constGravitationalAccelerationMetersPerMsSq * angleCos;
}

/**
 * Computes the lateral acceleration induced on the
 *  rabbit protagonist by the immediate slope of the
 *  terrain at a particular location 
 * 
 * @return A lateral acceleration value, expressed in meters/millisecond²
 */
MainSnowDuneBunnyGameplayScene.prototype.rabbitProtagonistLateralAccelFromSlope = function() {
	var terrainSlopeVector = this.xBernsteinDerivativeAtWorldCoord(this.rabbitProtagonistWorldPosition.xCoord,
		this.rabbitProtagonistWorldPosition.zCoord);

	var lateralAccelFromSlope = this.lateralAccerationFromSlope(terrainSlopeVector);
	
	return lateralAccelFromSlope >= this.constMinEffectiveSlopeLateralAcceleration
		? lateralAccelFromSlope
		: 0.0;
}

/**
 * Slightly adjusts the position of the camera, as necessary, based on the
 *  position of the rabbit protagonist
 *
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 */
MainSnowDuneBunnyGameplayScene.prototype.updateCameraPosition = function(timeQuantum) {
	var constPositionDivisor = 20;
	var constLookAtDivisor = constPositionDivisor * 1.0;
	
	var expFactor = Math.abs(this.rabbitProtagonistWorldPosition.xCoord / this.maxRabbitProtagonistWorldCoordMagnitudeX);
	
	this.cameraLookAtWorldPosition.xCoord = -this.rabbitProtagonistWorldPosition.xCoord / constPositionDivisor;
	this.cameraWorldPosition.xCoord = -this.rabbitProtagonistWorldPosition.xCoord / constLookAtDivisor;
}

/**
 * Returns the maximum permissible forward velocity of the rabbit
 *  protagonist (effectively determines the rate of progression
 *  through the current level)
 *
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 */
MainSnowDuneBunnyGameplayScene.prototype.maxRabbitProtagonistForwardVelocity = function(timeQuantum) {
	var rateMultiplier = Utility.returnValidNumOrZero(this.currentLevelRepresentation.levelProgressionRateMultiplier)
	
	return this.baseRabbitProtagonistMaxForwardVelocity * ((rateMultiplier !== 0.0) ? rateMultiplier : 1.0);
}

/**
 * Determines if the rabbit protagnoist is considered to
 *  be in contact with the terrain
 */
MainSnowDuneBunnyGameplayScene.prototype.isRabbitProtagonistInContactWithTerrain = function() {
	var terrainContactRefY = this.yCoordForRabbitProtagonistWithTerrainContact(this.rabbitProtagonistWorldPosition.xCoord,
		this.rabbitProtagonistWorldPosition.zCoord);

	return (this.rabbitProtagonistWorldPosition.yCoord - terrainContactRefY) < this.constHeightEquivalenceEpsilon;
}

/**
 * Determines if the rabbit protagonist is accelerating as
 *  a result of user input
 *
 * @return {number} True if the rabbit protagonist is
 *                  accelerating, false otherise
 */
MainSnowDuneBunnyGameplayScene.prototype.isRabbitProtagonistLateralAccelerationactive = function() {		
	return Math.abs(this.currentRabbitProtagonistUnitAccelerationAxisX) > 0.0
}

/**
 * Returns the unitless damping factor applied to the
 *  bounce the occurs when the rabbit protagonist
 *  comes into contact with the terrain with a
 *  non-zero velocity
 *
 * @return {number} Bouncing damping factor
 */
MainSnowDuneBunnyGameplayScene.prototype.bounceDampingFactor = function() {
	return this.rabbitProtagonistBounceDampingFactor;
}

/**
 * Returns the acceleration damping factor that is applied
 *  to acceleration due to user-input; this factor varies
 *  depending upon whether the rabbit protagonist is
 *  in contact with the terrain or not
 * 
 * @return {number} The acceleration damping factor
 */
MainSnowDuneBunnyGameplayScene.prototype.accelerationDampingFactor = function() {
	return this.isRabbitProtagonistInContactWithTerrain() ? 1.0 : this.floatingAccelerationDampingFactor;
}

/**
 * Updates the immediate state information of the rabbit protagonist,
 *  based upon the current rabbit protagonist state information, and
 *  its relation to other details of the game state (e.g., enemy
 *  position).
 *
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 */
MainSnowDuneBunnyGameplayScene.prototype.updateRabbitProtagonistStateInformation = function(timeQuantum) {
	if (this.gameState.isInActiveOperationState()) {
		this.evaluateRabbitProtagonistEnemyCollisionDamage();
		this.updateRabbitProtagonistPosition(timeQuantum);
		this.updateRabbitProtagonistVelocity(timeQuantum);
	}
	else if (this.gameState.isInGameOverState()) {
		this.updateRabbitProtagonistPositionForGameOverState(timeQuantum);
	}
	
	this.updateRabbitProtagonistPoseMatrices(timeQuantum);
	this.updateRabbitProtagonistGameOverPoseMatrix(timeQuantum);
	this.updateRabbitProtagonistAnimationStates(timeQuantum);
	this.updateCameraPosition(timeQuantum);
}

/**
 * Returns the world-space Z-offset that is applied to the position of
 *  the model in order properly align the model with the terrain
 *
 * @param modelDataKey {String} Key used to access the model data which exists
 *                              in the resource key-value store.
 *
 * @return {number} World-space Z offset
 */
MainSnowDuneBunnyGameplayScene.prototype.modelBaseOffsetZ = function(modelDataKey) {
	var offsetZ = 0.0;
	if (Utility.validateVar(this.modelBaseZOffsetFractions[modelDataKey])) {
		offsetZ = this.modelBaseZOffsetFractions[modelDataKey] *
			this.modelRefDimensionKeyValStore[modelDataKey].dimensionZ;
	}
	
	return this.renderSpaceLengthToWorldSpaceLength(offsetZ);
}

/**
 * Updates the position of a single dynamic object, based upon the immediate
 *  object attributes (e.g., velocity)
 *
 * @param dynamicInstanceData {DynamicItemInstanceData} Information that represents
 *                                                      the dynamic object instance
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 */
MainSnowDuneBunnyGameplayScene.prototype.updateDynamicObjectPosition = function(timeQuantum, dynamicInstanceData) {
	var offsetZ = this.modelBaseOffsetZ(dynamicInstanceData.modelDataKey);

	if (this.isDynamicObjectInRenderRegion(dynamicInstanceData)) {
		dynamicInstanceData.modelWorldSpacePosition.yCoord = this.terrainHeightAtWorldCoord(
			dynamicInstanceData.modelWorldSpacePosition.xCoord,
			dynamicInstanceData.modelWorldSpacePosition.zCoord) - offsetZ;
			
		if (dynamicInstanceData.trackingStrength > 0.0) {
			var directionBias = (dynamicInstanceData.modelWorldSpacePosition.xCoord >
				this.rabbitProtagonistWorldPosition.xCoord) ? -1.0 : 1.0;
			dynamicInstanceData.velocityVector.xComponent += dynamicInstanceData.trackingStrength * 
				this.rabbitProtagonistLateralAccelerationMetersPerMsSq * directionBias * timeQuantum *
				Constants.millisecondsPerSecond;
		}			
	}
	
	dynamicInstanceData.modelWorldSpacePosition.xCoord +=
		dynamicInstanceData.velocityVector.xComponent * timeQuantum / Constants.millisecondsPerSecond;
		
	if ((Math.abs(dynamicInstanceData.velocityVector.xComponent) > 0.0) &&
		Math.abs(dynamicInstanceData.modelWorldSpacePosition.xCoord) > this.maxRabbitProtagonistWorldCoordMagnitudeX) {
			
		dynamicInstanceData.modelWorldSpacePosition.xCoord =
			Math.min(Math.max(dynamicInstanceData.modelWorldSpacePosition.xCoord, -this.maxRabbitProtagonistWorldCoordMagnitudeX),
			this.maxRabbitProtagonistWorldCoordMagnitudeX);
		
		dynamicInstanceData.velocityVector.xComponent *= -1.0;		
	}
}

/**
 * Updates state information for all dynamic (e.g., moving/damage inducing)
 *  objects
 *
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 */
MainSnowDuneBunnyGameplayScene.prototype.updateDynamicObjectStateInformation = function(timeQuantum) {
	if (this.gameState.isInActiveOperationState()) {
		for (currentDynamicInstanceData of this.enemyInstanceDataCollection) {
			this.updateDynamicObjectPosition(timeQuantum, currentDynamicInstanceData);
		}
		
		this.updateDynamicObjectPosition(timeQuantum, this.goalInstanceInfo);
	}
}

/**
 * Updates state information for all objects within the scene (including the
 *  rabbit protagonist)
 *
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 */
MainSnowDuneBunnyGameplayScene.prototype.updateStateInformationForWorldObjects = function(timeQuantum) {
	this.updateRabbitProtagonistStateInformation(timeQuantum);
	this.updateDynamicObjectStateInformation(timeQuantum);
}

/**
 * Updates data used to render the terrain
 *
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds) 
 */
MainSnowDuneBunnyGameplayScene.prototype.updateTerrain = function(timeQuantum) {
	this.populateControlPointHeightMap();
}

/**
 * Updates information employed to govern/maintain the internal
 *  game state
 *
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 */
MainSnowDuneBunnyGameplayScene.prototype.updateGameState = function(timeQuantum) {
	if ((this.levelEndPointCoordZ != null) && (this.levelEndPointCoordZ > 0.0) &&
		(this.rabbitProtagonistWorldPosition.zCoord >= this.levelEndPointCoordZ) &&
		this.gameState.isInActiveOperationState()) {

		if (this.gameState.currentLevelIndex < (this.gameState.levelCount - 1)) {
			if (!this.fadeTransitionController.isTransitionInProgress()) {
				var sceneInstance = this;
				this.fadeTransitionController.invokeTransition(function() {
					sceneInstance.gameState.currentLevelIndex++;				
					sceneInstance.setupNewLevelState(sceneInstance.gameState.currentLevelIndex);
					sceneInstance.gameState.setOperationState(sceneInstance.gameState.constOperationStateInterLevelPauseCompletion);
					sceneInstance.fadeTransitionController.invokeTransitionContinuation(function() {
						sceneInstance.gameState.setOperationState(sceneInstance.gameState.constOperationStateActive);
					});
				});
			}
		}
		else {
			// Game completed
			this.gameState.setOperationState(this.gameState.constOperationStateInterLevelPause);
		}
	}

	this.gameState.updateGameStateWithTimeQuantum(timeQuantum);
	this.fadeTransitionController.updateTransitionWithTimeQuantum(timeQuantum);
	this.timers.updateActiveTimers(timeQuantum);
}

/**
 * Initializes game input bindings
 */
MainSnowDuneBunnyGameplayScene.prototype.setupInputEventHandler = function () {
	// Bind the keyboard input events...		
	this.inputEventInterpreter.bindInputEventToFunction(this.keyboardInputEventReceiver,
		this.keyboardInputEventReceiver.constKeySpecifierArrowLeft,	
		this, this.handleInputForRabbitProtagonistMovementLeft);
		
	this.inputEventInterpreter.bindInputEventToFunction(this.keyboardInputEventReceiver,
		this.keyboardInputEventReceiver.constKeySpecifierArrowRight,	
		this, this.handleInputForRabbitProtagonistMovementRight);
		
	this.inputEventInterpreter.bindInputEventToFunction(this.keyboardInputEventReceiver,
		this.keyboardInputEventReceiver.constKeySpecifierSpace,	
		this, this.handleInputForLevelRetry);

	// Bind the device orientation input events (mobile devices, etc.)
	this.inputEventInterpreter.bindInputEventToFunction(this.deviceAttitudeInputEventReceiver,
		this.deviceAttitudeInputEventReceiver.constAttitudeEffectiveTiltInputSpecifierLeft,
		this, this.handleInputForRabbitProtagonistMovementLeft);
		
	this.inputEventInterpreter.bindInputEventToFunction(this.deviceAttitudeInputEventReceiver,
		this.deviceAttitudeInputEventReceiver.constAttitudeEffectiveTiltInputSpecifierRight,
		this, this.handleInputForRabbitProtagonistMovementRight);
		
	this.inputEventInterpreter.bindInputEventToFunction(this.touchInputEventReceiver,
		this.touchInputEventReceiver.constTouchInputSpecifier,
		this, this.handleInputForLevelRetry);
}

/**
 * Input handler for the input message(s) which represent the
 *  "move left" action (touch device)
 *
 * @param scalarInputEvent {ScalarInputEvent} Scalar-based input event which represents
 *                                            an input message that can represent varying
 *                                            input magnitudes
 */
MainSnowDuneBunnyGameplayScene.prototype.handleInputForRabbitProtagonistMovementLeft = function (scalarInputEvent) {
	if (Utility.validateVarAgainstType(scalarInputEvent, ScalarInputEvent) && this.gameState.isInActiveOperationState()) {
		this.currentRabbitProtagonistUnitAccelerationAxisX = -Math.pow(scalarInputEvent.inputUnitMagnitude,
		this.constDeviceAccelResultExpoFactor);
	}
}

/**
 * Input handler for the input message(s) which represent the
 *  "move right" action (touch device)
 *
 * @param scalarInputEvent {ScalarInputEvent} Scalar-based input event which represents
 *                                            an input message that can represent varying
 *                                            input magnitudes
 */
MainSnowDuneBunnyGameplayScene.prototype.handleInputForRabbitProtagonistMovementRight = function (scalarInputEvent) {
	if (Utility.validateVarAgainstType(scalarInputEvent, ScalarInputEvent) && this.gameState.isInActiveOperationState()) {
		this.currentRabbitProtagonistUnitAccelerationAxisX = Math.pow(scalarInputEvent.inputUnitMagnitude,
		this.constDeviceAccelResultExpoFactor);
	}
}

/**
 * Input handler for input message(s) which are intended
 *  to invoke a level restart (after a level progression
 *  termination event)
 *
 * @param scalarInputEvent {ScalarInputEvent} Scalar-based input event which represents
 *                                            an input message that can represent varying
 *                                            input magnitudes
 */
MainSnowDuneBunnyGameplayScene.prototype.handleInputForLevelRetry = function (scalarInputEvent) {
	if (Utility.validateVarAgainstType(scalarInputEvent, ScalarInputEvent) &&
		(scalarInputEvent.inputUnitMagnitude > 0.0)) {
			
		if (this.gameState.isInGameOverState()) {
			this.setupNewLevelState(this.currentLevelIndex);	
		}
		else if (this.gameState.isInGameCompletionState()) {
			this.setupNewLevelState(0);
		}
	}
}

/**
 * Configures all gameplay factors that are associated with the
 *  initiation of properly-functioning initial-state level
 *  environment.
 *
 * @param levelIndex {Number} Index of the level that is to be initialized
 *                            to an initial-state status
 */
MainSnowDuneBunnyGameplayScene.prototype.setupNewLevelState = function (levelIndex) {
	// The rabbit protagonist/snow tube initial has no velocity
	this.currentRabbitProtagonistVelocity = new Vector3d(0.0, 0.0, 0.0);
	
	this.gameState.setCurrentProtagonistFortitudeValue(this.constRabbitProtagonistMaxHealth);
	this.gameState.setOperationState(this.gameState.constOperationStateActive);
	this.gameState.setCurrentLevelIndex(levelIndex);	
	
	this.enemyInstanceDataCollection.splice(0);
	
	this.setupLevelEnvironment();
	
	// Starting position is always at the world "origin"
	var startPositionX = 0.0;
	var startPositionZ = -this.constTotalAssessedLevelMargin;
	this.rabbitProtagonistWorldPosition = new Point3d(0.0, 
		this.yCoordForRabbitProtagonistWithTerrainContact(startPositionX, startPositionZ),
		startPositionZ);
	this.rabbitProtagonistLaunchPoseMatrix.setToIdentity();
	this.rabbitProtagonistWorldPositionAdditionalOffset = new Point3d(0.0, 0.0, 0.0);
	this.gameState.invokeProtagonistGeneralInvulnerabilityPeriod(this.constGeneralInvulnerabilityDurationMs);
}

/**
 * Applies information pertinent to the new level to the
 *  internal level data store for the current game state
 */
MainSnowDuneBunnyGameplayScene.prototype.setupLevelEnvironment = function () {
	if (this.gameState.currentLevelIndex >= 0) {
		// Parse the loaded level...
		var rawLevelData = globalResources.getLoadedResourceDataByKey(this.levelKeyCollection[this.gameState.currentLevelIndex]);
		var levelSpecificationParser = new SpatialLevelSpecificationParser();
		levelSpecificationParser.addCustomLevelKey(this.levelProgressionRateMultiplierKey);
		levelSpecificationParser.parseSpatialLevelSpecificationBuffer(rawLevelData.resourceDataStore);

		var levelRepresentation = new LevelRepresentation(levelSpecificationParser);		
		// Set the scaling factors such that level symbol is equivalent to one
		// world space unit
		levelRepresentation.setScaleFactors(this.constWorldScale, this.constWorldScale, this.constWorldScale);		
		
		this.currentLevelRepresentation = levelRepresentation;

		this.setupDynamicLevelElements(levelRepresentation);
	}
}

/**
 * Instantiates dynamic level elements, as specified within the parsed
 *  level representation, within the active level instance data
 *
 * @param levelRepresentation {LevelRepresentation} Parsed level representation
 */
MainSnowDuneBunnyGameplayScene.prototype.setupDynamicLevelElements = function(levelRepresentation) {
	if (Utility.validateVarAgainstType(levelRepresentation, LevelRepresentation) &&
		(Utility.validateVar(levelRepresentation.dynamicInstanceInfoCollection))) {
			
		for (var currentInstanceInfo of levelRepresentation.dynamicInstanceInfoCollection) {			
			this.buildDynamicLevelElement(levelRepresentation, currentInstanceInfo);
		}
	}
}

/**
 * Constructs an instance of a dynamic level element, internally 
 *  storing the instance within the active level state data
 *  store
 *
 * @param instanceInfo {InstanceInfo} Parsed dynamic element
 *                                    instance data used to
 *                                    instantiate a game-state
 *                                    dynamic element
 *
 * @see SpatialLevelSpecificationParser
 */
MainSnowDuneBunnyGameplayScene.prototype.buildDynamicLevelElement = function(levelRepresentation, instanceInfo) {	
	if (Utility.validateVar(levelRepresentation) && Utility.validateVar(instanceInfo)) {		
		if (instanceInfo.tileAttributeData.elementType === this.constLevelSymbolTypeEnemySpecifier) {
			this.storeEnemyInstanceData(levelRepresentation, instanceInfo);
		}
		else if (instanceInfo.tileAttributeData.elementType === this.constLevelSymbolTypeGoalSpecifier) {
			this.storeGoalData(levelRepresentation, instanceInfo)
		}
	}
}

/**
 * Applies attributes to an active dynamic element instance
 *
 * @param dynamicElement {DynamicItemInstanceData/EnemyInstanceData} Dynamic element which
 *                                                                   will receive the applied
 *                                                                   instance data
 * @param instanceInfo {InstanceInfo} Parsed dynamic element
 *                                    instance data used to
 *                                    instantiate a game-state
 *                                    dynamic element
 */
MainSnowDuneBunnyGameplayScene.prototype.applyDynamicElementBaseAttributes = function (levelRepresentation, dynamicElement, instanceInfo) {
	// Center the grid at the middle of the world space coordinate system -
	// even-width grids should have an equal number of columns at the left
	// and right of the origin.
	var offsetX = -(levelRepresentation.getTileGridWidth() - 1) / 2.0
	
	dynamicElement.modelDataKey = this.levelBuiltInModelSymbolToModelKeyDict[instanceInfo.tileAttributeData.builtInModel];
	dynamicElement.modelWorldSpacePosition = new Point3d(instanceInfo.levelGridPosition.positionX + offsetX,
		0.0, instanceInfo.levelGridPosition.positionY);
}

/** 
 * Stores information retrieved from parsed level data
 *  as a usable object in the game state data store
 *  (enemy objects)
 * 
 * @param levelRepresentation {LevelRepresentation} Parsed level representation which contains
 *                                                  information pertaining to dynamic objects
 *                                                  and level layout
 * @param instanceInfo {InstanceInfo} Information, as sourced directly from a
 *                                    parsed level representation, which
 *                                    describes a dynamic object
 *
 * @see LevelRepresentation
 */
MainSnowDuneBunnyGameplayScene.prototype.storeEnemyInstanceData = function(levelRepresentation, instanceInfo) {
	var enemyInstanceData = new EnemyInstanceData();
	
	this.applyDynamicElementBaseAttributes(levelRepresentation, enemyInstanceData, instanceInfo);
		
	enemyInstanceData.velocityVector = new Vector3d(instanceInfo.tileAttributeData.initMovementVelocityHoriz,
		0.0, instanceInfo.tileAttributeData.initMovementVelocityZ);
	enemyInstanceData.contactDamage = instanceInfo.tileAttributeData.contactDamage;
	
	// Add a new property - tracking strength, which represents how much the
	// enemy will attempt to track the protagonist along the X-axis.
	if (Utility.validateVar(instanceInfo.tileAttributeData.trackingStrength)) {
		enemyInstanceData.trackingStrength = instanceInfo.tileAttributeData.trackingStrength;
	}
	else {
		enemyInstanceData.trackingStrength = 0.0;
	}
	
	this.enemyInstanceDataCollection.push(enemyInstanceData);
}

/** 
 * Reads level goal infomration from the level object, and
 *  retains it within the current game state information
 *  store
 *
 * @param levelRepresentation {LevelRepresentation} Parsed level representation which contains
 *                                                  information pertaining to dynamic objects
 *                                                  and level layout
 * @param instanceInfo {InstanceInfo} Information, as sourced directly from a
 *                                    parsed level representation, which
 *                                    describes a dynamic object
 *
 * @see LevelRepresentation
 */
MainSnowDuneBunnyGameplayScene.prototype.storeGoalData = function(levelRepresentation, instanceInfo) {	
	var dynamicInstanceData = new DynamicItemInstanceData();

	this.applyDynamicElementBaseAttributes(levelRepresentation, dynamicInstanceData, instanceInfo);
	
	this.levelEndPointCoordZ = instanceInfo.levelGridPosition.positionY;
	this.goalInstanceInfo = dynamicInstanceData;
}

/**
 * Determines if the provided dynamic object should be rendered
 *
 * @param dynamicObjectInstance {DynamicItemInstanceData} Information that represents
 *                                                        the dynamic object instance
 *
 * @return {boolean} True if the object should be rendered
 */
MainSnowDuneBunnyGameplayScene.prototype.isDynamicObjectInRenderRegion = function(instanceData) {
	var leadingDistance = instanceData.modelWorldSpacePosition.zCoord -
		this.rabbitProtagonistWorldPosition.zCoord;
	var trailingDistance = this.rabbitProtagonistWorldPosition.zCoord -
		instanceData.modelWorldSpacePosition.zCoord;
	return (this.maxDynamicObjectRenderWorldDistanceLeadingZ >= leadingDistance) &&
		(this.maxDynamicObjectRenderWorldDistanceTrailingZ >= trailingDistance);
}

/**
 * Evaluates all potential rabbit protagonist collisions,
 *  attempting to determine if a collision has occurred,
 *  applying the appropriate damage value as necessary
 */
MainSnowDuneBunnyGameplayScene.prototype.evaluateRabbitProtagonistEnemyCollisionDamage = function () {
	if (!this.gameState.protagonistIsInvulnerable) {
		var currentEnemyIndex = 0;
		var enemyWithIntersectingBoundingBox = null;
		
		var rabbitProtagonistBoundingBox = this.rabbitProtagonistBoundingBox();
		
		while ((enemyWithIntersectingBoundingBox === null) && (currentEnemyIndex < this.enemyInstanceDataCollection.length)) {
			var enemyInstanceBoundingBox = this.dynamicObjectBoundingBox(this.enemyInstanceDataCollection[currentEnemyIndex]);
			if (rabbitProtagonistBoundingBox.intersectsBox(enemyInstanceBoundingBox)) {
				enemyWithIntersectingBoundingBox = this.enemyInstanceDataCollection[currentEnemyIndex];
			}
			else {
				currentEnemyIndex++;
			}
		}
		
		if (enemyWithIntersectingBoundingBox !== null) {
			this.evaluateRabbitProtagonistDamage(enemyWithIntersectingBoundingBox.contactDamage);
		}
	}
}

/**
 * Applies a damage value to the rabbit protagonist
 *
 * @param damageMagnitude {number} The damage value to be applied
 */
MainSnowDuneBunnyGameplayScene.prototype.evaluateRabbitProtagonistDamage = function(damageMagnitude) {
	this.gameState.applyProtagonistDamage(damageMagnitude);
	this.gameState.invokeProtagonistGeneralInvulnerabilityPeriod(this.constGeneralInvulnerabilityDurationMs);
	
	if (this.gameState.isAtNonViableFortitudeValue() && this.gameState.isInActiveOperationState()) {
		this.gameState.setOperationState(this.gameState.constOperationStateInactive);
	}
	
	if (this.gameState.isInActiveOperationState()) {
		this.invokeRabbitProtagonistDamageAnimation();
	}
	else if (this.gameState.isInGameOverState()) {
		
	}
}

/**
 * Clears the flags which indicate whether or not pre-generated overlay
 *  texture content has been generated
 */
MainSnowDuneBunnyGameplayScene.prototype.clearOverlayContentGenerationFlags = function () {
	this.gameEndOverlayContentHasBeenGenerated = false;
	this.fadeOverlayContentHasBeenGenerated = false;
	this.gameCompletionOverlayContentHasBeenGenerated = false;
}

/**
 * Generates contents of the texture that will be used within the
 *  fade to black overlay implementation
 */
MainSnowDuneBunnyGameplayScene.prototype.generateFadeOverlayContent = function(webGlCanvasContext,
																			   targetCanvasContext,
																			   targetTexture) {
	if (Utility.validateVar(webGlCanvasContext) && Utility.validateVar(targetCanvasContext) &&
		Utility.validateVar(targetTexture)) {
			
		targetCanvasContext.clearRect(0, 0, targetCanvasContext.canvas.width, targetCanvasContext.canvas.height);

		WebGlUtility.updateDynamicTextureWithCanvas(webGlCanvasContext, targetTexture, targetCanvasContext.canvas);
	}
}

/**
 * Generates the render-space camera transformation matrix used
 *  to apply a camera view transformation to all rendered
 *  geometry that is not purposed as an overlay
 *
 * @return {MathExt.Matrix} Perspective transformation matrix
 */
MainSnowDuneBunnyGameplayScene.prototype.cameraMatrix = function() {
	// Adapted from "Breakdown of the LookAt function in OpenGL"
	// (https://www.geertarien.com/blog/2017/07/30/breakdown-of-the-lookAt-function-in-OpenGL/)
	
	var cameraLookAtRenderPosition = this.worldSpacePositionToRenderSpacePosition(
		this.cameraLookAtWorldPosition.xCoord, this.cameraLookAtWorldPosition.yCoord,
		this.cameraLookAtWorldPosition.zCoord);
	var cameraRenderPosition = this.worldSpacePositionToRenderSpacePosition(
		this.cameraWorldPosition.xCoord, this.cameraWorldPosition.yCoord,
		this.cameraWorldPosition.zCoord);
	var lookAtPointAsVector = new Vector3d(cameraLookAtRenderPosition.xCoord,
		cameraLookAtRenderPosition.yCoord, cameraLookAtRenderPosition.zCoord);
	var cameraPointAsVector = new Vector3d(cameraRenderPosition.xCoord,
		cameraRenderPosition.yCoord, cameraRenderPosition.zCoord);
		
		
	var zAxis = lookAtPointAsVector.subtractVector(cameraPointAsVector);
	zAxis.normalize();
	var cameraUpVector = zAxis.crossProduct(new Vector3d(1.0, 0.0, 0.0));
	var xAxis = zAxis.crossProduct(cameraUpVector);
	xAxis.normalize()
	var yAxis = xAxis.crossProduct(zAxis);

	var cameraMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount, this.constTransformationMatrixColumnCount);
	cameraMatrix.setElementValues(
		[
			new Float32Array([-xAxis.xComponent, 	xAxis.yComponent, 		xAxis.zComponent,		-xAxis.dotProduct(cameraPointAsVector) ]),
			new Float32Array([yAxis.xComponent, 	yAxis.yComponent, 		yAxis.zComponent,		-yAxis.dotProduct(cameraPointAsVector) ]),
			new Float32Array([zAxis.xComponent, 	zAxis.yComponent, 		zAxis.zComponent,		-zAxis.dotProduct(cameraPointAsVector) ]),
			new Float32Array([0.0, 					0.0, 					0.0,					1.0 ]),			
		]
	);

	return cameraMatrix;
}

/**
 * Generates the perspective transformation matrix used
 *  to apply a perspective transformation to all rendered
 *  geometry that is not purposed as an overlay
 *
 * @return {MathExt.Matrix} Perspective transformation matrix
 */
MainSnowDuneBunnyGameplayScene.prototype.perspectiveMatrix = function() {
	var perspectiveMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount, this.constTransformationMatrixColumnCount);	
	perspectiveMatrix.setToIdentity();
	
	var nearZ = -1.0;
	var farZ = 1.0;
	var bottomY = -1.0;
	var topY = 1.0;
	var leftX = -1.0;
	var rightX = 1.0;


	perspectiveMatrix.setElementValues(
		/*[
			new Float32Array([nearZ / rightX, 			0.0, 					0.0,										0.0 ]),
			new Float32Array([0.0,					nearZ/topY, 				0.0,										0.0 ]),
			new Float32Array([0.0,						0.0, 		-(farZ + nearZ) / (farZ - nearZ),		-2 * farZ * nearZ / (farZ - nearZ)]),
			new Float32Array([0.0, 						0.0, 					-1.0,										0.0])
		]*/
		[
			new Float32Array([1.0, 						0.0, 					0.0,										0.0 ]),
			new Float32Array([0.0,						1.0,	 				0.0,										0.0 ]),
			new Float32Array([0.0,						0.0, 					1.0,										0.0]),
			new Float32Array([0.0, 						0.0, 					1.0,										1.0])
		]
	);
	
	return perspectiveMatrix;
}

/**
 * Generates the content to be rendered within the full-screen overlay at the successful
 *  completion of the game
 *
 * @param webGlCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                   to a WebGL display buffer
 * @param targetCanvasContext {CanvasRenderingContext2D} Canvas context used to render the full-screen
 *                                                       overlay at the successful completion of the
 *                                                       game
 * @param targetTexture {WebGLTexture} Texture into which the data will finally be stored
 */
MainSnowDuneBunnyGameplayScene.prototype.generateCompletionOverlayContent = function(webGlCanvasContext,
																			    	 targetCanvasContext,
																				     targetTexture) {

	if (Utility.validateVar(webGlCanvasContext) && Utility.validateVar(targetCanvasContext) &&
		Utility.validateVar(targetTexture)) {
			
		targetCanvasContext.clearRect(0, 0, targetCanvasContext.canvas.width, targetCanvasContext.canvas.height);
		targetCanvasContext.fillStyle = this.gameEndOverlayBackgroundColor.getRgbaIntValueAsStandardString();
		targetCanvasContext.fillRect(0, 0, targetCanvasContext.canvas.width, targetCanvasContext.canvas.height);
				
		var gameCompletionTextBuffer = new StaticTextLineCanvasBuffer(Constants.gameCompletedFontSizePx,
			Constants.labelFont, Constants.labelFontStyle);
		gameCompletionTextBuffer.updateStaticTextString(Constants.stringGameCompleted);
		
		var gameCompletionDetailTextBuffer = new StaticTextLineCanvasBuffer(Constants.labelFontSizePx,
			Constants.labelFont, Constants.labelFontStyle);
		gameCompletionDetailTextBuffer.updateStaticTextString(Constants.stringGameCompletedDetail);
		
		var happyHolidaysTextBuffer = new StaticTextLineCanvasBuffer(Constants.labelFontSizePx,
			Constants.labelFont, Constants.labelFontStyle);
		happyHolidaysTextBuffer.updateStaticTextString(Constants.messageText);		

		var totalRequiredTextHeight = gameCompletionTextBuffer.requiredRenderingCanvasHeight() +
			gameCompletionDetailTextBuffer.requiredRenderingCanvasHeight() + 
			happyHolidaysTextBuffer.requiredRenderingCanvasHeight();
		var topCoord = (targetCanvasContext.canvas.height - totalRequiredTextHeight) / 2.0;
		
		var gameCompletionLeftCoord = (targetCanvasContext.canvas.width - gameCompletionTextBuffer.requiredRenderingCanvasWidth()) / 2.0;
		var gameCompletionDetailLeftCoord = (targetCanvasContext.canvas.width - gameCompletionDetailTextBuffer.requiredRenderingCanvasWidth()) / 2.0;			
		var happyHolidaysLeftCoord = (targetCanvasContext.canvas.width - happyHolidaysTextBuffer.requiredRenderingCanvasWidth()) / 2.0;

		gameCompletionTextBuffer.renderText(targetCanvasContext, gameCompletionLeftCoord, topCoord);
		gameCompletionDetailTextBuffer.renderText(targetCanvasContext, gameCompletionDetailLeftCoord,
			topCoord + gameCompletionTextBuffer.requiredRenderingCanvasHeight());
		happyHolidaysTextBuffer.renderText(targetCanvasContext, happyHolidaysLeftCoord,
			topCoord + gameCompletionTextBuffer.requiredRenderingCanvasHeight() +
			2.0 * gameCompletionDetailTextBuffer.requiredRenderingCanvasHeight());
			
		WebGlUtility.updateDynamicTextureWithCanvas(webGlCanvasContext, targetTexture, targetCanvasContext.canvas);			
	}
}

/**
 * Generates the content to be rendered within the full-screen overlay at the end of the
 *  game (failure)
 *
 * @param webGlCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                   to a WebGL display buffer
 * @param targetCanvasContext {CanvasRenderingContext2D} Canvas context used to render the full-screen
 *                                                       overlay at the end of the game
 * @param targetTexture {WebGLTexture} Texture into which the data will finally be stored
 */
MainSnowDuneBunnyGameplayScene.prototype.generateGameEndOverlayContent = function(webGlCanvasContext,
																				   targetCanvasContext,
																				   targetTexture) {
																						
	if (Utility.validateVar(webGlCanvasContext) && Utility.validateVar(targetCanvasContext) &&
		Utility.validateVar(targetTexture)) {

		targetCanvasContext.clearRect(0, 0, targetCanvasContext.canvas.width, targetCanvasContext.canvas.height);
		targetCanvasContext.fillStyle = this.gameEndOverlayBackgroundColor.getRgbaIntValueAsStandardString();
		targetCanvasContext.fillRect(0, 0, targetCanvasContext.canvas.width, targetCanvasContext.canvas.height);
		
		var gameOverTextBuffer = new StaticTextLineCanvasBuffer(Constants.gameOverFontSizePx,
			Constants.labelFont, Constants.labelFontStyle);
		gameOverTextBuffer.updateStaticTextString(Constants.stringGameOver);
		
		var happyHolidaysTextBuffer = new StaticTextLineCanvasBuffer(Constants.labelFontSizePx,
			Constants.labelFont, Constants.labelFontStyle);
		happyHolidaysTextBuffer.updateStaticTextString(Constants.messageText);
		
		var retryInstructionsTextBuffer = new StaticTextLineCanvasBuffer(Constants.labelFontSizePx,
			Constants.labelFont, Constants.labelFontStyle);
		retryInstructionsTextBuffer.updateStaticTextString(Constants.stringSpaceTapToRetry);

		var topCoord = (targetCanvasContext.canvas.height - (gameOverTextBuffer.requiredRenderingCanvasHeight() + 
			happyHolidaysTextBuffer.requiredRenderingCanvasHeight())) / 2.0;
		var gameOverLeftCoord = (targetCanvasContext.canvas.width - gameOverTextBuffer.requiredRenderingCanvasWidth()) / 2.0;
		var happyHolidaysLeftCoord = (targetCanvasContext.canvas.width - happyHolidaysTextBuffer.requiredRenderingCanvasWidth()) / 2.0;
		var retryInstructionsLeftCoord = (targetCanvasContext.canvas.width - retryInstructionsTextBuffer.requiredRenderingCanvasWidth()) / 2.0;
		var retryInstructionsBottomMargin = 20.0;

		gameOverTextBuffer.renderText(targetCanvasContext, gameOverLeftCoord, topCoord);
		happyHolidaysTextBuffer.renderText(targetCanvasContext, happyHolidaysLeftCoord,
			topCoord + gameOverTextBuffer.requiredRenderingCanvasHeight());		
		retryInstructionsTextBuffer.renderText(targetCanvasContext, retryInstructionsLeftCoord,
			targetCanvasContext.canvas.height - (retryInstructionsTextBuffer.requiredRenderingCanvasHeight() +
			retryInstructionsBottomMargin));

		WebGlUtility.updateDynamicTextureWithCanvas(webGlCanvasContext, targetTexture, targetCanvasContext.canvas);
	}
}

/**
 * Updates the internal timer employed to maintain the overlay refresh interval
 *
 * @param timeQuantum Time delta with respect to the previously-executed
 *                    animation step (milliseconds)
 */
MainSnowDuneBunnyGameplayScene.prototype.updateOverlayRefreshInterval = function(timeQuantum) {
	if (this.currentOverlayUpdateElapsedInterval < this.constOverlayUpdateIntervalMs) {
		this.currentOverlayUpdateElapsedInterval += timeQuantum;
	}
	else {
		this.currentOverlayUpdateElapsedInterval = 0;
	}
}

/**
 * Determines if overlay data should be updated, based upon internal factors
 *  (e.g. current overlay time counter)
 */
MainSnowDuneBunnyGameplayScene.prototype.shouldUpdateOverlay = function() {
	return this.currentOverlayUpdateElapsedInterval >= this.constOverlayUpdateIntervalMs;
}

/**
 * Renders the text buffer output to a specified canvas context
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param staticTextBuffer {StaticTextLineCanvasBuffer} Object that is used to store the rendered
 *                                                      text representation
 * @param coordX {Number} The starting location of the text along the X-axis within the
 *                        output texture
 * @param targetCanvasContext {CanvasRenderingContext2D} The output canvas context
 *                                                       to which the text buffer
 *                                                       will be rendered
 * @param targetTexture {WebGLTexture} The texture in which the buffer will be finally store
 * @param webGlCanvasContext {WebGLRenderingContext2D} A WebGL rendering context used for
 *                                                     writing the final output into a texture
 * @param drawBackground {Boolean} When set to true, a solid background will be drawn
 *                                 before the text is drawn.
 */
MainSnowDuneBunnyGameplayScene.prototype.renderStaticTextBufferToTexture = function(timeQuantum, staticTextBuffer, coordX,
																				   targetCanvasContext, targetTexture,
																				   webGlCanvasContext, drawBackground) {
				
	if (Utility.validateVar(timeQuantum) && Utility.validateVarAgainstType(staticTextBuffer, StaticTextLineCanvasBuffer) &&
		Utility.validateVar(targetCanvasContext) && Utility.validateVar(webGlCanvasContext) &&
		Utility.validateVar(targetTexture)) {
			
		// Clear the background of the area where the text will be rendered...
		targetCanvasContext.clearRect(coordX, 0, staticTextBuffer.requiredRenderingCanvasWidth(),
			staticTextBuffer.requiredRenderingCanvasHeight());
	
		// Draw a background strip in order to enhance readability.
		if (Utility.validateVar(drawBackground) && drawBackground) {
			targetCanvasContext.save();
			targetCanvasContext.fillStyle = this.defaultTextAreaBackgroundColor.getRgbaIntValueAsStandardString();
			
			targetCanvasContext.fillRect(0, 0, targetCanvasContext.canvas.width, staticTextBuffer.getTextAreaHeight());
				
			targetCanvasContext.restore();
		}
		
		staticTextBuffer.renderText(targetCanvasContext, coordX, 0);
	
		WebGlUtility.updateDynamicTextureWithCanvas(webGlCanvasContext, targetTexture, targetCanvasContext.canvas);
	}
}

/**
 * Renders a representation of the immediate spirit gauge level into
 *  the provided canvas context
 *
 * @param targetCanvasContext {CanvasRenderingContext2D}  Canvas into which the spirit gauge will
 *                                                        be rendered
 * @param spiritGaugeWidth {Number} The width of the spirit gauge
 * @param spiritGaugeHeight {Number} The height of the spirit gauge
 * @param spiritGaugeOffsetX {Number} The gauge offset from the left edge of the screen
 */
MainSnowDuneBunnyGameplayScene.prototype.updateSpiritGaugeMagnitudeRepresentation = function (targetCanvasContext,
																							  spiritGaugeWidth,
																							  spiritGaugeHeight,
																							  spiritGaugeOffsetX) {

	if (Utility.validateVar(targetCanvasContext) && Utility.validateVar(spiritGaugeWidth) &&
		Utility.validateVar(spiritGaugeHeight) && Utility.validateVar(spiritGaugeOffsetX)) {

		var spiritGaugeBorderSizeX = 5;
		var spiritGaugeBorderSizeY = 4;
		
		var gaugeSegmentSpacing = 3;
		var gaugeSegmentWidth = 7;

		// Erase the existing spirit gauge rendering.
		targetCanvasContext.fillStyle = this.constCanvasClearColor.getRgbaIntValueAsStandardString();
		targetCanvasContext.fillRect(spiritGaugeOffsetX + this.constOverlayTextLeftMargin, 0, spiritGaugeWidth,
			spiritGaugeHeight);
			
		targetCanvasContext.strokeStyle = this.constSpiritGaugeOutlineColor.getRgbaIntValueAsStandardString();
		targetCanvasContext.strokeRect(spiritGaugeOffsetX + this.constOverlayTextLeftMargin, 0, spiritGaugeWidth,
			spiritGaugeHeight);

		spiritValueForGaugeDisplay = Math.max(Math.min(this.gameState.currentProtagonistFortitudeValue,
			this.gameState.maxProtagonistFortitudeValue), this.gameState.minProtagonistFortitudeValue);
		var spiritValueFraction = (spiritValueForGaugeDisplay - this.gameState.minProtagonistFortitudeValue) /
			(this.gameState.maxProtagonistFortitudeValue - this.gameState.minProtagonistFortitudeValue);

		var innerGaugeLeftCoord = spiritGaugeOffsetX + this.constOverlayTextLeftMargin + spiritGaugeBorderSizeX +
			Math.floor(gaugeSegmentSpacing / 2.0);
		var innerGaugeMaxWidth = spiritGaugeWidth - (2 * spiritGaugeBorderSizeX);
		var innerGaugeWidth = Math.max(0.0, (Math.floor((spiritGaugeWidth - (2 * spiritGaugeBorderSizeX)) * spiritValueFraction)));
		
		var gaugeSegmentCount = Math.ceil(innerGaugeWidth / (gaugeSegmentSpacing + gaugeSegmentWidth));
		var maxGaugeSegmentCount = Math.ceil(innerGaugeMaxWidth / (gaugeSegmentSpacing + gaugeSegmentWidth));
		
		for (var currentSegmentIndex = 0; currentSegmentIndex < gaugeSegmentCount; currentSegmentIndex++) {
			var colorWeight = Math.pow(currentSegmentIndex / (maxGaugeSegmentCount - 1), 0.5);
			var gaugeColor = this.constSpiritGaugeMinValueColor.blendWithUnitWeight(this.constSpiritGaugeMaxValueColor,
				colorWeight);
			targetCanvasContext.fillStyle = gaugeColor.getRgbaIntValueAsStandardString();
			var segmentLeadingEdgeX = innerGaugeLeftCoord + ((gaugeSegmentSpacing + gaugeSegmentWidth) * currentSegmentIndex);
			targetCanvasContext.fillRect(segmentLeadingEdgeX, spiritGaugeBorderSizeY, gaugeSegmentWidth,
				spiritGaugeHeight - (2 * spiritGaugeBorderSizeY));
		}
	}
}

/**
 * Clears the target alpha buffer, preventing compositing of the
 * output with the canvas - should be invoked at the end of the
 *  immediate frame
 *
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainSnowDuneBunnyGameplayScene.prototype.clearAlpha = function(targetCanvasContext) {
	// Clear alpha
	targetCanvasContext.clearColor(1.0, 1.0, 1.0, 1.0);
	targetCanvasContext.colorMask(false, false, false, true);
	targetCanvasContext.clear(targetCanvasContext.COLOR_BUFFER_BIT);
}

/**
 * Renders the "Game Over" overlay
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainSnowDuneBunnyGameplayScene.prototype.renderGameEndOverlay = function(timeQuantum, targetCanvasContext) {
	if (this.gameState.isInGameOverState()) {
		if (!this.gameEndOverlayContentHasBeenGenerated) {
			this.clearOverlayContentGenerationFlags();
			var gameEndOverlayCanvasContext = globalResources.getFullScreenOverlayCanvasContext();
			var gameEndOverlayTexture = globalResources.getFullScreenOverlayTexture();
			this.generateGameEndOverlayContent(targetCanvasContext, gameEndOverlayCanvasContext,
				gameEndOverlayTexture);
			this.gameEndOverlayContentHasBeenGenerated = true;
		}
		
		var fullScreenOverlayTexture = globalResources.getFullScreenOverlayTexture();
		var overlayRenderWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(
			this.fullScreenOverlayWebGlData, this.shaderStandardOverlayTextureRender);
		
		var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
			this.constTransformationMatrixColumnCount);
		transformationMatrix.setToIdentity();
		var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(true);
		var webGlAttributeData = this.getDefaultWebGlAttributeData();		
		WebGlUtility.renderGeometry(overlayRenderWebGlData, transformationMatrix, transformationMatrix,
			fullScreenOverlayTexture, targetCanvasContext, webGlAttributeLocationData, webGlAttributeData);
	}
}


/**
 * Renders the overlay that indicates successfully completion of the game
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainSnowDuneBunnyGameplayScene.prototype.renderGameCompletionOverlay = function(timeQuantum, targetCanvasContext) {
	if (this.gameState.isInGameCompletionState()) {
		if (!this.gameCompletionOverlayContentHasBeenGenerated) {
			this.clearOverlayContentGenerationFlags();
			var gameCompletionOverlayCanvasContext = globalResources.getFullScreenOverlayCanvasContext();
			var gameCompletionOverlayTexture = globalResources.getFullScreenOverlayTexture();
			this.generateCompletionOverlayContent(targetCanvasContext, gameCompletionOverlayCanvasContext,
				gameCompletionOverlayTexture);
			this.gameCompletionOverlayContentHasBeenGenerated = true;					
		}

		var fullScreenOverlayTexture = globalResources.getFullScreenOverlayTexture();
		var overlayRenderWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(
			this.fullScreenOverlayWebGlData, this.shaderStandardOverlayTextureRender);
			
		var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
			this.constTransformationMatrixColumnCount);
		transformationMatrix.setToIdentity();
		var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(true);
		var webGlAttributeData = this.getDefaultWebGlAttributeData();		
		WebGlUtility.renderGeometry(overlayRenderWebGlData, transformationMatrix, transformationMatrix,
			fullScreenOverlayTexture, targetCanvasContext, webGlAttributeLocationData, webGlAttributeData);
		}
}

/**
 * Renders the overlay used to employ a "fade" transition
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainSnowDuneBunnyGameplayScene.prototype.renderFadeOverlay = function(timeQuantum, targetCanvasContext) {
	if (this.fadeTransitionController.isTransitionInProgress()) {
		var fadeOverlayCanvasContext = globalResources.getFullScreenOverlayCanvasContext();
		
		if (!this.fadeOverlayContentHasBeenGenerated) {
			this.clearOverlayContentGenerationFlags();
			var fadeOverlayTexture = globalResources.getFullScreenOverlayTexture();
			this.generateFadeOverlayContent(targetCanvasContext, fadeOverlayCanvasContext,
				fadeOverlayTexture);
			this.fadeOverlayContentHasBeenGenerated = true;
		}
		
		var fullScreenOverlayTexture = globalResources.getFullScreenOverlayTexture();
		var overlayRenderWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(
			this.fullScreenOverlayWebGlData, this.shaderBlackFader);
		
		var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
			this.constTransformationMatrixColumnCount);
		transformationMatrix.setToIdentity();
		var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(true);
		var webGlAttributeData = this.getDefaultWebGlAttributeData();
		
		var fadeFraction = this.fadeTransitionController.getBlackFadeFraction();
		function fadeUniformSetupFadeFraction(shaderProgram) {
			var fadeFractionUniformLocation = targetCanvasContext.getUniformLocation(shaderProgram, "fadeFraction");
				targetCanvasContext.uniform1f(fadeFractionUniformLocation, fadeFraction);
		}
		
		WebGlUtility.renderGeometry(overlayRenderWebGlData, transformationMatrix, transformationMatrix,
			fullScreenOverlayTexture, targetCanvasContext, webGlAttributeLocationData, webGlAttributeData,
			fadeUniformSetupFadeFraction);
	}
}

/**
 * Renders the Spirit meter overlay
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainSnowDuneBunnyGameplayScene.prototype.renderSpiritGaugeOverlay = function(timeQuantum, targetCanvasContext) {
	var spiritGaugeOverlayTexture = globalResources.getGaugeOverlayTexture();
	if (this.shouldUpdateOverlay()) {
		var gaugeOverlayCanvasContext = globalResources.getGaugeOverlayCanvasContext();
		var spiritGaugeHeightDifference = 5;
		var spiritGaugeHeight = gaugeOverlayCanvasContext.canvas.height - spiritGaugeHeightDifference;
		var spiritLabelTrailingMargin = 10.0;
		
		gaugeOverlayCanvasContext.clearRect(0, 0, gaugeOverlayCanvasContext.canvas.width,
			gaugeOverlayCanvasContext.canvas.height);
		this.updateSpiritGaugeMagnitudeRepresentation(gaugeOverlayCanvasContext, this.constSpiritGaugeWidth,
			spiritGaugeHeight, this.spiritLabelCanvasBuffer.requiredRenderingCanvasWidth() + spiritLabelTrailingMargin)		
		this.renderStaticTextBufferToTexture(timeQuantum, this.spiritLabelCanvasBuffer, this.constOverlayTextLeftMargin,
			gaugeOverlayCanvasContext, spiritGaugeOverlayTexture, targetCanvasContext, true);
	}
	
	var overlayRenderWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(	
		this.gaugeOverlayRenderWebGlData, this.shaderStandardOverlayTextureRender);
	
	var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	transformationMatrix.setToIdentity();
	var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(true);
	var webGlAttributeData = this.getDefaultWebGlAttributeData();
	WebGlUtility.renderGeometry(overlayRenderWebGlData, transformationMatrix, transformationMatrix,
		spiritGaugeOverlayTexture, targetCanvasContext, webGlAttributeLocationData, webGlAttributeData);
}

/**
 * Renders the rabbit protagonist
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which the
 *                            							the rabbit protagonist will be rendered
 */
MainSnowDuneBunnyGameplayScene.prototype.renderRabbitProtagonist = function(timeQuantum, targetCanvasContext) {
	var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(false);
	var webGlAttributeData = this.getDefaultWebGlAttributeData();
	
	var webGlBufferData = this.webGlBufferDataKeyValStore[globalResources.keyModelRabbitProtagonist];
	rabbitRenderWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(
		webGlBufferData, this.shaderPointLightStandardObject);

	var baseMatrix = this.rabbitProtagonistPoseMatrix.multiply(
		this.rabbitProtagonistLaunchPoseMatrix.multiply(
		this.modelBaseMatrixKeyValStore[globalResources.keyModelRabbitProtagonist]));
	
	var finalTransformationMatrix = Utility.validateVar(baseMatrix)
		? this.generateOriginBasedRenderSpaceMatrix().multiply(
		  this.generateRabbitProtagonistTransformationMatrix().multiply(baseMatrix))
		: null;
		
	finalTransformationMatrix = this.cameraMatrix().multiply(finalTransformationMatrix);
	
	WebGlUtility.renderGeometry(rabbitRenderWebGlData, finalTransformationMatrix,
		this.perspectiveMatrix(), null, targetCanvasContext, webGlAttributeLocationData,
		webGlAttributeData, this.pointLightUniformSetupFunction(targetCanvasContext, "Rabbit", this));
}

/**
 * Renders the snow tube associated with the rabbit protagonist
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which the
 *                            							the snow tube will be rendered
 */
MainSnowDuneBunnyGameplayScene.prototype.renderSnowTube = function(timeQuantum, targetCanvasContext) {
	var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(false);
	var webGlAttributeData = this.getDefaultWebGlAttributeData();
	
	var webGlBufferData = this.webGlBufferDataKeyValStore[globalResources.keyModelSnowTube];
	snowTubeRenderWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(
		webGlBufferData, this.shaderPointLightStandardObject);

	var baseMatrix = this.modelBaseMatrixKeyValStore[globalResources.keyModelSnowTube];
	
	var finalTransformationMatrix = Utility.validateVar(baseMatrix)
		? this.generateOriginBasedRenderSpaceMatrix().multiply(
		  this.generateSnowTubeTransformationMatrix().multiply(
		  this.snowTubePerturbationMatrix.multiply(baseMatrix)))
		: null;
	
	finalTransformationMatrix = this.cameraMatrix().multiply(finalTransformationMatrix);
	
	WebGlUtility.renderGeometry(snowTubeRenderWebGlData, finalTransformationMatrix,
		this.perspectiveMatrix(), null, targetCanvasContext, webGlAttributeLocationData,
		webGlAttributeData, null);
}

/**
 * Renders the rabbit protagonist and the snow tube
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which the
 *                            							the rabbit protagonist and snow
 *                                                      tube will be rendered
 */
MainSnowDuneBunnyGameplayScene.prototype.renderCompositeRabbitProtagonist = function(timeQuantum, targetCanvasContext) {
	if (this.shouldRenderRabbitProtagonist()) {
		this.renderRabbitProtagonist(timeQuantum, targetCanvasContext);
		this.renderSnowTube(timeQuantum, targetCanvasContext);
	}
}

/**
 * Renders all dynamic objects
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which the
 *                            							the rabbit protagonist and snow
 *                                                      tube will be rendered
 */
MainSnowDuneBunnyGameplayScene.prototype.renderDynamicObjects = function(timeQuantum, targetCanvasContext) {
	this.renderEnemyObjects(timeQuantum, targetCanvasContext);
	this.renderGoalObject(timeQuantum, targetCanvasContext);
}

/**
 * Renders all enemy objects
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which the
 *                            							the enemy objects will be rendered
 */
MainSnowDuneBunnyGameplayScene.prototype.renderEnemyObjects = function(timeQuantum, targetCanvasContext)  {
	for (var enemyInstanceData of this.enemyInstanceDataCollection) {
		if (this.isDynamicObjectInRenderRegion(enemyInstanceData)) {
			this.renderDynamicObject(timeQuantum, targetCanvasContext, enemyInstanceData);
		}
	}
}

/**
 * Renders all dynamic objects/enemies
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which the
 *                            							the objects will be rendered
 */
MainSnowDuneBunnyGameplayScene.prototype.renderGoalObject = function(timeQuantum, targetCanvasContext) {
	if ((this.goalInstanceInfo != null) && this.isDynamicObjectInRenderRegion(this.goalInstanceInfo)) {
		this.renderDynamicObject(timeQuantum, targetCanvasContext, this.goalInstanceInfo);
	}
}


/**
 * Renders a single dynamic element/enemy
 *
 * @param element {DynamicItemInstanceData/EnemyInstanceData} Dynamic object representation to be rendered
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 * @param enemyInstanceData {EnemyInstanceData} Data which represents a single enemy instance
 * @param alternateTransformationMatrix {MathExt.Matrix} Optional - an alternate matrix that will serve
 *                                                       as the base transformation matrix, as
 *                                                       opposed to the pre-determined base
 *                                                       transformation matrix within the internal
 *                                                       model base transformation matrix key-value
 *                                                       store (can be used to apply customized
 *                                                       element orientation)
 */
MainSnowDuneBunnyGameplayScene.prototype.renderDynamicObject = function(timeQuantum, targetCanvasContext, dynamicObjectInstanceData,
	alternateTransformationMatrix)  {

	if (Utility.validateVar(dynamicObjectInstanceData)) {
		var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(false);		
		var webGlAttributeData = this.getDefaultWebGlAttributeData();
		var webGlBufferData = this.webGlBufferDataKeyValStore[dynamicObjectInstanceData.modelDataKey];

		var elementWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(
			webGlBufferData, this.shaderPointLightStandardObjectFade);

		var baseMatrix = Utility.validateVar(alternateTransformationMatrix) ?
			alternateTransformationMatrix : this.modelBaseMatrixKeyValStore[dynamicObjectInstanceData.modelDataKey];
	
		var renderSpacePosition = this.worldSpacePositionToRenderSpacePosition(
			dynamicObjectInstanceData.modelWorldSpacePosition.xCoord,
			dynamicObjectInstanceData.modelWorldSpacePosition.yCoord,
			dynamicObjectInstanceData.modelWorldSpacePosition.zCoord);
			
		var translationMatrix = MathUtility.generateTranslationMatrix3d(renderSpacePosition.xCoord,
			renderSpacePosition.yCoord,
			renderSpacePosition.zCoord);

		var finalTransformationMatrix = Utility.validateVar(baseMatrix)
			? this.generateOriginBasedRenderSpaceMatrix().multiply(
			  translationMatrix.multiply(baseMatrix))
			: null;

		finalTransformationMatrix = this.cameraMatrix().multiply(finalTransformationMatrix);
	
		WebGlUtility.renderGeometry(elementWebGlData, finalTransformationMatrix, this.perspectiveMatrix(),
			null, targetCanvasContext, webGlAttributeLocationData, webGlAttributeData,
			this.pointLightUniformSetupFunction(targetCanvasContext, "DynamicElement", this));
	}	
}

MainSnowDuneBunnyGameplayScene.prototype.debugDumpHeightMap = function () {
	if (typeof this.surfaceControlPointHeightMap !== "undefined") {
		console.log("-------");	
		for (var line = 0; line < 16; line++) {
			var textLine = line + " - ";
			for (var innerLine = 0; innerLine < 16; innerLine++) {
				textLine += (this.surfaceControlPointHeightMap[line * 16 + innerLine] + ",");
			}
			console.log(textLine);
		}

		console.log("=======");
	}
}

MainSnowDuneBunnyGameplayScene.prototype.debugDumpActiveTerrainHeightRegion = function () {
	console.log("vvvvvvv");	

	for (var zLoop = (this.constSurfaceControlPointCountZ - 1); zLoop >= 0; zLoop--) {
		var textLine = zLoop + " - ";		
		for (var xLoop = 0; xLoop < this.constSurfaceControlPointCountX; xLoop++) {				
			var yCoord = this.controlPointHeightAtWorldSpacePosition(new Point3d(xLoop,
				0.0, Math.floor(this.controlPointHeightMapMinCoordZ() + zLoop)));
			textLine += (this.worldSpaceLengthToRenderSpaceLength(yCoord) + ",");
		}
		console.log(textLine);
	}

	console.log("^^^^^^^");
}

/**
 * Renders the sky backdrop
 *
 * @param element {DynamicItemInstanceData/EnemyInstanceData} Dynamic object representation to be rendered
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainSnowDuneBunnyGameplayScene.prototype.renderSkyBackdrop = function(timeQuantum, targetCanvasContext) {
	var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(true);	
	var webGlAttributeData = this.getDefaultWebGlAttributeData();

	var skybackdropRenderWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(
		this.webGlBufferDataSkyBackdrop, this.shaderSkyBackdrop);

	var finalTransformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount, this.constTransformationMatrixColumnCount);	
	finalTransformationMatrix.setToIdentity();
	var useDaytimeSkyColors = (this.currentLevelRepresentation.guideLightIntensity < this.pointLightIntensityDuskTransition)
	var skyStartColor = useDaytimeSkyColors ? this.skyStartColor : this.skyDuskStartColor;
	var skyEndColor = useDaytimeSkyColors ? this.skyEndColor : this.skyDuskEndColor;
	var cloudColor = this.cloudColor;
	var skyNoiseHorizOffset = 0.0;
	var skyNoiseVertOffset = -this.rabbitProtagonistWorldPosition.zCoord / this.constSkyOffsetPositionDivisor;
	
	function skyAttrUniformSetup(shaderProgram) {
		var startColorUniformLocation = targetCanvasContext.getUniformLocation(shaderProgram, "uniform_skyStartColor");
		targetCanvasContext.uniform4fv(startColorUniformLocation, [skyStartColor.getRedValue(),
			skyStartColor.getGreenValue(), skyStartColor.getBlueValue(), skyStartColor.getAlphaValue()]);

		var endColorUniformLocation = targetCanvasContext.getUniformLocation(shaderProgram, "uniform_skyEndColor");
		targetCanvasContext.uniform4fv(endColorUniformLocation, [skyEndColor.getRedValue(),
			skyEndColor.getGreenValue(), skyEndColor.getBlueValue(), skyEndColor.getAlphaValue()]);
		
		var cloudColorUniformLocation = targetCanvasContext.getUniformLocation(shaderProgram, "uniform_cloudColor");
		targetCanvasContext.uniform4fv(cloudColorUniformLocation, [cloudColor.getRedValue(),
			cloudColor.getGreenValue(), cloudColor.getBlueValue(), cloudColor.getAlphaValue()]);
	
		var skyHorizOffsetUniformLocation = targetCanvasContext.getUniformLocation(shaderProgram, "uniform_skyNoiseHorizOffset");
		targetCanvasContext.uniform1f(skyHorizOffsetUniformLocation, skyNoiseHorizOffset);

		var skyVertOffsetUniformLocation = targetCanvasContext.getUniformLocation(shaderProgram, "uniform_skyNoiseVertOffset");
		targetCanvasContext.uniform1f(skyVertOffsetUniformLocation, skyNoiseVertOffset);		
	}

	WebGlUtility.renderGeometry(skybackdropRenderWebGlData, finalTransformationMatrix, finalTransformationMatrix,
		null, targetCanvasContext, webGlAttributeLocationData, webGlAttributeData, skyAttrUniformSetup);
}

/**
 * Renders the Bézier surface terrain
 *
 * @param element {DynamicItemInstanceData/EnemyInstanceData} Dynamic object representation to be rendered
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainSnowDuneBunnyGameplayScene.prototype.renderTerrain = function(timeQuantum, targetCanvasContext) {
	var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(true);
	var webGlAttributeData = this.getDefaultWebGlAttributeData();

	var terrainRenderWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(
		this.webGlBufferDataTerrain, this.shaderBezierSurfaceTerrain);
	
	// Normals are computed within the vertex shader.
	terrainRenderWebGlData.webGlVertexNormalBuffer = null;

	var finalTransformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount, this.constTransformationMatrixColumnCount);	
	finalTransformationMatrix.setToIdentity();
	var surfaceNoiseVertOffset = -this.rabbitProtagonistWorldPosition.zCoord;

	var sceneInstance = this;
	var controlPointHeightMap = this.surfaceControlPointHeightMap;
	var controlPointOffsetFractionZ = 1.0 - (this.controlPointHeightMapDecimalMinCoordZ() - this.controlPointHeightMapMinCoordZ());
	function controlPointsUniformSetup(shaderProgram) {
		for (var currentIndex = 0; currentIndex < controlPointHeightMap.length; currentIndex++) {
			var controlPointsUniformLocation = targetCanvasContext.getUniformLocation(shaderProgram, "uniform_controlPointHeightMap");
			targetCanvasContext.uniform1fv(controlPointsUniformLocation, new Float32Array(controlPointHeightMap));
			
			var surfaceNoiseOffsetUniformLocation = targetCanvasContext.getUniformLocation(shaderProgram, "uniform_surfaceNoiseVertOffset");			
			targetCanvasContext.uniform1f(surfaceNoiseOffsetUniformLocation, surfaceNoiseVertOffset);

			var controlPointOffsetZUniformLocation = targetCanvasContext.getUniformLocation(shaderProgram, "uniform_controlPointOffsetZ");
			targetCanvasContext.uniform1f(controlPointOffsetZUniformLocation, controlPointOffsetFractionZ);
		}
		
		sceneInstance.pointLightUniformSetupFunction(targetCanvasContext, "terrain", sceneInstance)(shaderProgram);
	}

	WebGlUtility.renderGeometry(terrainRenderWebGlData, finalTransformationMatrix, this.perspectiveMatrix().multiply(this.cameraMatrix()),
		null, targetCanvasContext, webGlAttributeLocationData, webGlAttributeData, controlPointsUniformSetup);
}

/**
 * Function used to set shader uniform values for point light evaluation
 *
 * @param sceneInstance {MainSnowDuneBunnyGameplayScene} Reference to the game
 *                                                       implementation instance
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            						the scene data will be rendered
 *
 * @see WebGlUtility.renderGeometry
 */
MainSnowDuneBunnyGameplayScene.prototype.pointLightUniformSetupFunction = function (targetCanvasContext, lookUpKey, sceneInstance) {
	var pointLightHeight = this.constScaleFactorDefaultRabbitProtagonist;
	var pointLightContribution = this.currentLevelRepresentation.guideLightIntensity;
	return function (shaderProgram) {
		
		//var pointLightContributionFractionUniform = targetCanvasContext.getUniformLocation(shaderProgram, "uniform_pointLightContributionFraction");
		var pointLightContributionFractionUniform = sceneInstance.resolveCachedUniformLocation(targetCanvasContext, lookUpKey, shaderProgram, "uniform_pointLightContributionFraction");
		targetCanvasContext.uniform1f(pointLightContributionFractionUniform, pointLightContribution);
		
		var pointLightColor = sceneInstance.rabbitProtagonistGuideLightColor();
		//var pointLightColorUniformLocation = targetCanvasContext.getUniformLocation(shaderProgram, "uniform_pointLightColor");
		var pointLightColorUniformLocation = sceneInstance.resolveCachedUniformLocation(targetCanvasContext, lookUpKey, shaderProgram, "uniform_pointLightColor");
		targetCanvasContext.uniform4fv(pointLightColorUniformLocation, [pointLightColor.getRedValue(),
			pointLightColor.getGreenValue(), pointLightColor.getBlueValue(), pointLightColor.getAlphaValue()]);

		// Position the point light at the world-space location of the rabbit protagonist,
		// using the base protagonist height (height of the torso section). Otherwise,
		// the point light will not be properly cast onto the ground plane.
		var pointLightRenderSpaceLocation = sceneInstance.worldSpacePositionToRenderSpacePosition(
			sceneInstance.rabbitProtagonistWorldPosition.xCoord,
			pointLightHeight,
			sceneInstance.rabbitProtagonistWorldPosition.zCoord - (sceneInstance.rabbitProtagonistWorldPosition.zCoord -
			sceneInstance.constRabbitProtagonistPresentOffsetWorldCoordZ));
		//var pointLightLocationUniformLocation = targetCanvasContext.getUniformLocation(shaderProgram, "uniform_pointLightPosition");
		var pointLightLocationUniformLocation = sceneInstance.resolveCachedUniformLocation(targetCanvasContext, lookUpKey, shaderProgram, "uniform_pointLightPosition");
		targetCanvasContext.uniform3fv(pointLightLocationUniformLocation, [ pointLightRenderSpaceLocation.xCoord,
			pointLightRenderSpaceLocation.yCoord, pointLightRenderSpaceLocation.zCoord ]);
	}	
}

/**
 * Performs a shader uniform location look-up, caching the result,
 *  and returning the result on subsequent invocations.
 *
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 * @param lookUpKey {String} A key that will be used to uniquely associate
 *                           the uniform with the shader
 * @param shaderProgram {WebGLShader} The shader program on which the look-up
 *                                    will be performed if it is not contained
 *                                    within the cache
 * @param uniformName {String} The name of the uniform to look-up
 *
 * @return {WebGLUniformLocation} A WebGL uniform location
 */
MainSnowDuneBunnyGameplayScene.prototype.resolveCachedUniformLocation = function(targetCanvasContext, lookUpKey, shaderProgram, uniformName) {
	var uniformLocation = null;
	
	if (!Utility.validateVar(this.uniformLocationCache[lookUpKey])) {
		this.uniformLocationCache[lookUpKey] = {};
	}
	
	uniformLocation = this.uniformLocationCache[lookUpKey][uniformName];
	
	if (!Utility.validateVar(uniformLocation)) {
		var uniformLocation = targetCanvasContext.getUniformLocation(shaderProgram, uniformName);
		this.uniformLocationCache[lookUpKey][uniformName] = uniformLocation;
	}
	
	return uniformLocation;
}

/**
 * Renders all game overlays
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainSnowDuneBunnyGameplayScene.prototype.renderOverlayBitmaps = function(timeQuantum, targetCanvasContext) {
	this.renderSpiritGaugeOverlay(timeQuantum, targetCanvasContext);
	this.renderGameEndOverlay(timeQuantum, targetCanvasContext);
	this.renderGameCompletionOverlay(timeQuantum, targetCanvasContext);
	this.renderFadeOverlay(timeQuantum, targetCanvasContext);
}

/**
 * Renders the primary, texture-based portion of the scene
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainSnowDuneBunnyGameplayScene.prototype.renderScene = function(timeQuantum, targetCanvasContext) {	
	var sceneInstance = this;
	
	targetCanvasContext.colorMask(true, true, true, true);
	targetCanvasContext.clear(targetCanvasContext.COLOR_BUFFER_BIT);
	sceneInstance.renderSkyBackdrop(timeQuantum, targetCanvasContext);
	sceneInstance.renderTerrain(timeQuantum, targetCanvasContext);
	sceneInstance.renderCompositeRabbitProtagonist(timeQuantum, targetCanvasContext);
	sceneInstance.renderDynamicObjects(timeQuantum, targetCanvasContext);
	sceneInstance.renderOverlayBitmaps(timeQuantum, targetCanvasContext);

	sceneInstance.clearAlpha(targetCanvasContext);
}

/**
 * Executes a time-parameterized single scene animation step
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            the scene data will be drawn
 */
MainSnowDuneBunnyGameplayScene.prototype.executeStep = function(timeQuantum, targetCanvasContext) {
	// Game state changes are dependent upon successively
	// performing evaluations using time quanta. If a time quantum
	// is unusually large, anamolous game state behavior may
	// occur (e.g., evaluation of excessively-high bouncing
	// velocities). Limit the reported time quantum magnitude.
	var effectiveTimeQuantum = Math.min(this.maxExpressibleTimeQuantum, timeQuantum);
	
	this.renderScene(effectiveTimeQuantum, targetCanvasContext);
	this.updateStateInformationForWorldObjects(effectiveTimeQuantum);
	this.updateTerrain(effectiveTimeQuantum);
	this.updateGameState(effectiveTimeQuantum);

	this.totalElapsedSceneTimeMs += timeQuantum;
}