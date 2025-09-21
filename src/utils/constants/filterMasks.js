/**
 * Máscaras predefinidas para filtros de procesamiento de imágenes
 * Organizadas por tipo de filtro y efecto deseado
 */

// ==================== FILTROS LAPLACIANOS (DETECCIÓN DE BORDES) ====================

/**
 * Filtros Laplacianos básicos para detección de bordes
 * Basados en las máscaras del código original
 */
export const LAPLACIAN_MASKS = {
    // Máscara básica con centro positivo
    BASIC_POSITIVE: {
        name: 'Laplaciano Básico (+)',
        description: 'Filtro básico con centro positivo para detección de bordes',
        mask: [
            0, -1, 0,
            -1, 4, -1,
            0, -1, 0
        ],
        divisor: 1,
        offset: 0
    },

    // Máscara básica con centro negativo
    BASIC_NEGATIVE: {
        name: 'Laplaciano Básico (-)',
        description: 'Filtro básico con centro negativo para detección de bordes',
        mask: [
            0, 1, 0,
            1, -4, 1,
            0, 1, 0
        ],
        divisor: 1,
        offset: 0
    },

    // Máscara de 8 conectividad con centro positivo
    EIGHT_CONNECTED_POSITIVE: {
        name: 'Laplaciano 8-Conectividad (+)',
        description: 'Filtro con 8 vecinos, centro positivo',
        mask: [
            1, 1, 1,
            1, -8, 1,
            1, 1, 1
        ],
        divisor: 1,
        offset: 0
    },

    // Máscara de 8 conectividad con centro negativo
    EIGHT_CONNECTED_NEGATIVE: {
        name: 'Laplaciano 8-Conectividad (-)',
        description: 'Filtro con 8 vecinos, centro negativo',
        mask: [
            -1, -1, -1,
            -1, 8, -1,
            -1, -1, -1
        ],
        divisor: 1,
        offset: 0
    },

    // Máscara diagonal
    DIAGONAL: {
        name: 'Laplaciano Diagonal',
        description: 'Enfatiza bordes diagonales',
        mask: [
            -1, 0, -1,
            0, 4, 0,
            -1, 0, -1
        ],
        divisor: 1,
        offset: 0
    }
};

// ==================== FILTROS DE MEDIA/PROMEDIO (SUAVIZADO) ====================

/**
 * Filtros de media para suavizado de imágenes
 */
export const MEAN_MASKS = {
    // Media uniforme 3x3
    UNIFORM_3X3: {
        name: 'Media Uniforme 3x3',
        description: 'Suavizado uniforme con ventana 3x3',
        mask: [
            1, 1, 1,
            1, 1, 1,
            1, 1, 1
        ],
        divisor: 9,
        offset: 0
    },

    // Media ponderada (centro con mayor peso)
    WEIGHTED_CENTER: {
        name: 'Media Ponderada Centro',
        description: 'Suavizado con mayor peso en el centro',
        mask: [
            1, 2, 1,
            2, 4, 2,
            1, 2, 1
        ],
        divisor: 16,
        offset: 0
    },

    // Media ponderada bordes
    WEIGHTED_EDGES: {
        name: 'Media Ponderada Bordes',
        description: 'Suavizado con mayor peso en los bordes',
        mask: [
            2, 1, 2,
            1, 2, 1,
            2, 1, 2
        ],
        divisor: 12,
        offset: 0
    },

    // Media en cruz
    CROSS: {
        name: 'Media en Cruz',
        description: 'Suavizado solo en direcciones cardinales',
        mask: [
            0, 1, 0,
            1, 1, 1,
            0, 1, 0
        ],
        divisor: 5,
        offset: 0
    }
};

// ==================== FILTROS GAUSSIANOS ====================

/**
 * Filtros Gaussianos para suavizado avanzado
 */
