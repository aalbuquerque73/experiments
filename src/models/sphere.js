function createPoint(x, y, z) {
    const point = Object.create({
        normalize() {
            const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
            return createPoint(this.x / length, this.y / length, this.z / length);
        }
    });
    point.x = x;
    point.y = y;
    point.z = z;
    return point;
}
createPoint.middleOf = (p1, p2) => createPoint((p1.x + p2.x) / 2.0, (p1.y + p2.y) / 2.0, (p1.z + p2.z) / 2.0);

const faceColors = [
    [1.0,  1.0,  1.0,  1.0],    //  white
    [1.0,  0.0,  0.0,  1.0],    // red
    [0.0,  1.0,  0.0,  1.0],    // green
    [0.0,  0.0,  1.0,  1.0],    // blue
    [1.0,  1.0,  0.0,  1.0],    // yellow
    [1.0,  0.0,  1.0,  1.0],    // purple
];

export const model = {
    points: [
        // Front face
        createPoint(-1.0, -1.0,  1.0).normalize(),
        createPoint(1.0, -1.0,  1.0).normalize(),
        createPoint(1.0,  1.0,  1.0).normalize(),
        createPoint(-1.0,  1.0,  1.0).normalize(),

        // Back face
        createPoint(-1.0, -1.0, -1.0).normalize(),
        createPoint(-1.0,  1.0, -1.0).normalize(),
        createPoint(1.0,  1.0, -1.0).normalize(),
        createPoint(1.0, -1.0, -1.0).normalize(),

        // Top face
        createPoint(-1.0,  1.0, -1.0).normalize(),
        createPoint(-1.0,  1.0,  1.0).normalize(),
        createPoint(1.0,  1.0,  1.0).normalize(),
        createPoint(1.0,  1.0, -1.0).normalize(),

        // Bottom face
        createPoint(-1.0, -1.0, -1.0).normalize(),
        createPoint(1.0, -1.0, -1.0).normalize(),
        createPoint(1.0, -1.0,  1.0).normalize(),
        createPoint(-1.0, -1.0,  1.0).normalize(),

        // Right face
        createPoint(1.0, -1.0, -1.0).normalize(),
        createPoint(1.0,  1.0, -1.0).normalize(),
        createPoint(1.0,  1.0,  1.0).normalize(),
        createPoint(1.0, -1.0,  1.0).normalize(),

        // Left face
        createPoint(-1.0, -1.0, -1.0).normalize(),
        createPoint(-1.0, -1.0,  1.0).normalize(),
        createPoint(-1.0,  1.0,  1.0).normalize(),
        createPoint(-1.0,  1.0, -1.0).normalize(),
    ],
    vertices: [],
    indices: [
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23,   // left
    ],
    colors: [],
    sizes: {
        vertices: 3,
        colors: 4,
    },
    count: 0,
};
const quality = 3;
buildSphere(quality, model)
    // .calculate()
    .refine()
    .setColors(pow(4, quality) * 6)
    .generateVertices()
    .setCount();

function buildSphere(quality, model) {
    if (quality > 4) {
        quality = 4;
    }
    let index = 0;
    let middlePointCache = {};
    const t = (1.0 + Math.sqrt(5.0)) / 2.0;
    return {
        calculate() {
            model.vertices = [];
            model.points = [];
            model.indices = [];
            model.colors = [];

            [
                [-1,  t,  0],
                [ 1,  t,  0],
                [-1, -t,  0],
                [ 1, -t,  0],
                [ 0, -1,  t],
                [ 0,  1,  t],
                [ 0, -1, -t],
                [ 0,  1, -t],
                [ t,  0, -1],
                [ t,  0,  1],
                [-t,  0, -1],
                [-t,  0,  1],
            ].filter(v => v != null).forEach(v => this.addVertex(v));

            [
                [0, 11, 5],
                [0, 5, 1],
                [0, 1, 7],
                [0, 7, 10],
                [0, 10, 11],
                [1, 5, 9],
                [5, 11, 4],
                [11, 10, 2],
                [10, 7, 6],
                [7, 1, 8],
                [3, 9, 4],
                [3, 4, 2],
                [3, 2, 6],
                [3, 6, 8],
                [3, 8, 9],
                [4, 9, 5],
                [2, 4, 11],
                [6, 2, 10],
                [8, 6, 7],
                [9, 8, 1],
            ].filter(i => i != null).forEach(i => this.addFace(i))
            return this;
        },
        refine() {
            new Array(quality)
                .fill(0)
                .map((_, index) => index)
                .forEach(() => {
                    const faceCount = model.indices.length;
                    const faces = [];
                    for (let face = 0; face < faceCount; face += 3) {
                        const x1 = model.indices[face];
                        const y1 = model.indices[face + 1];
                        const z1 = model.indices[face + 2];
                        this.insureMiddlePoints(x1, y1, z1);
                        const x2 = middlePointCache[`${x1}:${y1}`];
                        const y2 = middlePointCache[`${y1}:${z1}`];
                        const z2 = middlePointCache[`${z1}:${x1}`];
                        [
                            x1, x2, z2,
                            x2, y1, y2,
                            x2, y2, z2,
                            z2, y2, z1,
                        ].filter(i => i != null).forEach(i => faces.push(i));
                    }
                    model.indices = faces;
                });
            return this;
        },
        setColors(step = 4) {
            let color = 0;
            for (let face = 0; face < model.indices.length; face += step) {
                new Array(step)
                    .fill(face)
                    .map((face, index) => model.indices[face + index])
                    .forEach(index => faceColors[color % faceColors.length].forEach((c, pos) => model.colors[index * 4 + pos] = c));
                ++color;
            }
            return this;
        },
        generateVertices() {
            model.vertices = model.points.reduce((current, v) => current.concat(v.x, v.y, v.z), []);
            return this;
        },
        setCount() {
            model.count = model.indices.length;
            return this;
        },
        addVertex(vertex) {
            model.points.push(createPoint(...vertex).normalize());
            ++index;
            return this;
        },
        addFace(face) {
            face.forEach(i => model.indices.push(i));
            return this;
        },
        insureMiddlePoints(x, y, z) {
            const k1 = `${x}:${y}`;
            const k2 = `${y}:${z}`;
            const k3 = `${z}:${x}`;
            if (!middlePointCache.hasOwnProperty(k1)) {
                middlePointCache[k1] = model.points.length;
                const p = this.getMiddlePoint(x, y);
                model.points.push(p);
            }
            if (!middlePointCache.hasOwnProperty(k2)) {
                middlePointCache[k2] = model.points.length;
                const p = this.getMiddlePoint(y, z);
                model.points.push(p);
            }
            if (!middlePointCache.hasOwnProperty(k3)) {
                middlePointCache[k3] = model.points.length;
                const p = this.getMiddlePoint(z, x);
                model.points.push(p);
            }
            return this;
        },
        getMiddlePoint(p1, p2) {
            const point1 = model.points[p1];
            const point2 = model.points[p2];
            const middle = createPoint.middleOf(point1, point2).normalize();
            return middle;
        },
    };
}

function pow(value, power) {
    return new Array(power).fill(value).reduce((current, value) => current * value, 1);
}
