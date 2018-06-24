import { BufferGeometry } from "three";
import { Float32BufferAttribute } from "three";

// TODO: make this a class
// ps: array of Vector3 representing the small shape
// - e.g. obtained from ElipseCurve.getPoints()
// qs: array of Vector3 representing the large shape
// - e.g. obtained from ElipseCurve.getPoints()
export function MembraneBufferGeometry(ps = [], qs = [], numSegments = 1) {

	BufferGeometry.call(this);

	this.type = "MembraneBufferGeometry";

	const scope = this;

	numSegments = Math.floor(numSegments) || 1;

	// buffers
	const indices = [];
	const vertices = [];
	const normals = [];
	const uvs = [];

	// helper variables
	const indexArray = [];
	let index = 0;
	let groupStart = 0;

	// generate geometry
	generateTorso();

	// build geometry
	this.setIndex(indices);
	this.addAttribute("position", new Float32BufferAttribute(vertices, 3));
	this.addAttribute("normal", new Float32BufferAttribute(normals, 3));
	this.addAttribute("uv", new Float32BufferAttribute(uvs, 2));

	function generateTorso() {

		const pslen = ps.length;
		const qslen = qs.length;

		if (pslen === 0 || qslen === 0 || pslen !== qslen) {
			return;
		}

		const numPoints = ps.length;
		let groupCount = 0;

		// generate vertices, normals and uvs
		for (let y = 0; y <= numSegments; y++) {
			const v = y / numSegments;
			const indexRow = [];

			for (let x = 0; x < numPoints; x++) {
				const u = x / numPoints;

				// vertex
				const clone = ps[x].clone();
				clone.lerp(qs[x], v);
				vertices.push(clone.x, clone.y, clone.z);

				// normal
				normals.push(0, 0, 0);

				// uv
				uvs.push(u, u);

				// save index of vertex in respective row
				indexRow.push(index++);
			}

			// now save vertices of the row in our index array
			indexArray.push(indexRow);
		}

		// generate indices
		for (let x = 0; x < numPoints; x++) {

			for (let y = 0; y < numSegments; y++) {

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
