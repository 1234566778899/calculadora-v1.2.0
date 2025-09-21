/**
 * Utilidades para operaciones matriciales comunes
 * Funciones helper para validación, conversión, operaciones básicas y generación
 */

// ==================== VALIDACIÓN ====================

/**
 * Verifica si un valor es una matriz válida
 */
export const isMatrix = (matrix) => {
    return Array.isArray(matrix) &&
        matrix.length > 0 &&
        matrix.every(row => Array.isArray(row));
};

/**
 * Verifica si una matriz es cuadrada
 */
export const isSquareMatrix = (matrix) => {
    if (!isMatrix(matrix)) return false;

    const size = matrix.length;
    return matrix.every(row => row.length === size);
};

/**
 * Verifica si una matriz es rectangular válida
 */
export const isRectangularMatrix = (matrix) => {
    if (!isMatrix(matrix)) return false;

    const firstRowLength = matrix[0].length;
    return matrix.every(row => row.length === firstRowLength);
};

/**
 * Verifica si una matriz contiene solo números
 */
export const isNumericMatrix = (matrix) => {
    if (!isMatrix(matrix)) return false;

    return matrix.every(row =>
        row.every(val => typeof val === 'number' && !isNaN(val))
    );
};

/**
 * Verifica si una matriz es simétrica
 */
export const isSymmetricMatrix = (matrix) => {
    if (!isSquareMatrix(matrix)) return false;

    const size = matrix.length;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (matrix[i][j] !== matrix[j][i]) {
                return false;
            }
        }
    }
    return true;
};

/**
 * Verifica si una matriz es diagonal
 */
export const isDiagonalMatrix = (matrix) => {
    if (!isSquareMatrix(matrix)) return false;

    const size = matrix.length;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (i !== j && matrix[i][j] !== 0) {
                return false;
            }
        }
    }
    return true;
};

/**
 * Verifica si una matriz es la matriz identidad
 */
export const isIdentityMatrix = (matrix) => {
    if (!isSquareMatrix(matrix)) return false;

    const size = matrix.length;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const expectedValue = i === j ? 1 : 0;
            if (matrix[i][j] !== expectedValue) {
                return false;
            }
        }
    }
    return true;
};

// ==================== CONVERSIÓN Y FORMATEO ====================

/**
 * Convierte una matriz a números, reemplazando valores inválidos por defaultValue
 */
export const toNumericMatrix = (matrix, defaultValue = 0) => {
    if (!isMatrix(matrix)) {
        throw new Error('Entrada inválida: se esperaba una matriz');
    }

    return matrix.map(row =>
        row.map(val => {
            const num = parseFloat(val);
            return isNaN(num) ? defaultValue : num;
        })
    );
};

/**
 * Convierte matriz a array plano por filas
 */
export const matrixToFlatArray = (matrix) => {
    if (!isMatrix(matrix)) {
        throw new Error('Entrada inválida: se esperaba una matriz');
    }

    return matrix.flat();
};

/**
 * Convierte array plano a matriz con dimensiones especificadas
 */
export const flatArrayToMatrix = (array, rows, cols) => {
    if (!Array.isArray(array)) {
        throw new Error('Entrada inválida: se esperaba un array');
    }

    if (array.length !== rows * cols) {
        throw new Error(`El array debe tener ${rows * cols} elementos para una matriz ${rows}x${cols}`);
    }

    const matrix = [];
    for (let i = 0; i < rows; i++) {
        matrix[i] = [];
        for (let j = 0; j < cols; j++) {
            matrix[i][j] = array[i * cols + j];
        }
    }

    return matrix;
};

/**
 * Convierte matriz a string formateado
 */
export const matrixToString = (matrix, options = {}) => {
    const {
        delimiter = '\t',
        precision = null,
        brackets = false,
        rowSeparator = '\n'
    } = options;

    if (!isMatrix(matrix)) {
        return '';
    }

    const formatValue = (val) => {
        if (precision !== null && typeof val === 'number') {
            return val.toFixed(precision);
        }
        return val.toString();
    };

    const formattedRows = matrix.map(row =>
        row.map(formatValue).join(delimiter)
    );

    const result = formattedRows.join(rowSeparator);

    if (brackets) {
        return `[${result.replace(/\n/g, ']\n[')}]`;
    }

    return result;
};

