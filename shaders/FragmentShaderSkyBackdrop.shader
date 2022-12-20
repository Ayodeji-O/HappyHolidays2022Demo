// FragmentShaderBackdrop.shader - Renders a slightly blurred, darkened
// texture

// Author: Ayodeji Oshinnaiye

varying mediump vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform mediump vec4 uniform_skyStartColor;
uniform mediump vec4 uniform_skyEndColor;
uniform mediump vec4 uniform_cloudColor;
uniform mediump float uniform_skyNoiseHorizOffset;
uniform mediump float uniform_skyNoiseVertOffset;

uniform mediump vec2 vTextureCoordOffset;
uniform highp ivec2 vTextureDimensions;

// 2D Random
// https://thebookofshaders.com/11/
mediump float random (in mediump vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * /*43758.5453123*/ 437.585453123);
}

mediump float easeInterpolate(mediump float a, mediump float b, mediump float t) {
	mediump float easeT = (6.0 * t * t * t * t * t) - (15.0 * t * t * t * t) + (10.0 * t * t * t);

	return mix(a, b, easeT);
}

mediump float noise(mediump float frequency, mediump vec2 textureCoord) {
	mediump float coordX = (frequency * textureCoord.x);
	mediump float coordY = (frequency * textureCoord.y);

	mediump float fractCoordX = fract(coordX);
	mediump float fractCoordY = fract(coordY);
	
	mediump int intCoordX = int(floor(coordX));
	mediump int intCoordY = int(floor(coordY));

	mediump float sampleA = random(vec2(intCoordX, intCoordY) + vec2(0.0, 0.0));
	mediump float sampleB = random(vec2(intCoordX, intCoordY) + vec2(1.0, 0.0));
	mediump float sampleC = random(vec2(intCoordX, intCoordY) + vec2(0.0, 1.0));
	mediump float sampleD = random(vec2(intCoordX, intCoordY) + vec2(1.0, 1.0));

	mediump float interpA = easeInterpolate(sampleA, sampleB, fractCoordX);
	mediump float interpB = easeInterpolate(sampleC, sampleD, fractCoordX);
	
	return mix(interpA, interpB, fractCoordY);
}


void main() {
	mediump vec2 alteredTextureCoord = vec2((vTextureCoord.x * pow(vTextureCoord.y, 2.0)) - pow(vTextureCoord.y, 2.0) / 2.0,
		1.0 - pow(vTextureCoord.y, 2.0) + uniform_skyNoiseVertOffset);
	mediump float intermediateCloudLayer =
		(0.40 * noise(10.0, alteredTextureCoord)) +
		(0.20 * noise(50.0, alteredTextureCoord)) +
		(0.10 * noise(100.0, alteredTextureCoord)) +
		(0.05 * noise(500.0, alteredTextureCoord));
		
	mediump float cloudLayerValue = intermediateCloudLayer;
	
	mediump vec4 skyColor = mix(uniform_skyEndColor, uniform_skyStartColor, min(vTextureCoord.y * 2.0, 1.0));
	
	mediump float cloudFraction = 0.5;
	
	mediump vec4 compositeSky = mix(skyColor,
		uniform_cloudColor * vec4(vec3(cloudLayerValue).xyz, 1.0),
		cloudFraction);
	
	gl_FragColor = compositeSky;
}