export const GAUSSIAN_MASKS = {
    // Gaussiano aproximado 3x3
    APPROXIMATE_3X3: {
        name: 'Gaussiano Aproximado 3x3',
        description: 'Aproximación de filtro Gaussiano en 3x3',
        mask: [
            1, 2, 1,
            2, 4, 2,
            1, 2, 1
        ],
        divisor: 16,
        offset: 0
    },

    // Gaussiano más suave
    SOFT: {
        name: 'Gaussiano Suave',
        description: 'Filtro Gaussiano con suavizado suave',
        mask: [
            1, 4, 1,
            4, 12, 4,
            1, 4, 1
        ],
        divisor: 32,
        offset: 0
    },

    // Gaussiano estándar
    STANDARD: {
        name: 'Gaussiano Estándar',
        description: 'Filtro Gaussiano estándar',
        mask: [
            1, 2, 1,
            2, 4, 2,
            1, 2, 1
        ],
        divisor: 16,
        offset: 0
    }
};

// ==================== FILTROS DE DETECCIÓN DE BORDES ====================

/**
 * Filtros especializados en detección de bordes
 */
export const EDGE_DETECTION_MASKS = {
    // Sobel horizontal
    SOBEL_HORIZONTAL: {
        name: 'Sobel Horizontal',
        description: 'Detecta bordes horizontales',
        mask: [
            -1, -2, -1,
            0, 0, 0,
            1, 2, 1
        ],
        divisor: 1,
        offset: 128
    },

    // Sobel vertical
    SOBEL_VERTICAL: {
        name: 'Sobel Vertical',
        description: 'Detecta bordes verticales',
        mask: [
            -1, 0, 1,
            -2, 0, 2,
            -1, 0, 1
        ],
        divisor: 1,
        offset: 128
    },

    // Prewitt horizontal
    PREWITT_HORIZONTAL: {
        name: 'Prewitt Horizontal',
        description: 'Detecta bordes horizontales (Prewitt)',
        mask: [
            -1, -1, -1,
            0, 0, 0,
            1, 1, 1
        ],
        divisor: 1,
        offset: 128
    },

    // Prewitt vertical
    PREWITT_VERTICAL: {
        name: 'Prewitt Vertical',
        description: 'Detecta bordes verticales (Prewitt)',
        mask: [
            -1, 0, 1,
            -1, 0, 1,
            -1, 0, 1
        ],
        divisor: 1,
        offset: 128
    },

    // Roberts Cross (aproximado en 3x3)
    ROBERTS_CROSS: {
        name: 'Roberts Cross',
        description: 'Operador Roberts para detección de bordes',
        mask: [
            0, 0, 0,
            0, 1, -1,
            0, -1, 1
        ],
        divisor: 1,
        offset: 128
    }
};

// ==================== FILTROS DE REALCE ====================

/**
 * Filtros para realce y sharpening
 */
export const SHARPENING_MASKS = {
    // Realce básico
    BASIC_SHARPEN: {
        name: 'Realce Básico',
        description: 'Filtro básico de realce',
        mask: [
            0, -1, 0,
            -1, 5, -1,
            0, -1, 0
        ],
        divisor: 1,
        offset: 0
    },

    // Realce intenso
    INTENSE_SHARPEN: {
        name: 'Realce Intenso',
        description: 'Filtro de realce más agresivo',
        mask: [
            -1, -1, -1,
            -1, 9, -1,
            -1, -1, -1
        ],
        divisor: 1,
        offset: 0
    },

    // Unsharp mask
    UNSHARP_MASK: {
        name: 'Máscara de Desenfoque',
        description: 'Filtro unsharp mask para realce',
        mask: [
            0, -1, 0,
            -1, 4, -1,
            0, -1, 0
        ],
        divisor: 1,
        offset: 0
    },

    // Realce suave
    SOFT_SHARPEN: {
        name: 'Realce Suave',
        description: 'Filtro de realce suave',
        mask: [
            0, 0, 0,
            0, 1, 0,
            0, 0, 0
        ],
        divisor: 1,
        offset: 0
    }
};

