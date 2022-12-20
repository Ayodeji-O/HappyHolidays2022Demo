// InternalConstants.js - Contains common constants used within various classes/routines
// Author: Ayodeji Oshinnaiye

var Constants = {
	/**
	 * When set to true, unit tests will always be
	 *  executed upon loading of the entry point
	 */
	runTestsAtProgramCommencement: false,
	
	
	/**
	 * Width of front buffer canvas (and associated
	 *  backbuffer canvases)
	 */
	defaultCanvasWidth : 960,
	
	/**
	 * Height of front buffer canvas (and associated
	 *  backbuffer canvases)
	 *
	 */
	defaultCanvasHeight : 720,
	
	/**
	 * Width of the internally-stored image bitmap
	 *  representation of each source image
	 */
	internalBitmapWidth : 1024,
	
	/**
	 * Height of the internally-stored image bitmap
	 *  representation of each source image
	 */
	internalBitmapHeight: 1024,
			
	/**
	 * Width of the texture that will be used as
	 *  an overlay with respect to the primary
	 *  image textures
	 */
	overlayTextureWidth: 960,
	
	/**
	 * Height of the texture that will be used as
	 *  an overlay with respect to the primary
	 *  image textures
	 */
	overlayTextureHeight: 48,
	
	/**
	 * Width of the texture that will be used as
	 *  a full-screen overlay with respect to the
	 *  primary image textures
	 */
	fullScreenOverlayTextureWidth: 960,

	/**
	 * Height of the texture that will be used as
	 *  a full-screen overlay with respect to the
	 *  primary image textures
	 */	
	fullScreenOverlayTextureHeight: 720,
	
	/**
	 * Width of the initially-displayed progress
	 *  bar/element
	 */
	progressElementWidth: 800,
	
	/**
	 * Number of milliseconds contained in one second
	 */
	millisecondsPerSecond : 1000,
	
	/**
	 * Maximum angular measurement, in degrees
	 */
	maxAngleDegrees : 360,
	
	/**
	 * Maximum value of a scalar input event
	 */
	maxScalarInputEventMagnitude : 1.0,
		
	/**
	 * Scalar input class of input events
	 */
	eventTypeScalarInput : "_InputTypeScalarInputEvent",
	
		/**
	 * Height of the "small" intro text font, in pixels
	 */	
	smallIntroFontSizePx: 14,
	
	/**
	 * Height of the "small" label font, in pixels
	 */
	smallLabelFontSizePx: 20,
	
	/**
	 * Height of the label font, in pixels
	 */
	labelFontSizePx: 30,
	
	/**
	 * Height of the "Game Over" text, in pixels
	 */
	gameOverFontSizePx: 120,
	
	/**
	 * Height of the "Congratulations" text, in pixels
	 */
	gameCompletedFontSizePx: 100,
	
	/**
	 * Size of the font for a button that is intended to be
	 *  a prominent UI element
	 */
	prominentButtonFontSize: 50,

	/**
	 * Font name of the label font
	 */
	labelFont: "Arial",
	
	/**
	 * Style applied to the label font
	 */
	labelFontStyle: "Italic",

	/**
	 * Protagonist vitality indicator label text
	 */
	stringVitalityLabel: "Holiday Cheer",

	/**
	 * Intro screen title
	 */ 
	stringIntroGeneral1: "'Wrong Holiday? Well, let's have some fun anyway!",

	/**
	 * Rabbit protagonist movement directions
	 */
	stringIntroMoveInstruction: "Use the arrow keys / tilt the device to move",
	
	/**
	 * Hazard avoidance note
	 */
	stringIntroHazardDesc: "Avoid all hazards...",
	
	/**
	 * Level progression target note
	 */
	stringIntroGoalDesc: "Reach the flags to progress to the next region",
	
	/**
	 * Vitality gauge description
	 */
	stringIntroVitalityGaugeDesc: "Grievous injuries can ruin The Holidays - be careful!",

	/**
	 * Demo initiation button text
	 */
	stringIntroClickToContinue: "Click / Tap to Begin!",
	
	/**
	 * Level retry directions
	 */
	stringSpaceTapToRetry: "(Space/Tap to Retry)",
	
	/**
	 * Text displayed after the game has concluded
	 */
	stringGameOver: "Game Over",
	
	/**
	 * Text displayed after the game has been successfully
	 *  completed in its entirety
	 */
	stringGameCompleted: "Congratulations!",

	/**
	 * Additional text displayed after successful
	 *  completion of the game
	 */
	stringGameCompletedDetail: "The Rabbit had the best Holiday ever!",

	/**
	 * Holiday message text
	 */
	messageText: "Happy Holidays from Katie and Ayo!"
}