/**
 * Parsea string a matriz
 */
export const stringToMatrix = (str, options = {}) => {
    const {
        delimiter = /[\s,\t]+/,
        rowSeparator = /\n|\r\n?/,
        parseNumbers = true
    } = options;

    if (typeof str !== 'string' || str.trim() === '') {
        return [];
    }

    const rows = str.trim().split(rowSeparator);
    const matrix = rows.map(row => {
        const values = row.trim().split(delimiter).filter(val => val !== '');

        if (parseNumbers) {
            return values.map(val => {
                const num = parseFloat(val);
                return isNaN(num) ? val : num;
            });
        }

        return values;
    });

    // Validar que todas las filas tengan la misma longitud
    if (!isRectangularMatrix(matrix)) {
        throw new Error('Matriz inválida: todas las filas deben tener la misma longitud');
    }

    return matrix;
};

// ==================== GENERACIÓN DE MATRICES ====================

/**
 * Crea matriz vacía con dimensiones especificadas
 */
export const createMatrix = (rows, cols, defaultValue = 0) => {
    if (rows <= 0 || cols <= 0) {
        throw new Error('Las dimensiones deben ser positivas');
    }

    const matrix = [];
    for (let i = 0; i < rows; i++) {
        matrix[i] = [];
        for (let j = 0; j < cols; j++) {
            matrix[i][j] = defaultValue;
        }
    }

    return matrix;
};

/**
 * Crea matriz cuadrada
 */
export const createSquareMatrix = (size, defaultValue = 0) => {
    return createMatrix(size, size, defaultValue);
};

/**
 * Crea matriz identidad
 */
export const createIdentityMatrix = (size) => {
    const matrix = createSquareMatrix(size, 0);

    for (let i = 0; i < size; i++) {
        matrix[i][i] = 1;
    }

    return matrix;
};

/**
 * Crea matriz diagonal con valores especificados
 */
export const createDiagonalMatrix = (values) => {
    if (!Array.isArray(values)) {
        throw new Error('Se esperaba un array de valores');
    }

    const size = values.length;
    const matrix = createSquareMatrix(size, 0);

    for (let i = 0; i < size; i++) {
        matrix[i][i] = values[i];
    }

    return matrix;
};

/**
 * Crea matriz aleatoria
 */
export const createRandomMatrix = (rows, cols, options = {}) => {
    const {
        min = 0,
        max = 10,
        integers = true,
        seed = null
    } = options;

    // Simple seeded random si se proporciona seed
    let rng = Math.random;
    if (seed !== null) {
        let seedValue = seed;
        rng = () => {
            seedValue = (seedValue * 9301 + 49297) % 233280;
            return seedValue / 233280;
        };
    }

    const matrix = [];
    for (let i = 0; i < rows; i++) {
        matrix[i] = [];
        for (let j = 0; j < cols; j++) {
            const value = min + rng() * (max - min);
            matrix[i][j] = integers ? Math.floor(value) : value;
        }
    }

    return matrix;
};

/**
 * Crea matriz de adyacencia para grafo completo
 */
export const createCompleteGraphMatrix = (vertices, weight = 1) => {
    const matrix = createSquareMatrix(vertices, 0);

    for (let i = 0; i < vertices; i++) {
        for (let j = 0; j < vertices; j++) {
            if (i !== j) {
                matrix[i][j] = weight;
            }
        }
    }

    return matrix;
};

// ==================== OPERACIONES BÁSICAS ====================

/**
 * Copia profunda de una matriz
 */
export const deepCopyMatrix = (matrix) => {
    if (!isMatrix(matrix)) {
        throw new Error('Entrada inválida: se esperaba una matriz');
    }

    return matrix.map(row => [...row]);
};

/**
 * Transpone una matriz
 */