// ==================== FILTROS ESPECIALES ====================

/**
 * Filtros con efectos especiales
 */
export const SPECIAL_MASKS = {
    // Emboss (relieve)
    EMBOSS: {
        name: 'Relieve (Emboss)',
        description: 'Efecto de relieve o grabado',
        mask: [
            -2, -1, 0,
            -1, 1, 1,
            0, 1, 2
        ],
        divisor: 1,
        offset: 128
    },

    // Emboss diagonal
    EMBOSS_DIAGONAL: {
        name: 'Relieve Diagonal',
        description: 'Efecto de relieve diagonal',
        mask: [
            -1, 0, 1,
            -1, 0, 1,
            -1, 0, 1
        ],
        divisor: 1,
        offset: 128
    },

    // Motion blur horizontal
    MOTION_BLUR_HORIZONTAL: {
        name: 'Desenfoque de Movimiento Horizontal',
        description: 'Simula movimiento horizontal',
        mask: [
            0, 0, 0,
            1, 1, 1,
            0, 0, 0
        ],
        divisor: 3,
        offset: 0
    },

    // Motion blur vertical
    MOTION_BLUR_VERTICAL: {
        name: 'Desenfoque de Movimiento Vertical',
        description: 'Simula movimiento vertical',
        mask: [
            0, 1, 0,
            0, 1, 0,
            0, 1, 0
        ],
        divisor: 3,
        offset: 0
    },

    // Identidad (sin cambio)
    IDENTITY: {
        name: 'Identidad',
        description: 'Filtro que no modifica la imagen',
        mask: [
            0, 0, 0,
            0, 1, 0,
            0, 0, 0
        ],
        divisor: 1,
        offset: 0
    }
};

// ==================== FILTROS DE RUIDO ====================

/**
 * Filtros para reducción de ruido
 */
export const NOISE_REDUCTION_MASKS = {
    // Anti-ruido básico
    BASIC_NOISE_REDUCTION: {
        name: 'Reducción de Ruido Básica',
        description: 'Filtro básico para reducir ruido',
        mask: [
            1, 1, 1,
            1, 2, 1,
            1, 1, 1
        ],
        divisor: 10,
        offset: 0
    },

    // Anti-ruido conservativo
    CONSERVATIVE_NOISE_REDUCTION: {
        name: 'Reducción de Ruido Conservativa',
        description: 'Filtro conservativo que preserva detalles',
        mask: [
            1, 2, 1,
            2, 4, 2,
            1, 2, 1
        ],
        divisor: 16,
        offset: 0
    }
};

// ==================== UTILIDADES PARA MÁSCARAS ====================

/**
 * Convierte máscara plana a matriz 3x3
 */
export const maskToMatrix = (mask) => {
    if (Array.isArray(mask) && mask.length === 9) {
        return [
            [mask[0], mask[1], mask[2]],
            [mask[3], mask[4], mask[5]],
            [mask[6], mask[7], mask[8]]
        ];
    }
    throw new Error('La máscara debe ser un array de 9 elementos');
};

/**
 * Convierte matriz 3x3 a máscara plana
 */
export const matrixToMask = (matrix) => {
    if (Array.isArray(matrix) && matrix.length === 3 &&
        matrix.every(row => Array.isArray(row) && row.length === 3)) {
        return matrix.flat();
    }
    throw new Error('La matriz debe ser 3x3');
};

/**
 * Normaliza una máscara
 */
export const normalizeMask = (mask, targetSum = 1) => {
    const currentSum = mask.reduce((sum, val) => sum + val, 0);
    if (currentSum === 0) return mask;

    const scale = targetSum / currentSum;
    return mask.map(val => val * scale);
};

/**
 * Obtiene todas las máscaras disponibles
 */
