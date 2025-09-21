/**
 * Algoritmos de teoría de grafos
 * Matriz de caminos, Componentes conexas, Ciclo Hamiltoniano
 */

// ==================== FUNCIONES HELPER ====================

/**
 * Valida que una matriz de adyacencia sea válida
 */
export const validateAdjacencyMatrix = (matrix) => {
    if (!Array.isArray(matrix) || matrix.length === 0) {
        throw new Error('Matriz inválida: debe ser un array no vacío');
    }

    const size = matrix.length;
    if (!matrix.every(row => Array.isArray(row) && row.length === size)) {
        throw new Error('Matriz inválida: debe ser cuadrada');
    }

    // Validar que solo contenga 0s y 1s para matrices de adyacencia
    const isValid = matrix.every(row =>
        row.every(val => val === 0 || val === 1 || !isNaN(parseFloat(val)))
    );

    if (!isValid) {
        throw new Error('Matriz de adyacencia inválida: debe contener solo números');
    }

    return true;
};

/**
 * Crea una copia profunda de una matriz
 */
export const deepCopyMatrix = (matrix) => {
    return matrix.map(row => [...row]);
};

/**
 * Convierte matriz de strings a números
 */
export const parseMatrixToNumbers = (matrix) => {
    return matrix.map(row =>
        row.map(val => {
            const parsed = parseFloat(val);
            return isNaN(parsed) ? 0 : parsed;
        })
    );
};

/**
 * Crea matriz identidad
 */
export const createIdentityMatrix = (size) => {
    const matrix = Array(size).fill().map(() => Array(size).fill(0));
    for (let i = 0; i < size; i++) {
        matrix[i][i] = 1;
    }
    return matrix;
};

// ==================== MATRIZ DE CAMINOS ====================

/**
 * Calcula la clausura transitiva (matriz de caminos)
 * Implementa el algoritmo de Warshall para encontrar todos los caminos posibles
 */
export const calculatePathMatrix = (adjacencyMatrix) => {
    validateAdjacencyMatrix(adjacencyMatrix);

    const size = adjacencyMatrix.length;
    const matrix = parseMatrixToNumbers(adjacencyMatrix);
    const result = deepCopyMatrix(matrix);

    // Agregar diagonal principal (caminos de longitud 0)
    for (let i = 0; i < size; i++) {
        result[i][i] = 1;
    }

    // Algoritmo de Warshall modificado basado en tu código original
    const processed = Array(size).fill().map(() => Array(size).fill(false));

    for (let i = 0; i < size; i++) {
        let hasChanges = true;

        while (hasChanges) {
            hasChanges = false;

            for (let j = 0; j < size; j++) {
                if (result[i][j] === 1 && !processed[i][j]) {
                    processed[i][j] = true;

                    // Si hay camino de i a j, propagar todos los caminos desde j
                    for (let k = 0; k < size; k++) {
                        if (result[j][k] === 1 && result[i][k] === 0) {
                            result[i][k] = 1;
                            hasChanges = true;
                        }
                    }
                }
            }
        }
    }

    return result;
};

/**
 * Versión clásica del algoritmo de Floyd-Warshall para caminos
 */
export const floydWarshallPaths = (adjacencyMatrix) => {
    validateAdjacencyMatrix(adjacencyMatrix);

    const size = adjacencyMatrix.length;
    const result = parseMatrixToNumbers(adjacencyMatrix);

    // Inicializar diagonal principal
    for (let i = 0; i < size; i++) {
        result[i][i] = 1;
    }

    // Floyd-Warshall clásico
    for (let k = 0; k < size; k++) {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                result[i][j] = result[i][j] || (result[i][k] && result[k][j]);
            }
        }
    }

    return result.map(row => row.map(val => val ? 1 : 0));
};

// ==================== COMPONENTES CONEXAS ====================

/**
 * Encuentra componentes fuertemente conexas usando algoritmo DFS
 */
