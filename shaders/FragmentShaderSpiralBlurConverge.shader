// Author: Ayodeji Oshinnaiye

varying mediump vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform mediump float imageWidth;
const mediump int maxBlendSamples = 128;
uniform mediump float twistUnitMagnitude;
const mediump vec2 centerPoint = vec2(0.5, 0.5);
const mediump float baseRotationAngle = 3.1415926 / 1.5;
const mediump float greenRotMagnitudeModifier = 1.2;
const mediump float blueRotMagnitudeModifier = 1.4;
const mediump float sampleStepMultiplier = 1.1;
const mediump int sampleCount = 8;

mediump vec2 rotatePoint(mediump float rotationAngle, mediump vec2 targetPoint, mediump vec2 origin) {
	mediump vec2 offsetPoint = targetPoint - origin;

	mediump mat2 rotationMatrix = mat2(cos(rotationAngle), -sin(rotationAngle),
									   sin(rotationAngle), cos(rotationAngle));

	return (offsetPoint * rotationMatrix + origin);
}

mediump vec4 multiSampledRotatedPoint(mediump float rotationAngle, mediump vec2 targetPoint, mediump vec2 origin) {

	mediump vec4 sampleSum = vec4(0.0, 0.0, 0.0, 0.0);

	mediump float currentStepMultiplier = 1.0;
	for (int sampleLoop = 0; sampleLoop < sampleCount; sampleLoop++) {
		sampleSum += texture2D(uSampler, rotatePoint(rotationAngle * currentStepMultiplier, vTextureCoord, centerPoint));
		currentStepMultiplier *= sampleStepMultiplier;
	}
	
	return sampleSum / 8.0;
}

void main() {	
	mediump float rotationMagnitude = distance(vTextureCoord, centerPoint) * baseRotationAngle * (1.0 - twistUnitMagnitude);

	mediump vec4 redSourceTexel = multiSampledRotatedPoint(baseRotationAngle * rotationMagnitude,
		vTextureCoord, centerPoint);
	mediump vec4 greenSourceTexel = multiSampledRotatedPoint(baseRotationAngle * rotationMagnitude * greenRotMagnitudeModifier,
		vTextureCoord, centerPoint);
	mediump vec4 blueSourceTexel = multiSampledRotatedPoint(baseRotationAngle * rotationMagnitude * blueRotMagnitudeModifier,
		vTextureCoord, centerPoint);

	gl_FragColor = vec4(redSourceTexel.x, greenSourceTexel.y, blueSourceTexel.z,
		(redSourceTexel.w + greenSourceTexel.w + blueSourceTexel.w)  / 3.0);
}
