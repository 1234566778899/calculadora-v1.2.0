/**
 * Algoritmos de procesamiento de imágenes
 * Filtros: Laplaciano, Media, Mediana
 * Histogramas: Expansión, Ecualización
 */

// ==================== CONSTANTES ====================

// Máscaras predefinidas para filtro Laplaciano
export const LAPLACIAN_MASKS = [
    [0, -1, 0, -1, 4, -1, 0, -1, 0],       // Máscara 1
    [0, 1, 0, 1, -4, 1, 0, 1, 0],          // Máscara 2  
    [1, 1, 1, 1, -8, 1, 1, 1, 1],          // Máscara 3
    [-1, -1, -1, -1, 8, -1, -1, -1, -1]    // Máscara 4
];

// Máscaras predefinidas para filtro de Media
export const MEAN_MASKS = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],           // Máscara uniforme
    [1, 2, 1, 2, 4, 2, 1, 2, 1]            // Máscara gaussiana
];

// ==================== FUNCIONES HELPER ====================

/**
 * Valida que una matriz sea válida para procesamiento
 */
export const validateMatrix = (matrix) => {
    if (!Array.isArray(matrix) || matrix.length === 0) {
        throw new Error('Matriz inválida: debe ser un array no vacío');
    }

    const size = matrix.length;
    if (!matrix.every(row => Array.isArray(row) && row.length === size)) {
        throw new Error('Matriz inválida: debe ser cuadrada');
    }

    return true;
};

/**
 * Convierte array plano a matriz 3x3 (para máscaras)
 */
export const arrayToMatrix3x3 = (arr) => {
    if (arr.length !== 9) {
        throw new Error('Array debe tener exactamente 9 elementos');
    }

    const matrix = [];
    for (let i = 0; i < 3; i++) {
        matrix[i] = [];
        for (let j = 0; j < 3; j++) {
            matrix[i][j] = parseFloat(arr[i * 3 + j]) || 0;
        }
    }
    return matrix;
};

/**
 * Normaliza matriz a rango [0, maxValue]
 */
export const normalizeMatrix = (matrix, maxValue = 7) => {
    const flatMatrix = matrix.flat();
    const min = Math.min(...flatMatrix);
    const max = Math.max(...flatMatrix);

    if (min === max) return matrix; // Evitar división por cero

    const range = max - min;
    return matrix.map(row =>
        row.map(val => Math.round((maxValue / range) * (val - min)))
    );
};

/**
 * Obtiene vecinos válidos de una posición en la matriz
 */
export const getNeighbors = (matrix, row, col, kernelSize = 3) => {
    const neighbors = [];
    const offset = Math.floor(kernelSize / 2);

    for (let i = -offset; i <= offset; i++) {
        for (let j = -offset; j <= offset; j++) {
            const newRow = row + i;
            const newCol = col + j;

            if (newRow >= 0 && newRow < matrix.length &&
                newCol >= 0 && newCol < matrix[0].length) {
                neighbors.push(matrix[newRow][newCol]);
            }
        }
    }

    return neighbors;
};

// ==================== FILTROS ====================

/**
 * Aplica filtro Laplaciano para detección de bordes
 */
export const applyLaplacianFilter = (matrix, maskArray) => {
    validateMatrix(matrix);

    const size = matrix.length;
    const mask = arrayToMatrix3x3(maskArray);
    const result = Array(size).fill().map(() => Array(size).fill(0));

    // Aplicar convolución
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let sum = 0;

            // Aplicar máscara 3x3
            for (let mi = 0; mi < 3; mi++) {
                for (let mj = 0; mj < 3; mj++) {
                    const matrixRow = i + mi - 1;
                    const matrixCol = j + mj - 1;

                    // Solo procesar si está dentro de los límites
                    if (matrixRow >= 0 && matrixRow < size &&
                        matrixCol >= 0 && matrixCol < size) {
                        sum += matrix[matrixRow][matrixCol] * mask[mi][mj];
                    }
                }
            }

            result[i][j] = sum;
        }
    }

    // Normalizar resultado
    return normalizeMatrix(result);
};

/**
 * Aplica filtro de Media para suavizado
 */
export const applyMeanFilter = (matrix, maskArray) => {
    validateMatrix(matrix);

    const size = matrix.length;
    const mask = arrayToMatrix3x3(maskArray);
    const result = Array(size).fill().map(() => Array(size).fill(0));

    // Calcular suma de la máscara para normalización
    const maskSum = mask.flat().reduce((sum, val) => sum + val, 0);
    if (maskSum === 0) throw new Error('La suma de la máscara no puede ser cero');

    // Aplicar filtro
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let sum = 0;

            for (let mi = 0; mi < 3; mi++) {
                for (let mj = 0; mj < 3; mj++) {
                    const matrixRow = i + mi - 1;
                    const matrixCol = j + mj - 1;

                    if (matrixRow >= 0 && matrixRow < size &&
                        matrixCol >= 0 && matrixCol < size) {
                        sum += matrix[matrixRow][matrixCol] * mask[mi][mj];
                    }
                }
            }

            result[i][j] = Math.round(sum / maskSum);
        }
    }

    return result;
};