export const transposeMatrix = (matrix) => {
    if (!isMatrix(matrix)) {
        throw new Error('Entrada inválida: se esperaba una matriz');
    }

    const rows = matrix.length;
    const cols = matrix[0].length;
    const transposed = [];

    for (let j = 0; j < cols; j++) {
        transposed[j] = [];
        for (let i = 0; i < rows; i++) {
            transposed[j][i] = matrix[i][j];
        }
    }

    return transposed;
};

/**
 * Suma de matrices
 */
export const addMatrices = (matrix1, matrix2) => {
    if (!isMatrix(matrix1) || !isMatrix(matrix2)) {
        throw new Error('Ambas entradas deben ser matrices');
    }

    if (matrix1.length !== matrix2.length ||
        matrix1[0].length !== matrix2[0].length) {
        throw new Error('Las matrices deben tener las mismas dimensiones');
    }

    return matrix1.map((row, i) =>
        row.map((val, j) => val + matrix2[i][j])
    );
};

/**
 * Resta de matrices
 */
export const subtractMatrices = (matrix1, matrix2) => {
    if (!isMatrix(matrix1) || !isMatrix(matrix2)) {
        throw new Error('Ambas entradas deben ser matrices');
    }

    if (matrix1.length !== matrix2.length ||
        matrix1[0].length !== matrix2[0].length) {
        throw new Error('Las matrices deben tener las mismas dimensiones');
    }

    return matrix1.map((row, i) =>
        row.map((val, j) => val - matrix2[i][j])
    );
};

/**
 * Multiplicación escalar
 */
export const scalarMultiply = (matrix, scalar) => {
    if (!isMatrix(matrix)) {
        throw new Error('Entrada inválida: se esperaba una matriz');
    }

    if (typeof scalar !== 'number') {
        throw new Error('El escalar debe ser un número');
    }

    return matrix.map(row =>
        row.map(val => val * scalar)
    );
};

/**
 * Multiplicación de matrices
 */
export const multiplyMatrices = (matrix1, matrix2) => {
    if (!isMatrix(matrix1) || !isMatrix(matrix2)) {
        throw new Error('Ambas entradas deben ser matrices');
    }

    const rows1 = matrix1.length;
    const cols1 = matrix1[0].length;
    const rows2 = matrix2.length;
    const cols2 = matrix2[0].length;

    if (cols1 !== rows2) {
        throw new Error('Incompatibles para multiplicación: columnas de A debe igual filas de B');
    }

    const result = createMatrix(rows1, cols2, 0);

    for (let i = 0; i < rows1; i++) {
        for (let j = 0; j < cols2; j++) {
            for (let k = 0; k < cols1; k++) {
                result[i][j] += matrix1[i][k] * matrix2[k][j];
            }
        }
    }

    return result;
};

// ==================== ANÁLISIS ====================

/**
 * Obtiene dimensiones de una matriz
 */
export const getMatrixDimensions = (matrix) => {
    if (!isMatrix(matrix)) {
        return { rows: 0, cols: 0 };
    }

    return {
        rows: matrix.length,
        cols: matrix[0].length
    };
};

/**
 * Calcula estadísticas de una matriz numérica
 */
export const getMatrixStats = (matrix) => {
    if (!isMatrix(matrix)) {
        throw new Error('Entrada inválida: se esperaba una matriz');
    }

    const flatValues = matrixToFlatArray(matrix);
    const numericValues = flatValues.filter(val => typeof val === 'number' && !isNaN(val));

    if (numericValues.length === 0) {
        return {
            count: 0,
            sum: 0,
            mean: null,
            min: null,
            max: null,
            zeros: flatValues.filter(val => val === 0).length,
            nonZeros: flatValues.filter(val => val !== 0).length
        };
    }

    const sum = numericValues.reduce((acc, val) => acc + val, 0);
    const mean = sum / numericValues.length;
    const min = Math.min(...numericValues);
    const max = Math.max(...numericValues);

    return {
        count: numericValues.length,
        sum,
        mean,
        min,
        max,
        zeros: numericValues.filter(val => val === 0).length,
        nonZeros: numericValues.filter(val => val !== 0).length
    };
};

