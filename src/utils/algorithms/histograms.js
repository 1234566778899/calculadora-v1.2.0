/**
 * Algoritmos de análisis y transformación de histogramas
 * Expansión, ecualización, estadísticas y visualización
 */

// ==================== CONSTANTES ====================

export const DEFAULT_BINS = 8;
export const DEFAULT_RANGE = { min: 0, max: 7 };
export const CANVAS_CONFIG = {
    width: 600,
    height: 300,
    margin: { top: 20, right: 20, bottom: 40, left: 40 },
    barColor: '#3f51b5',
    gridColor: '#e0e0e0',
    textColor: '#333333'
};

// ==================== FUNCIONES HELPER ====================

/**
 * Valida que un histograma sea válido
 */
export const validateHistogram = (histogram) => {
    if (!Array.isArray(histogram) || histogram.length === 0) {
        throw new Error('Histograma inválido: debe ser un array no vacío');
    }

    if (!histogram.every(val => typeof val === 'number' && val >= 0)) {
        throw new Error('Histograma inválido: todos los valores deben ser números no negativos');
    }

    return true;
};

/**
 * Valida rango de valores
 */
export const validateRange = (min, max) => {
    if (typeof min !== 'number' || typeof max !== 'number') {
        throw new Error('Rango inválido: min y max deben ser números');
    }

    if (min >= max) {
        throw new Error('Rango inválido: min debe ser menor que max');
    }

    return true;
};

/**
 * Normaliza array de valores a números
 */
export const normalizeToNumbers = (values) => {
    return values.map(val => {
        const num = parseFloat(val);
        return isNaN(num) ? 0 : Math.max(0, num);
    });
};

/**
 * Calcula estadísticas básicas de un histograma
 */
export const calculateHistogramStats = (histogram) => {
    validateHistogram(histogram);

    const total = histogram.reduce((sum, val) => sum + val, 0);
    const nonZeroCount = histogram.filter(val => val > 0).length;
    const max = Math.max(...histogram);
    const min = Math.min(...histogram);

    // Calcular media ponderada
    let weightedSum = 0;
    for (let i = 0; i < histogram.length; i++) {
        weightedSum += i * histogram[i];
    }
    const mean = total > 0 ? weightedSum / total : 0;

    // Calcular varianza
    let varianceSum = 0;
    for (let i = 0; i < histogram.length; i++) {
        varianceSum += histogram[i] * Math.pow(i - mean, 2);
    }
    const variance = total > 0 ? varianceSum / total : 0;
    const stdDev = Math.sqrt(variance);

    return {
        total,
        nonZeroCount,
        max,
        min,
        mean,
        variance,
        stdDev,
        isEmpty: total === 0,
        isUniform: histogram.every(val => val === histogram[0])
    };
};

// ==================== CONSTRUCCIÓN DE HISTOGRAMAS ====================

/**
 * Crea histograma a partir de datos
 */
export const createHistogram = (data, bins = DEFAULT_BINS, range = DEFAULT_RANGE) => {
    if (!Array.isArray(data) || data.length === 0) {
        return Array(bins).fill(0);
    }

    validateRange(range.min, range.max);

    const histogram = Array(bins).fill(0);
    const binWidth = (range.max - range.min) / bins;

    data.forEach(value => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= range.min && numValue <= range.max) {
            let binIndex = Math.floor((numValue - range.min) / binWidth);
            // Manejar el caso del valor máximo
            if (binIndex >= bins) binIndex = bins - 1;
            if (binIndex >= 0) histogram[binIndex]++;
        }
    });

    return histogram;
};

/**
 * Crea histograma desde array de inputs del usuario
 */
export const createHistogramFromInputs = (inputs) => {
    const values = normalizeToNumbers(inputs);
    return values;
};

// ==================== EXPANSIÓN DE HISTOGRAMAS ====================

/**
 * Expande histograma linealmente a nuevo rango
 */
export const expandHistogram = (histogram, targetMin = 1, targetMax = 7) => {
    validateHistogram(histogram);
    validateRange(targetMin, targetMax);

    const sourceLength = histogram.length;
    const targetLength = targetMax - targetMin + 1;
    const result = Array(targetLength).fill(0);

    // Si el histograma está vacío, retornar array vacío
    if (histogram.every(val => val === 0)) {
        return result;
    }

    // Encontrar el rango ocupado en el histograma original
    let firstNonZero = -1;
    let lastNonZero = -1;

    for (let i = 0; i < sourceLength; i++) {
        if (histogram[i] > 0) {
            if (firstNonZero === -1) firstNonZero = i;
            lastNonZero = i;
        }
    }

    // Si solo hay un bin con datos, mapear al rango completo
    if (firstNonZero === lastNonZero) {
        // Distribuir uniformemente en el rango objetivo
        const valuePerBin = histogram[firstNonZero] / targetLength;
        for (let i = 0; i < targetLength; i++) {
            result[i] = Math.round(valuePerBin);
        }
        return result;
    }

    // Mapeo lineal del rango ocupado al rango objetivo
    const sourceRange = lastNonZero - firstNonZero;
    const targetRange = targetLength - 1;

    for (let i = 0; i < sourceLength; i++) {
        if (histogram[i] > 0) {
            // Calcular posición relativa en el rango source
            const relativePos = (i - firstNonZero) / sourceRange;
            // Mapear a posición en el rango target
            const targetIndex = Math.round(relativePos * targetRange);

            if (targetIndex >= 0 && targetIndex < targetLength) {
                result[targetIndex] += histogram[i];
            }
        }
    }

    return result;
};