export const findConnectedComponents = (adjacencyMatrix) => {
    validateAdjacencyMatrix(adjacencyMatrix);

    const size = adjacencyMatrix.length;
    const matrix = parseMatrixToNumbers(adjacencyMatrix);
    const visited = Array(size).fill(false);
    const components = [];

    /**
     * DFS recursivo para encontrar componente
     */
    const dfs = (vertex, currentComponent) => {
        visited[vertex] = true;
        currentComponent.push(vertex);

        for (let i = 0; i < size; i++) {
            if (matrix[vertex][i] === 1 && !visited[i]) {
                dfs(i, currentComponent);
            }
        }
    };

    // Encontrar todas las componentes
    for (let i = 0; i < size; i++) {
        if (!visited[i]) {
            const component = [];
            dfs(i, component);
            components.push(component);
        }
    }

    return {
        components,
        count: components.length,
        componentMap: createComponentMap(components, size)
    };
};

/**
 * Crea un mapa de vértice -> componente
 */
const createComponentMap = (components, size) => {
    const map = Array(size).fill(-1);

    components.forEach((component, index) => {
        component.forEach(vertex => {
            map[vertex] = index;
        });
    });

    return map;
};

/**
 * Verifica si el grafo es fuertemente conexo
 */
export const isStronglyConnected = (adjacencyMatrix) => {
    const result = findConnectedComponents(adjacencyMatrix);
    return result.count === 1;
};

// ==================== CICLO HAMILTONIANO ====================

/**
 * Genera todas las permutaciones de un array
 */
export const generatePermutations = (array) => {
    if (array.length <= 1) return [array];

    const result = [];

    for (let i = 0; i < array.length; i++) {
        const element = array[i];
        const remaining = [...array.slice(0, i), ...array.slice(i + 1)];
        const permutations = generatePermutations(remaining);

        permutations.forEach(perm => {
            result.push([element, ...perm]);
        });
    }

    return result;
};

/**
 * Genera todas las rutas hamiltonianas posibles
 */
export const generateHamiltonianPaths = (numVertices) => {
    if (numVertices < 2) {
        throw new Error('Se necesitan al menos 2 vértices');
    }

    // Generar array [0, 1, 2, ..., n-2] (excluyendo el último vértice)
    const vertices = Array(numVertices - 1).fill().map((_, i) => i);
    const permutations = generatePermutations(vertices);

    // Agregar vértice inicial y final (ciclo hamiltoniano)
    const lastVertex = numVertices - 1;
    return permutations.map(perm => [lastVertex, ...perm, lastVertex]);
};

/**
 * Calcula el costo de una ruta específica
 */
export const calculatePathCost = (path, weightMatrix) => {
    if (path.length < 2) return 0;

    let totalCost = 0;
    const INFINITY = 999999;

    for (let i = 0; i < path.length - 1; i++) {
        const from = path[i];
        const to = path[i + 1];
        const weight = weightMatrix[from][to];

        if (weight === 0) {
            return INFINITY; // No hay conexión
        }

        totalCost += weight;
    }

    return totalCost;
};

/**
 * Encuentra el ciclo hamiltoniano de menor costo
 */
export const findMinimumHamiltonianCycle = (weightMatrix) => {
    validateAdjacencyMatrix(weightMatrix);

    const size = weightMatrix.length;
    if (size < 3) {
        throw new Error('Se necesitan al menos 3 vértices para un ciclo hamiltoniano');
    }

    const matrix = parseMatrixToNumbers(weightMatrix);
    const allPaths = generateHamiltonianPaths(size);

    let minCost = Infinity;
    let bestPath = null;
    let bestPathEdges = [];

    for (const path of allPaths) {
        const cost = calculatePathCost(path, matrix);

        if (cost < minCost && cost !== 999999) {
            minCost = cost;
            bestPath = path;

            // Generar lista de aristas del mejor camino
            bestPathEdges = [];
            for (let i = 0; i < path.length - 1; i++) {
                bestPathEdges.push([path[i], path[i + 1]]);
            }
        }
    }

    return {
        path: bestPath,
        cost: minCost === Infinity ? null : minCost,
        edges: bestPathEdges,
        isValid: minCost !== Infinity,
        pathString: bestPath ? formatPathString(bestPath, bestPathEdges) : null
    };
};