/**
 * Aplica filtro de Mediana para reducción de ruido
 */
export const applyMedianFilter = (matrix) => {
    validateMatrix(matrix);

    const size = matrix.length;
    const result = Array(size).fill().map(() => Array(size).fill(0));

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            // Obtener vecinos en ventana 3x3
            const neighbors = [];

            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    const newRow = i + di;
                    const newCol = j + dj;

                    if (newRow >= 0 && newRow < size &&
                        newCol >= 0 && newCol < size) {
                        neighbors.push(matrix[newRow][newCol]);
                    }
                }
            }

            // Ordenar y obtener mediana
            neighbors.sort((a, b) => a - b);
            const validNeighbors = neighbors.filter(val => !isNaN(val));

            if (validNeighbors.length > 0) {
                const medianIndex = Math.floor(validNeighbors.length / 2);

                if (validNeighbors.length % 2 === 0) {
                    // Par: promedio de los dos elementos centrales
                    result[i][j] = Math.round(
                        (validNeighbors[medianIndex - 1] + validNeighbors[medianIndex]) / 2
                    );
                } else {
                    // Impar: elemento central
                    result[i][j] = validNeighbors[medianIndex];
                }
            }
        }
    }

    return result;
};

// ==================== HISTOGRAMAS ====================

/**
 * Calcula histograma de una matriz
 */
export const calculateHistogram = (matrix, bins = 8) => {
    validateMatrix(matrix);

    const histogram = Array(bins).fill(0);
    const flatMatrix = matrix.flat();

    flatMatrix.forEach(value => {
        const binIndex = Math.min(Math.floor(value), bins - 1);
        if (binIndex >= 0) {
            histogram[binIndex]++;
        }
    });

    return histogram;
};

/**
 * Expande histograma linealmente a nuevo rango
 */
export const expandHistogram = (histogram, minRange = 1, maxRange = 7) => {
    if (!Array.isArray(histogram) || histogram.length === 0) {
        throw new Error('Histograma inválido');
    }

    const result = [...histogram];
    const currentMin = 0;
    const currentMax = result.length - 1;
    const targetRange = maxRange - minRange;
    const currentRange = currentMax - currentMin;

    if (currentRange === 0) return result;

    // Mapear cada bin al nuevo rango
    const expanded = Array(maxRange - minRange + 1).fill(0);

    for (let i = 0; i < result.length; i++) {
        if (result[i] > 0) {
            const newIndex = Math.round((i / currentRange) * targetRange);
            if (newIndex >= 0 && newIndex < expanded.length) {
                expanded[newIndex] += result[i];
            }
        }
    }

    return expanded;
};

/**
 * Ecualiza histograma para mejorar contraste
 */
export const equalizeHistogram = (histogram) => {
    if (!Array.isArray(histogram) || histogram.length === 0) {
        throw new Error('Histograma inválido');
    }

    const totalPixels = histogram.reduce((sum, count) => sum + count, 0);
    if (totalPixels === 0) return histogram;

    // Calcular función de distribución acumulativa (CDF)
    const cdf = [];
    let cumSum = 0;

    for (let i = 0; i < histogram.length; i++) {
        cumSum += histogram[i];
        cdf[i] = cumSum;
    }

    // Normalizar CDF y mapear a nuevo rango
    const levels = histogram.length - 1;
    const equalized = cdf.map(value =>
        Math.round((value / totalPixels) * levels)
    );

    // Convertir de nuevo a histograma
    const result = Array(histogram.length).fill(0);
    for (let i = 0; i < histogram.length; i++) {
        if (histogram[i] > 0) {
            const newLevel = equalized[i];
            result[newLevel] += histogram[i];
        }
    }

    return result;
};

/**
 * Aplica transformación de histograma a matriz de imagen
 */
export const applyHistogramTransform = (matrix, originalHist, transformedHist) => {
    validateMatrix(matrix);

    const size = matrix.length;
    const result = Array(size).fill().map(() => Array(size).fill(0));

    // Crear lookup table
    const lookupTable = {};
    for (let i = 0; i < originalHist.length; i++) {
        lookupTable[i] = transformedHist[i] || i;
    }

    // Aplicar transformación
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const originalValue = matrix[i][j];
            result[i][j] = lookupTable[originalValue] || originalValue;
        }
    }

    return result;
};

// ==================== EXPORTACIONES PRINCIPALES ====================

export const imageProcessing = {
    // Filtros
    laplacian: applyLaplacianFilter,
    mean: applyMeanFilter,
    median: applyMedianFilter,

    // Histogramas
    calculateHistogram,
    expandHistogram,
    equalizeHistogram,
    applyHistogramTransform,

    // Máscaras predefinidas
    masks: {
        laplacian: LAPLACIAN_MASKS,
        mean: MEAN_MASKS
    },

    // Utilidades
    utils: {
        validateMatrix,
        normalizeMatrix,
        arrayToMatrix3x3,
        getNeighbors
    }
};

export default imageProcessing;