/**
 * Expande histograma con interpolación
 */
export const expandHistogramInterpolated = (histogram, targetMin = 1, targetMax = 7) => {
    validateHistogram(histogram);
    validateRange(targetMin, targetMax);

    const targetLength = targetMax - targetMin + 1;
    const result = Array(targetLength).fill(0);

    if (histogram.every(val => val === 0)) {
        return result;
    }

    const sourceLength = histogram.length;
    const scale = (sourceLength - 1) / (targetLength - 1);

    for (let i = 0; i < targetLength; i++) {
        const sourceIndex = i * scale;
        const lowerIndex = Math.floor(sourceIndex);
        const upperIndex = Math.min(lowerIndex + 1, sourceLength - 1);
        const fraction = sourceIndex - lowerIndex;

        // Interpolación lineal
        const lowerValue = histogram[lowerIndex] || 0;
        const upperValue = histogram[upperIndex] || 0;
        result[i] = Math.round(lowerValue * (1 - fraction) + upperValue * fraction);
    }

    return result;
};

// ==================== ECUALIZACIÓN DE HISTOGRAMAS ====================

/**
 * Calcula función de distribución acumulativa (CDF)
 */
export const calculateCDF = (histogram) => {
    validateHistogram(histogram);

    const cdf = [];
    let cumSum = 0;

    for (let i = 0; i < histogram.length; i++) {
        cumSum += histogram[i];
        cdf.push(cumSum);
    }

    return cdf;
};

/**
 * Ecualiza histograma para mejorar contraste
 */
export const equalizeHistogram = (histogram) => {
    validateHistogram(histogram);

    const totalPixels = histogram.reduce((sum, count) => sum + count, 0);
    if (totalPixels === 0) {
        return [...histogram];
    }

    const levels = histogram.length;
    const cdf = calculateCDF(histogram);

    // Crear función de mapeo
    const lookupTable = cdf.map(value =>
        Math.round(((value - cdf[0]) / (totalPixels - cdf[0])) * (levels - 1))
    );

    // Aplicar transformación
    const equalized = Array(levels).fill(0);

    for (let i = 0; i < levels; i++) {
        if (histogram[i] > 0) {
            const newLevel = lookupTable[i];
            if (newLevel >= 0 && newLevel < levels) {
                equalized[newLevel] += histogram[i];
            }
        }
    }

    return {
        histogram: equalized,
        cdf: cdf,
        lookupTable: lookupTable,
        transformation: lookupTable.map((newVal, oldVal) => ({ oldVal, newVal }))
    };
};

/**
 * Ecualización adaptativa por segmentos
 */
export const adaptiveEqualization = (histogram, windowSize = 3) => {
    validateHistogram(histogram);

    if (windowSize >= histogram.length) {
        return equalizeHistogram(histogram);
    }

    const result = [...histogram];
    const halfWindow = Math.floor(windowSize / 2);

    for (let i = 0; i < histogram.length; i++) {
        const start = Math.max(0, i - halfWindow);
        const end = Math.min(histogram.length, i + halfWindow + 1);

        const localHistogram = histogram.slice(start, end);
        const localEqualized = equalizeHistogram(localHistogram);

        const localIndex = i - start;
        if (localIndex < localEqualized.histogram.length) {
            result[i] = localEqualized.histogram[localIndex];
        }
    }

    return { histogram: result };
};

// ==================== TRANSFORMACIONES AVANZADAS ====================

/**
 * Aplicar transformación gamma
 */
export const gammaTransform = (histogram, gamma = 1.0) => {
    validateHistogram(histogram);

    const levels = histogram.length;
    const result = Array(levels).fill(0);

    // Crear lookup table con corrección gamma
    const lookupTable = [];
    for (let i = 0; i < levels; i++) {
        const normalized = i / (levels - 1);
        const transformed = Math.pow(normalized, gamma);
        lookupTable[i] = Math.round(transformed * (levels - 1));
    }

    // Aplicar transformación
    for (let i = 0; i < levels; i++) {
        if (histogram[i] > 0) {
            const newLevel = lookupTable[i];
            if (newLevel >= 0 && newLevel < levels) {
                result[newLevel] += histogram[i];
            }
        }
    }

    return {
        histogram: result,
        lookupTable,
        gamma
    };
};

/**
 * Transformación logarítmica
 */