/**
 * Formatea el camino como string para mostrar
 */
const formatPathString = (path, edges) => {
    return edges.map(([from, to]) => `[${from};${to}]`).join('');
};

/**
 * Verifica si una arista pertenece al camino óptimo
 */
export const isEdgeInOptimalPath = (vertex1, vertex2, optimalEdges) => {
    return optimalEdges.some(([from, to]) =>
        (from === vertex1 && to === vertex2) || (from === vertex2 && to === vertex1)
    );
};

// ==================== ALGORITMOS DE CAMINOS MÍNIMOS ====================

/**
 * Algoritmo de Floyd-Warshall para distancias mínimas
 */
export const floydWarshallDistances = (weightMatrix) => {
    validateAdjacencyMatrix(weightMatrix);

    const size = weightMatrix.length;
    const INFINITY = 999999;

    // Inicializar matriz de distancias
    const dist = Array(size).fill().map(() => Array(size).fill(INFINITY));

    // Copiar pesos de la matriz original
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (i === j) {
                dist[i][j] = 0;
            } else if (weightMatrix[i][j] !== 0) {
                dist[i][j] = parseFloat(weightMatrix[i][j]);
            }
        }
    }

    // Floyd-Warshall
    for (let k = 0; k < size; k++) {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (dist[i][k] + dist[k][j] < dist[i][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                }
            }
        }
    }

    // Convertir INFINITY de vuelta a 0 para mostrar
    return dist.map(row =>
        row.map(val => val === INFINITY ? 0 : val)
    );
};

// ==================== UTILIDADES DE GRAFOS ====================

/**
 * Convierte matriz de adyacencia a lista de aristas
 */
export const adjacencyMatrixToEdgeList = (matrix) => {
    validateAdjacencyMatrix(matrix);

    const edges = [];
    const size = matrix.length;

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (matrix[i][j] !== 0) {
                edges.push({
                    from: i,
                    to: j,
                    weight: parseFloat(matrix[i][j])
                });
            }
        }
    }

    return edges;
};

/**
 * Calcula el grado de cada vértice
 */
export const calculateVertexDegrees = (adjacencyMatrix) => {
    validateAdjacencyMatrix(adjacencyMatrix);

    const size = adjacencyMatrix.length;
    const degrees = Array(size).fill(0);

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (adjacencyMatrix[i][j] !== 0) {
                degrees[i]++;
            }
        }
    }

    return degrees;
};

/**
 * Verifica si el grafo es completo
 */
export const isCompleteGraph = (adjacencyMatrix) => {
    validateAdjacencyMatrix(adjacencyMatrix);

    const size = adjacencyMatrix.length;

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (i !== j && adjacencyMatrix[i][j] === 0) {
                return false;
            }
        }
    }

    return true;
};

// ==================== EXPORTACIONES PRINCIPALES ====================

export const graphTheory = {
    // Matriz de caminos
    pathMatrix: calculatePathMatrix,
    floydWarshallPaths,
    floydWarshallDistances,

    // Componentes conexas
    connectedComponents: findConnectedComponents,
    isStronglyConnected,

    // Ciclo hamiltoniano
    hamiltonianCycle: findMinimumHamiltonianCycle,
    generateHamiltonianPaths,
    calculatePathCost,
    isEdgeInOptimalPath,

    // Utilidades
    utils: {
        validateAdjacencyMatrix,
        deepCopyMatrix,
        parseMatrixToNumbers,
        createIdentityMatrix,
        adjacencyMatrixToEdgeList,
        calculateVertexDegrees,
        isCompleteGraph,
        generatePermutations
    }
};

export default graphTheory;