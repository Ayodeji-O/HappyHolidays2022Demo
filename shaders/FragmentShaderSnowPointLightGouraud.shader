// FragmentShaderGourad.shader - Generic gouraud shading
//                               fragment shader

// Author: Ayodeji Oshinnaiye

varying mediump vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform mediump vec3 uniform_ambientLightVector;
varying mediump vec3 vNormalVector;
varying mediump vec3 vPosition;
uniform highp float uniform_surfaceNoiseVertOffset;

varying lowp vec4 vBaseFragmentColor;

uniform mediump vec4 uniform_pointLightColor;
uniform mediump vec3 uniform_pointLightPosition;
uniform mediump float uniform_pointLightContributionFraction;

// 2D Random
// https://thebookofshaders.com/11/
highp float random (in highp vec2 st) {
	const highp float pi = acos(-1.0);
	const highp vec2 randomRefVector = vec2(12.9898, 78.233);
	highp float dotProductResult = dot(st.xy, randomRefVector);
    return fract(sin(mod(dotProductResult, 2.0 * pi)) * 43758.5453123);
}

mediump float easeInterpolate(mediump float a, mediump float b, mediump float t) {
	mediump float easeT = (6.0 * t * t * t * t * t) - (15.0 * t * t * t * t) + (10.0 * t * t * t);

	return mix(a, b, easeT);
}

highp float noise(highp float frequency, highp vec2 textureCoord) {
	highp float coordX = (frequency * textureCoord.x);
	highp float coordY = (frequency * textureCoord.y);

	highp float fractCoordX = fract(coordX);
	highp float fractCoordY = fract(coordY);
	
	highp int intCoordX = int(floor(coordX));
	highp int intCoordY = int(floor(coordY));

	highp float sampleA = random(vec2(intCoordX, intCoordY) + vec2(0.0, 0.0));
	highp float sampleB = random(vec2(intCoordX, intCoordY) + vec2(1.0, 0.0));
	highp float sampleC = random(vec2(intCoordX, intCoordY) + vec2(0.0, 1.0));
	highp float sampleD = random(vec2(intCoordX, intCoordY) + vec2(1.0, 1.0));

	highp float interpA = easeInterpolate(sampleA, sampleB, fractCoordX);
	highp float interpB = easeInterpolate(sampleC, sampleD, fractCoordX);
	
	return mix(interpA, interpB, fractCoordY);
}

void main() {
	highp float perturbationX = noise(40.0, vec2(vTextureCoord.x, vTextureCoord.y + uniform_surfaceNoiseVertOffset));
	highp float perturbationZ = noise(50.0, vec2(perturbationX, vTextureCoord.y + uniform_surfaceNoiseVertOffset));
	
	mediump vec3 perturbedNormal = vNormalVector + vec3(perturbationX / 20.0, 0.0, perturbationZ / 20.0);

	const mediump float lightContributionFraction = 0.8;
	const mediump vec4 ambientLightColor = vec4(1.0, 1.0, 1.0, 1.0);
	const mediump vec4 baseIllumination = vec4(1.0, 1.0, 1.0, 1.0);
		
	mediump float ambientContributionFraction = (lightContributionFraction - (lightContributionFraction * uniform_pointLightContributionFraction));
	mediump float ambientDotProduct = dot(normalize(perturbedNormal), -normalize(uniform_ambientLightVector));
	mediump float pointLightDotProduct = dot(normalize(perturbedNormal), normalize(vPosition.xyz - uniform_pointLightPosition.xyz));
	mediump float baseContributionFraction = 1.0 - lightContributionFraction;

	mediump vec4 ambientContibution = vec4(ambientLightColor.xyz * pow(abs(ambientDotProduct), 1.0) * ambientContributionFraction, 1.0);
	mediump vec4 baseContribution = vec4(baseIllumination.xyz * baseContributionFraction, 1.0);
	mediump vec4 pointLightColor = uniform_pointLightColor * (1.0 / pow(distance(uniform_pointLightPosition, vPosition), 2.0));
	mediump vec4 pointLightContribution = vec4(pointLightColor.xyz * abs(pointLightDotProduct) * uniform_pointLightContributionFraction, 1.0);	
	
	mediump vec4 totalLightContribution = vec4(baseContribution.xyz + ambientContibution.xyz + pointLightContribution.xyz, 1.0);

	gl_FragColor = vec4(clamp((vBaseFragmentColor * totalLightContribution).xyz, 0.0, 1.0), 1.0);
}