export const logTransform = (histogram, c = 1) => {
    validateHistogram(histogram);

    const levels = histogram.length;
    const result = Array(levels).fill(0);

    const lookupTable = [];
    for (let i = 0; i < levels; i++) {
        const transformed = c * Math.log(1 + i);
        lookupTable[i] = Math.round(Math.min(transformed, levels - 1));
    }

    for (let i = 0; i < levels; i++) {
        if (histogram[i] > 0) {
            const newLevel = lookupTable[i];
            if (newLevel >= 0 && newLevel < levels) {
                result[newLevel] += histogram[i];
            }
        }
    }

    return {
        histogram: result,
        lookupTable
    };
};

// ==================== OPERACIONES ENTRE HISTOGRAMAS ====================

/**
 * Suma de histogramas
 */
export const addHistograms = (hist1, hist2) => {
    validateHistogram(hist1);
    validateHistogram(hist2);

    const maxLength = Math.max(hist1.length, hist2.length);
    const result = Array(maxLength).fill(0);

    for (let i = 0; i < maxLength; i++) {
        result[i] = (hist1[i] || 0) + (hist2[i] || 0);
    }

    return result;
};

/**
 * Diferencia de histogramas
 */
export const subtractHistograms = (hist1, hist2) => {
    validateHistogram(hist1);
    validateHistogram(hist2);

    const maxLength = Math.max(hist1.length, hist2.length);
    const result = Array(maxLength).fill(0);

    for (let i = 0; i < maxLength; i++) {
        result[i] = Math.max(0, (hist1[i] || 0) - (hist2[i] || 0));
    }

    return result;
};

/**
 * Comparación de histogramas usando diferentes métricas
 */
export const compareHistograms = (hist1, hist2) => {
    validateHistogram(hist1);
    validateHistogram(hist2);

    const maxLength = Math.max(hist1.length, hist2.length);

    // Pad histograms to same length
    const h1 = [...hist1, ...Array(maxLength - hist1.length).fill(0)];
    const h2 = [...hist2, ...Array(maxLength - hist2.length).fill(0)];

    // Correlación
    const mean1 = h1.reduce((a, b) => a + b, 0) / h1.length;
    const mean2 = h2.reduce((a, b) => a + b, 0) / h2.length;

    let numerator = 0;
    let sumSq1 = 0;
    let sumSq2 = 0;

    for (let i = 0; i < maxLength; i++) {
        const diff1 = h1[i] - mean1;
        const diff2 = h2[i] - mean2;
        numerator += diff1 * diff2;
        sumSq1 += diff1 * diff1;
        sumSq2 += diff2 * diff2;
    }

    const correlation = (sumSq1 * sumSq2) > 0 ? numerator / Math.sqrt(sumSq1 * sumSq2) : 0;

    // Chi-cuadrado
    let chiSquare = 0;
    for (let i = 0; i < maxLength; i++) {
        const expected = (h1[i] + h2[i]) / 2;
        if (expected > 0) {
            chiSquare += Math.pow(h1[i] - expected, 2) / expected;
            chiSquare += Math.pow(h2[i] - expected, 2) / expected;
        }
    }

    // Intersección
    let intersection = 0;
    for (let i = 0; i < maxLength; i++) {
        intersection += Math.min(h1[i], h2[i]);
    }

    return {
        correlation,
        chiSquare,
        intersection,
        similarity: intersection / Math.max(
            h1.reduce((a, b) => a + b, 0),
            h2.reduce((a, b) => a + b, 0)
        )
    };
};

// ==================== GENERACIÓN DE DATOS PARA CANVAS ====================

/**
 * Prepara datos para visualización en canvas
 */
export const prepareCanvasData = (histogram, config = CANVAS_CONFIG) => {
    validateHistogram(histogram);

    const { width, height, margin } = config;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const maxValue = Math.max(...histogram);
    const barWidth = chartWidth / histogram.length;

    const bars = histogram.map((value, index) => {
        const barHeight = maxValue > 0 ? (value / maxValue) * chartHeight : 0;

        return {
            x: margin.left + index * barWidth,
            y: margin.top + chartHeight - barHeight,
            width: barWidth * 0.8, // Espacio entre barras
            height: barHeight,
            value: value,
            label: index.toString()
        };
    });

    return {
        bars,
        config: {
            ...config,
            chartWidth,
            chartHeight,
            barWidth,
            maxValue
        }
    };
};

// ==================== EXPORTACIONES PRINCIPALES ====================

export const histograms = {
    // Construcción
    create: createHistogram,
    fromInputs: createHistogramFromInputs,

    // Transformaciones principales
    expand: expandHistogram,
    expandInterpolated: expandHistogramInterpolated,
    equalize: equalizeHistogram,
    adaptiveEqualize: adaptiveEqualization,

    // Transformaciones avanzadas
    gamma: gammaTransform,
    log: logTransform,

    // Operaciones
    add: addHistograms,
    subtract: subtractHistograms,
    compare: compareHistograms,

    // Análisis
    stats: calculateHistogramStats,
    cdf: calculateCDF,

    // Visualización
    prepareCanvas: prepareCanvasData,

    // Utilidades
    utils: {
        validate: validateHistogram,
        validateRange,
        normalize: normalizeToNumbers
    },

    // Constantes
    constants: {
        DEFAULT_BINS,
        DEFAULT_RANGE,
        CANVAS_CONFIG
    }
};

export default histograms;