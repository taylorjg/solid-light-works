import { Geometry } from 'three';
import { BufferGeometry } from 'three';
import { Float32BufferAttribute } from 'three';
import { Vector3 } from 'three';

function MembraneGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, thetaStart, thetaLength) {

	Geometry.call(this);

	this.type = 'MembraneGeometry';

	this.parameters = {
		radiusTop,
		radiusBottom,
		height,
		radialSegments,
		heightSegments,
		thetaStart,
		thetaLength
	};

	this.fromBufferGeometry(new MembraneBufferGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, thetaStart, thetaLength));
	this.mergeVertices();
}

MembraneGeometry.prototype = Object.create(Geometry.prototype);
MembraneGeometry.prototype.constructor = MembraneGeometry;

function MembraneBufferGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, thetaStart, thetaLength) {

	BufferGeometry.call(this);

	this.type = 'MembraneBufferGeometry';

	this.parameters = {
		radiusTop,
		radiusBottom,
		height,
		radialSegments,
		heightSegments,
		thetaStart,
		thetaLength
	};

	const scope = this;

	radiusTop = radiusTop !== undefined ? radiusTop : 1;
	radiusBottom = radiusBottom !== undefined ? radiusBottom : 1;
	height = height || 1;

	radialSegments = Math.floor(radialSegments) || 8;
	heightSegments = Math.floor(heightSegments) || 1;

	thetaStart = thetaStart !== undefined ? thetaStart : 0.0;
	thetaLength = thetaLength !== undefined ? thetaLength : Math.PI * 2;

	// buffers
	const indices = [];
	const vertices = [];
	const normals = [];
	const uvs = [];

	// helper variables
	let index = 0;
	const indexArray = [];
	const halfHeight = height / 2;
	let groupStart = 0;

	// generate geometry
	generateTorso();

	// build geometry
	this.setIndex(indices);
	this.addAttribute('position', new Float32BufferAttribute(vertices, 3));
	this.addAttribute('normal', new Float32BufferAttribute(normals, 3));
	this.addAttribute('uv', new Float32BufferAttribute(uvs, 2));

	function generateTorso() {

		let x, y;
		const normal = new Vector3();
		const vertex = new Vector3();

		let groupCount = 0;

		// this will be used to calculate the normal
		const slope = (radiusBottom - radiusTop) / height;

		// generate vertices, normals and uvs
		for (y = 0; y <= heightSegments; y++) {

			const indexRow = [];

			const v = y / heightSegments;

			// calculate the radius of the current row
			const radius = v * (radiusBottom - radiusTop) + radiusTop;

			for (x = 0; x <= radialSegments; x++) {

				const u = x / radialSegments;

				const theta = u * thetaLength + thetaStart;

				const sinTheta = Math.sin(theta);
				const cosTheta = Math.cos(theta);

				// vertex
				vertex.x = radius * sinTheta;
				vertex.y = - v * height + halfHeight;
				vertex.z = radius * cosTheta;
				vertices.push(vertex.x, vertex.y, vertex.z);

				// normal
				// normal.set(sinTheta, slope, cosTheta).normalize();
				// normals.push(normal.x, normal.y, normal.z);
				normals.push(0, 0, 0);

				// uv
				// uvs.push(u, 1 - v);
				uvs.push(u, u);

				// save index of vertex in respective row
				indexRow.push(index++);
			}

			// now save vertices of the row in our index array
			indexArray.push(indexRow);
		}

		// generate indices
		for (x = 0; x < radialSegments; x++) {

			for (y = 0; y < heightSegments; y++) {

				// we use the index array to access the correct indices
				const a = indexArray[y][x];
				const b = indexArray[y + 1][x];
				const c = indexArray[y + 1][x + 1];
				const d = indexArray[y][x + 1];

				// faces
				indices.push(a, b, d);
				indices.push(b, c, d);

				// update group counter
				groupCount += 6;
			}
		}

		// add a group to the geometry. this will ensure multi material support
		scope.addGroup(groupStart, groupCount, 0);

		// calculate new start value for groups
		groupStart += groupCount;
	}
}

MembraneBufferGeometry.prototype = Object.create(BufferGeometry.prototype);
MembraneBufferGeometry.prototype.constructor = MembraneBufferGeometry;

export { MembraneGeometry, MembraneBufferGeometry };