/**
 * Encuentra elementos específicos en la matriz
 */
export const findInMatrix = (matrix, predicate) => {
    if (!isMatrix(matrix)) {
        throw new Error('Entrada inválida: se esperaba una matriz');
    }

    const results = [];

    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (predicate(matrix[i][j], i, j)) {
                results.push({
                    value: matrix[i][j],
                    row: i,
                    col: j
                });
            }
        }
    }

    return results;
};

/**
 * Compara dos matrices
 */
export const matricesEqual = (matrix1, matrix2, tolerance = 0) => {
    if (!isMatrix(matrix1) || !isMatrix(matrix2)) {
        return false;
    }

    if (matrix1.length !== matrix2.length ||
        matrix1[0].length !== matrix2[0].length) {
        return false;
    }

    for (let i = 0; i < matrix1.length; i++) {
        for (let j = 0; j < matrix1[i].length; j++) {
            const val1 = matrix1[i][j];
            const val2 = matrix2[i][j];

            if (typeof val1 === 'number' && typeof val2 === 'number') {
                if (Math.abs(val1 - val2) > tolerance) {
                    return false;
                }
            } else if (val1 !== val2) {
                return false;
            }
        }
    }

    return true;
};

// ==================== TRANSFORMACIONES ====================

/**
 * Rota matriz 90 grados en sentido horario
 */
export const rotateMatrix90 = (matrix) => {
    if (!isSquareMatrix(matrix)) {
        throw new Error('Solo se pueden rotar matrices cuadradas');
    }

    const size = matrix.length;
    const rotated = createSquareMatrix(size);

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            rotated[j][size - 1 - i] = matrix[i][j];
        }
    }

    return rotated;
};

/**
 * Refleja matriz horizontalmente
 */
export const flipMatrixHorizontal = (matrix) => {
    if (!isMatrix(matrix)) {
        throw new Error('Entrada inválida: se esperaba una matriz');
    }

    return matrix.map(row => [...row].reverse());
};

/**
 * Refleja matriz verticalmente
 */
export const flipMatrixVertical = (matrix) => {
    if (!isMatrix(matrix)) {
        throw new Error('Entrada inválida: se esperaba una matriz');
    }

    return [...matrix].reverse();
};

/**
 * Redimensiona matriz (rellena o trunca según sea necesario)
 */
export const resizeMatrix = (matrix, newRows, newCols, fillValue = 0) => {
    if (!isMatrix(matrix)) {
        throw new Error('Entrada inválida: se esperaba una matriz');
    }

    const resized = createMatrix(newRows, newCols, fillValue);

    const copyRows = Math.min(matrix.length, newRows);
    const copyCols = Math.min(matrix[0].length, newCols);

    for (let i = 0; i < copyRows; i++) {
        for (let j = 0; j < copyCols; j++) {
            resized[i][j] = matrix[i][j];
        }
    }

    return resized;
};

// ==================== EXPORTACIÓN ====================

export const matrixHelpers = {
    // Validación
    isMatrix,
    isSquareMatrix,
    isRectangularMatrix,
    isNumericMatrix,
    isSymmetricMatrix,
    isDiagonalMatrix,
    isIdentityMatrix,

    // Conversión
    toNumericMatrix,
    matrixToFlatArray,
    flatArrayToMatrix,
    matrixToString,
    stringToMatrix,

    // Generación
    createMatrix,
    createSquareMatrix,
    createIdentityMatrix,
    createDiagonalMatrix,
    createRandomMatrix,
    createCompleteGraphMatrix,

    // Operaciones
    deepCopyMatrix,
    transposeMatrix,
    addMatrices,
    subtractMatrices,
    scalarMultiply,
    multiplyMatrices,

    // Análisis
    getMatrixDimensions,
    getMatrixStats,
    findInMatrix,
    matricesEqual,

    // Transformaciones
    rotateMatrix90,
    flipMatrixHorizontal,
    flipMatrixVertical,
    resizeMatrix
};

export default matrixHelpers;