export const getAllMasks = () => {
    return {
        laplacian: LAPLACIAN_MASKS,
        mean: MEAN_MASKS,
        gaussian: GAUSSIAN_MASKS,
        edgeDetection: EDGE_DETECTION_MASKS,
        sharpening: SHARPENING_MASKS,
        special: SPECIAL_MASKS,
        noiseReduction: NOISE_REDUCTION_MASKS
    };
};

/**
 * Busca máscara por nombre
 */
export const getMaskByName = (name) => {
    const allMasks = getAllMasks();

    for (const category of Object.values(allMasks)) {
        for (const mask of Object.values(category)) {
            if (mask.name.toLowerCase().includes(name.toLowerCase())) {
                return mask;
            }
        }
    }

    return null;
};

/**
 * Obtiene máscaras por categoría
 */
export const getMasksByCategory = (category) => {
    const categoryMap = {
        'laplacian': LAPLACIAN_MASKS,
        'mean': MEAN_MASKS,
        'gaussian': GAUSSIAN_MASKS,
        'edge': EDGE_DETECTION_MASKS,
        'sharpen': SHARPENING_MASKS,
        'special': SPECIAL_MASKS,
        'noise': NOISE_REDUCTION_MASKS
    };

    return categoryMap[category.toLowerCase()] || {};
};

/**
 * Convierte máscara a formato para componentes
 */
export const maskToInputFormat = (maskObj) => {
    return {
        mask: maskObj.mask,
        name: maskObj.name,
        description: maskObj.description,
        divisor: maskObj.divisor || 1,
        offset: maskObj.offset || 0
    };
};

// ==================== MÁSCARAS POPULARES (PARA UI) ====================

/**
 * Máscaras más utilizadas para selección rápida en UI
 */
export const POPULAR_MASKS = [
    LAPLACIAN_MASKS.BASIC_POSITIVE,
    LAPLACIAN_MASKS.EIGHT_CONNECTED_POSITIVE,
    MEAN_MASKS.UNIFORM_3X3,
    MEAN_MASKS.WEIGHTED_CENTER,
    GAUSSIAN_MASKS.APPROXIMATE_3X3,
    EDGE_DETECTION_MASKS.SOBEL_HORIZONTAL,
    EDGE_DETECTION_MASKS.SOBEL_VERTICAL,
    SHARPENING_MASKS.BASIC_SHARPEN,
    SPECIAL_MASKS.EMBOSS
];

/**
 * Máscaras por defecto para diferentes propósitos
 */
export const DEFAULT_MASKS = {
    LAPLACIAN: LAPLACIAN_MASKS.BASIC_POSITIVE,
    MEAN: MEAN_MASKS.UNIFORM_3X3,
    GAUSSIAN: GAUSSIAN_MASKS.APPROXIMATE_3X3,
    EDGE_DETECTION: EDGE_DETECTION_MASKS.SOBEL_HORIZONTAL,
    SHARPENING: SHARPENING_MASKS.BASIC_SHARPEN,
    SPECIAL: SPECIAL_MASKS.EMBOSS
};

// ==================== EXPORTACIÓN PRINCIPAL ====================

export const filterMasks = {
    // Categorías principales
    laplacian: LAPLACIAN_MASKS,
    mean: MEAN_MASKS,
    gaussian: GAUSSIAN_MASKS,
    edgeDetection: EDGE_DETECTION_MASKS,
    sharpening: SHARPENING_MASKS,
    special: SPECIAL_MASKS,
    noiseReduction: NOISE_REDUCTION_MASKS,

    // Utilidades
    maskToMatrix,
    matrixToMask,
    normalizeMask,
    getAllMasks,
    getMaskByName,
    getMasksByCategory,
    maskToInputFormat,

    // Selecciones curadas
    popular: POPULAR_MASKS,
    defaults: DEFAULT_MASKS
};

export default filterMasks;