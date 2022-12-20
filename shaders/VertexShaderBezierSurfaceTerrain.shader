// VertexShaderStandardPositionShader.shader - Applies a transformation to vertices, using a
//                                             supplied transformation matrix; also applied
//       									   color, normal, lighting and texture coordinate data
// Author: Ayodeji Oshinnaiye

attribute highp vec4 aVertexPosition;
attribute vec4 aVertexColor;
uniform mediump vec3 uniform_ambientLightVector;
attribute vec2 aTextureCoord;
uniform highp float uniform_surfaceNoiseVertOffset;

varying mediump vec2 vTextureCoord;
varying lowp vec4 vBaseFragmentColor;
varying mediump vec3 vNormalVector;
varying mediump vec3 vPosition;

const mediump int xAxisCount = 16;
const mediump int zAxisCount = 32;

const highp float xAxisWidth = 4.0;
const highp float zAxisWidth = 8.0;

const highp float xAxisHalfWidth = xAxisWidth / 2.0;
const highp float zAxisHalfWidth = zAxisWidth / 2.0;

uniform mat4 uniform_transformationMatrix;
uniform mat4 uniform_projectionMatrix;
uniform mediump float uniform_controlPointHeightMap[xAxisCount * zAxisCount];
uniform highp float uniform_controlPointOffsetZ;

uniform highp sampler2D uSampler;

highp float ramanujanFactorialApproximation(highp int number) {
	highp float floatNumber = float(number);
	highp float sixthRootTerm = (8.0 * floatNumber * floatNumber * floatNumber) + (4.0 * floatNumber * floatNumber) + floatNumber + (1.0 / 30.0);  
	highp float pi = acos(-1.0);
	highp float numOverEulerExp = pow((floatNumber / exp(1.0)), floatNumber);
  
	return max(sqrt(pi) * numOverEulerExp * pow(sixthRootTerm, 1.0 / 6.0), 1.0);
}

highp float computeFactorial(highp int value) {
	return ramanujanFactorialApproximation(value);
}

highp float computeBernstein(highp int degree, highp int iteration, highp float param) {
	// degree - Bezier basis function degree
	// iteration
	// param - Current parameterization (u or v)
	return (computeFactorial(degree) / (computeFactorial(iteration) * (computeFactorial(degree - iteration)))) * pow(param, float(iteration)) * pow((1.0 - param), float(degree - iteration));
}

highp float computeBezierSurfaceCoordY(highp float xCoord, highp float zCoord) {	
	// Invert Z parameterization, as control point uniform is
	// intended to be mapped top -> bottom = front -> back.
	// Also, use uniform_controlPointOffsetZ to permit
	// sub-row positioning
	highp float zCoordOffset = (uniform_controlPointOffsetZ * zAxisWidth / float(zAxisCount));
	highp float paramX = clamp((xCoord + xAxisHalfWidth) / xAxisWidth, 0.0, 1.0);
	highp float paramZ = clamp(1.0 - ((((zCoord - zCoordOffset) + zAxisHalfWidth - 2.0) / zAxisWidth) /*- (uniform_controlPointOffsetZ / float(zAxisCount))*/), 0.0, 1.0);

	highp float bezierSurfaceCoordY = 0.0;

	for (mediump int xLoop = 0; xLoop < xAxisCount; xLoop++) {
		highp float bersteinX = computeBernstein(xAxisCount - 1, xLoop, paramX);
		highp float controlPointCoordX = (float(xLoop) / float(xAxisCount - 1) * xAxisWidth) - (xAxisWidth / 2.0);

		for (mediump int zLoop = 0; zLoop < zAxisCount; zLoop++) {
			mediump int workingIndexZ = (zAxisCount - zLoop - 1);

			highp float controlPointCoordZ = (float(workingIndexZ) / float(zAxisCount - 1) * zAxisWidth) - zAxisHalfWidth;
	
			highp float yCoordControlPoint = uniform_controlPointHeightMap[xLoop + (zLoop * xAxisCount)];
				
			bezierSurfaceCoordY += (bersteinX * computeBernstein(zAxisCount - 1, zLoop, paramZ) * yCoordControlPoint);
		}
	}
	
	// The leading edge coefficient is employed to reduce artifacts that result
	// from interpolation at the leading edge of the region (height minimization),
	// while the trailing edge coefficient is used to prevent the terrain from
	// "exposing" the blank region underneath due to the height of the terrain
	// as it scrolls off of the edge of the viewing region.
	highp float leadingEdgeCoefficient = pow(clamp(5.0 - zCoord, 0.0, 1.0), (1.0 / 5.0));
	highp float trailingEdgeCoefficient = pow(clamp(zCoord + 0.5, 0.0, 1.0), (1.0 / 5.0));
	
	return leadingEdgeCoefficient * trailingEdgeCoefficient * bezierSurfaceCoordY;
}

highp float boundaryEnforcementMultiplier(highp float xCoord) {
	highp float multiplier = 
		step(-xAxisWidth / 2.0, xCoord) * step(-xAxisWidth / 2.0, -xCoord);

	return multiplier;
}

highp vec3 estimateBezierSurfacePointNormal(highp float xCoord, highp float zCoord) {
	const highp float vectorOffset = 0.001;

	highp float boundaryEnforcementMultiplier = boundaryEnforcementMultiplier(xCoord);

	highp float firstPointX = xCoord + vectorOffset;
	highp float secondPointZ = zCoord + vectorOffset;

	highp float commonPointHeight = boundaryEnforcementMultiplier * max(computeBezierSurfaceCoordY(xCoord, zCoord), 0.0);
	highp float firstHeight = boundaryEnforcementMultiplier * max(computeBezierSurfaceCoordY(firstPointX, zCoord), 0.0);
	highp float secondHeight = boundaryEnforcementMultiplier * max(computeBezierSurfaceCoordY(xCoord, secondPointZ), 0.0);
	
	highp vec3 firstVector = vec3(firstPointX, firstHeight, zCoord) - vec3(xCoord, commonPointHeight, zCoord);
	highp vec3 secondVector = vec3(xCoord, secondHeight, secondPointZ) - vec3(xCoord, commonPointHeight, zCoord);

	highp vec3 normalVector = cross(firstVector, secondVector);

	return normalize(normalVector);
}

void main() {
	highp float bezierSurfaceCoordY = boundaryEnforcementMultiplier(aVertexPosition.x) *
		computeBezierSurfaceCoordY(max(min(aVertexPosition.x, xAxisWidth / 2.0), -xAxisWidth / 2.0), aVertexPosition.z);

	vec4 finalPosition = vec4(aVertexPosition.xyz, 1.0) * uniform_transformationMatrix;
	mat4 finalTransformationMatrix = uniform_transformationMatrix * uniform_projectionMatrix;
	highp vec3 bezierSurfacePoint = vec3(aVertexPosition.x, max(bezierSurfaceCoordY, 0.0) + aVertexPosition.y, aVertexPosition.z);
	gl_Position = vec4(bezierSurfacePoint.xyz, 1.0) * finalTransformationMatrix;
	vTextureCoord = aTextureCoord;
	vBaseFragmentColor = aVertexColor;
	vNormalVector = estimateBezierSurfacePointNormal(aVertexPosition.x, aVertexPosition.z) * mat3(uniform_transformationMatrix);
	vPosition = finalPosition.xyz;
}




