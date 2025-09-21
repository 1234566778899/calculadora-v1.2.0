/**
 * Utilidades matemáticas generales
 * Funciones helper para operaciones numéricas, estadística, teoría de números y validación
 */

// ==================== CONSTANTES MATEMÁTICAS ====================

export const MATH_CONSTANTS = {
    PHI: (1 + Math.sqrt(5)) / 2, // Número áureo
    EULER: Math.E,
    PI: Math.PI,
    TAU: 2 * Math.PI,
    SQRT_2: Math.SQRT2,
    SQRT_3: Math.sqrt(3),
    LN_2: Math.LN2,
    LN_10: Math.LN10,
    LOG2_E: Math.LOG2E,
    LOG10_E: Math.LOG10E
};

export const PRECISION = {
    DEFAULT: 10,
    HIGH: 15,
    FINANCIAL: 2,
    SCIENTIFIC: 6
};

// ==================== VALIDACIÓN NUMÉRICA ====================

/**
 * Verifica si un valor es un número válido
 */
export const isValidNumber = (value) => {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

/**
 * Verifica si un número es entero
 */
export const isInteger = (value) => {
    return isValidNumber(value) && Number.isInteger(value);
};

/**
 * Verifica si un número es positivo
 */
export const isPositive = (value) => {
    return isValidNumber(value) && value > 0;
};

/**
 * Verifica si un número está en un rango
 */
export const isInRange = (value, min, max, inclusive = true) => {
    if (!isValidNumber(value)) return false;

    return inclusive
        ? value >= min && value <= max
        : value > min && value < max;
};

/**
 * Convierte a número de forma segura
 */
export const safeNumber = (value, defaultValue = 0) => {
    const num = parseFloat(value);
    return isValidNumber(num) ? num : defaultValue;
};

/**
 * Verifica si un número es par
 */
export const isEven = (value) => {
    return isInteger(value) && value % 2 === 0;
};

/**
 * Verifica si un número es impar
 */
export const isOdd = (value) => {
    return isInteger(value) && value % 2 !== 0;
};

// ==================== OPERACIONES BÁSICAS ====================

/**
 * Calcula el factorial de un número
 */
export const factorial = (n) => {
    if (!isInteger(n) || n < 0) {
        throw new Error('El factorial requiere un entero no negativo');
    }

    if (n === 0 || n === 1) return 1;

    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }

    return result;
};

/**
 * Calcula el factorial con memoización para mejor rendimiento
 */
export const factorialMemo = (() => {
    const cache = new Map([[0, 1], [1, 1]]);

    return (n) => {
        if (!isInteger(n) || n < 0) {
            throw new Error('El factorial requiere un entero no negativo');
        }

        if (cache.has(n)) {
            return cache.get(n);
        }

        let result = cache.get(Math.max(...cache.keys()));
        for (let i = Math.max(...cache.keys()) + 1; i <= n; i++) {
            result *= i;
            cache.set(i, result);
        }

        return result;
    };
})();

/**
 * Calcula combinaciones C(n, k)
 */
export const combinations = (n, k) => {
    if (!isInteger(n) || !isInteger(k) || n < 0 || k < 0 || k > n) {
        throw new Error('Parámetros inválidos para combinaciones');
    }

    if (k === 0 || k === n) return 1;

    // Optimización: C(n, k) = C(n, n-k)
    k = Math.min(k, n - k);

    let result = 1;
    for (let i = 0; i < k; i++) {
        result = result * (n - i) / (i + 1);
    }

    return Math.round(result);
};

/**
 * Calcula permutaciones P(n, k)
 */
export const permutations = (n, k) => {
    if (!isInteger(n) || !isInteger(k) || n < 0 || k < 0 || k > n) {
        throw new Error('Parámetros inválidos para permutaciones');
    }

    let result = 1;
    for (let i = 0; i < k; i++) {
        result *= (n - i);
    }

    return result;
};

/**
 * Calcula la potencia de forma segura
 */
export const safePower = (base, exponent, maxResult = Number.MAX_SAFE_INTEGER) => {
    if (!isValidNumber(base) || !isValidNumber(exponent)) {
        throw new Error('Base y exponente deben ser números válidos');
    }

    const result = Math.pow(base, exponent);

    if (!isFinite(result) || Math.abs(result) > maxResult) {
        throw new Error('El resultado excede el límite permitido');
    }

    return result;
};

// ==================== TEORÍA DE NÚMEROS ====================

/**
 * Verifica si un número es primo
 */
export const isPrime = (n) => {
    if (!isInteger(n) || n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;

    const sqrt = Math.sqrt(n);
    for (let i = 3; i <= sqrt; i += 2) {
        if (n % i === 0) return false;
    }

    return true;
};

/**
 * Encuentra el siguiente número primo
 */
export const nextPrime = (n) => {
    if (!isInteger(n)) {
        throw new Error('Se requiere un número entero');
    }

    let candidate = n + 1;
    while (!isPrime(candidate)) {
        candidate++;
    }

    return candidate;
};

/**
 * Genera números primos hasta un límite usando Criba de Eratóstenes
 */
export const sieveOfEratosthenes = (limit) => {
    if (!isInteger(limit) || limit < 2) {
        return [];
    }

    const isPrimeArray = new Array(limit + 1).fill(true);
    isPrimeArray[0] = isPrimeArray[1] = false;

    for (let i = 2; i * i <= limit; i++) {
        if (isPrimeArray[i]) {
            for (let j = i * i; j <= limit; j += i) {
                isPrimeArray[j] = false;
            }
        }
    }

    return isPrimeArray
        .map((isPrime, index) => isPrime ? index : null)
        .filter(num => num !== null);
};

/**
 * Calcula el máximo común divisor usando algoritmo de Euclides
 */
export const gcd = (a, b) => {
    if (!isInteger(a) || !isInteger(b)) {
        throw new Error('Se requieren números enteros');
    }

    a = Math.abs(a);
    b = Math.abs(b);

    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }

    return a;
};

/**
 * Calcula el mínimo común múltiplo
 */
export const lcm = (a, b) => {
    if (!isInteger(a) || !isInteger(b)) {
        throw new Error('Se requieren números enteros');
    }

    if (a === 0 || b === 0) return 0;

    return Math.abs(a * b) / gcd(a, b);
};

/**
 * Factorización en números primos
 */
export const primeFactorization = (n) => {
    if (!isInteger(n) || n < 2) {
        throw new Error('Se requiere un entero mayor que 1');
    }

    const factors = [];
    let divisor = 2;

    while (divisor * divisor <= n) {
        while (n % divisor === 0) {
            factors.push(divisor);
            n /= divisor;
        }
        divisor++;
    }

    if (n > 1) {
        factors.push(n);
    }

    return factors;
};

// ==================== ESTADÍSTICA ====================

/**
 * Calcula la media aritmética
 */
export const mean = (numbers) => {
    if (!Array.isArray(numbers) || numbers.length === 0) {
        throw new Error('Se requiere un array no vacío');
    }

    const validNumbers = numbers.filter(isValidNumber);
    if (validNumbers.length === 0) {
        throw new Error('No hay números válidos en el array');
    }

    return validNumbers.reduce((sum, num) => sum + num, 0) / validNumbers.length;
};

/**
 * Calcula la mediana
 */
export const median = (numbers) => {
    if (!Array.isArray(numbers) || numbers.length === 0) {
        throw new Error('Se requiere un array no vacío');
    }

    const validNumbers = numbers.filter(isValidNumber).sort((a, b) => a - b);
    if (validNumbers.length === 0) {
        throw new Error('No hay números válidos en el array');
    }

    const middle = Math.floor(validNumbers.length / 2);

    if (validNumbers.length % 2 === 0) {
        return (validNumbers[middle - 1] + validNumbers[middle]) / 2;
    } else {
        return validNumbers[middle];
    }
};

/**
 * Calcula la moda
 */
export const mode = (numbers) => {
    if (!Array.isArray(numbers) || numbers.length === 0) {
        throw new Error('Se requiere un array no vacío');
    }

    const validNumbers = numbers.filter(isValidNumber);
    const frequency = new Map();

    validNumbers.forEach(num => {
        frequency.set(num, (frequency.get(num) || 0) + 1);
    });

    let maxFreq = 0;
    const modes = [];

    for (const [num, freq] of frequency) {
        if (freq > maxFreq) {
            maxFreq = freq;
            modes.length = 0;
            modes.push(num);
        } else if (freq === maxFreq) {
            modes.push(num);
        }
    }

    return modes.length === validNumbers.length ? [] : modes;
};

/**
 * Calcula la varianza
 */
export const variance = (numbers, sample = false) => {
    if (!Array.isArray(numbers) || numbers.length === 0) {
        throw new Error('Se requiere un array no vacío');
    }

    const validNumbers = numbers.filter(isValidNumber);
    if (validNumbers.length < 2) {
        throw new Error('Se requieren al menos 2 números válidos');
    }

    const avg = mean(validNumbers);
    const squaredDiffs = validNumbers.map(num => Math.pow(num - avg, 2));
    const divisor = sample ? validNumbers.length - 1 : validNumbers.length;

    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / divisor;
};

/**
 * Calcula la desviación estándar
 */
export const standardDeviation = (numbers, sample = false) => {
    return Math.sqrt(variance(numbers, sample));
};

/**
 * Calcula estadísticas completas
 */
export const calculateStats = (numbers) => {
    const validNumbers = numbers.filter(isValidNumber);

    if (validNumbers.length === 0) {
        return {
            count: 0,
            mean: null,
            median: null,
            mode: [],
            variance: null,
            standardDeviation: null,
            min: null,
            max: null,
            range: null
        };
    }

    const sorted = [...validNumbers].sort((a, b) => a - b);

    return {
        count: validNumbers.length,
        mean: mean(validNumbers),
        median: median(validNumbers),
        mode: mode(validNumbers),
        variance: validNumbers.length > 1 ? variance(validNumbers) : 0,
        standardDeviation: validNumbers.length > 1 ? standardDeviation(validNumbers) : 0,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        range: sorted[sorted.length - 1] - sorted[0]
    };
};

// ==================== INTERPOLACIÓN Y APROXIMACIÓN ====================

/**
 * Interpolación lineal
 */
export const linearInterpolation = (x0, y0, x1, y1, x) => {
    if (!isValidNumber(x0) || !isValidNumber(y0) ||
        !isValidNumber(x1) || !isValidNumber(y1) || !isValidNumber(x)) {
        throw new Error('Todos los parámetros deben ser números válidos');
    }

    if (x0 === x1) {
        throw new Error('x0 y x1 no pueden ser iguales');
    }

    return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
};

/**
 * Interpolación cuadrática (3 puntos)
 */
export const quadraticInterpolation = (points, x) => {
    if (!Array.isArray(points) || points.length !== 3) {
        throw new Error('Se requieren exactamente 3 puntos');
    }

    const [[x0, y0], [x1, y1], [x2, y2]] = points;

    // Coeficientes del polinomio de Lagrange
    const l0 = ((x - x1) * (x - x2)) / ((x0 - x1) * (x0 - x2));
    const l1 = ((x - x0) * (x - x2)) / ((x1 - x0) * (x1 - x2));
    const l2 = ((x - x0) * (x - x1)) / ((x2 - x0) * (x2 - x1));

    return y0 * l0 + y1 * l1 + y2 * l2;
};

/**
 * Aproximación por mínimos cuadrados (regresión lineal)
 */
export const leastSquares = (points) => {
    if (!Array.isArray(points) || points.length < 2) {
        throw new Error('Se requieren al menos 2 puntos');
    }

    const n = points.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    points.forEach(([x, y]) => {
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
    });

    const denominator = n * sumX2 - sumX * sumX;

    if (Math.abs(denominator) < 1e-10) {
        throw new Error('Los puntos son colineales verticalmente');
    }

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    // Calcular coeficiente de correlación
    const meanX = sumX / n;
    const meanY = sumY / n;

    let sumXDiff2 = 0, sumYDiff2 = 0, sumXYDiff = 0;
    points.forEach(([x, y]) => {
        sumXDiff2 += (x - meanX) ** 2;
        sumYDiff2 += (y - meanY) ** 2;
        sumXYDiff += (x - meanX) * (y - meanY);
    });

    const correlation = sumXYDiff / Math.sqrt(sumXDiff2 * sumYDiff2);

    return {
        slope,
        intercept,
        correlation,
        r2: correlation ** 2,
        equation: `y = ${slope.toFixed(4)}x + ${intercept.toFixed(4)}`
    };
};

// ==================== CONVERSIONES ====================

/**
 * Convierte grados a radianes
 */
export const degToRad = (degrees) => {
    return safeNumber(degrees) * (Math.PI / 180);
};

/**
 * Convierte radianes a grados
 */
export const radToDeg = (radians) => {
    return safeNumber(radians) * (180 / Math.PI);
};

/**
 * Convierte entre bases numéricas
 */
export const convertBase = (number, fromBase, toBase) => {
    if (!isInteger(fromBase) || !isInteger(toBase) ||
        fromBase < 2 || fromBase > 36 || toBase < 2 || toBase > 36) {
        throw new Error('Las bases deben ser enteros entre 2 y 36');
    }

    // Convertir a decimal primero
    const decimal = parseInt(number.toString(), fromBase);

    if (isNaN(decimal)) {
        throw new Error('Número inválido para la base especificada');
    }

    // Convertir a la base objetivo
    return decimal.toString(toBase);
};

// ==================== FORMATEO Y REDONDEO ====================

/**
 * Redondea a un número específico de decimales
 */
export const roundTo = (number, decimals = 0) => {
    const num = safeNumber(number);
    const multiplier = Math.pow(10, decimals);
    return Math.round(num * multiplier) / multiplier;
};

/**
 * Formatea número con separadores de miles
 */
export const formatNumber = (number, options = {}) => {
    const {
        decimals = 2,
        thousandsSeparator = ',',
        decimalSeparator = '.',
        prefix = '',
        suffix = ''
    } = options;

    const num = safeNumber(number);
    const rounded = roundTo(num, decimals);
    const parts = rounded.toString().split('.');

    // Agregar separadores de miles
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

    // Asegurar decimales correctos
    if (decimals > 0) {
        if (parts.length === 1) {
            parts.push('0'.repeat(decimals));
        } else {
            parts[1] = parts[1].padEnd(decimals, '0');
        }
    }

    const formatted = parts.join(decimalSeparator);
    return `${prefix}${formatted}${suffix}`;
};

/**
 * Convierte a notación científica
 */
export const toScientificNotation = (number, precision = 2) => {
    const num = safeNumber(number);
    return num.toExponential(precision);
};

// ==================== FUNCIONES ESPECIALES ====================

/**
 * Sucesión de Fibonacci
 */
export const fibonacci = (n) => {
    if (!isInteger(n) || n < 0) {
        throw new Error('Se requiere un entero no negativo');
    }

    if (n <= 1) return n;

    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
        [a, b] = [b, a + b];
    }

    return b;
};

/**
 * Números de Catalan
 */
export const catalan = (n) => {
    if (!isInteger(n) || n < 0) {
        throw new Error('Se requiere un entero no negativo');
    }

    if (n <= 1) return 1;

    return combinations(2 * n, n) / (n + 1);
};

/**
 * Suma de divisores de un número
 */
export const sumOfDivisors = (n) => {
    if (!isInteger(n) || n <= 0) {
        throw new Error('Se requiere un entero positivo');
    }

    let sum = 0;
    for (let i = 1; i <= Math.sqrt(n); i++) {
        if (n % i === 0) {
            sum += i;
            if (i !== n / i) {
                sum += n / i;
            }
        }
    }

    return sum;
};

// ==================== EXPORTACIÓN ====================

export const mathHelpers = {
    // Constantes
    MATH_CONSTANTS,
    PRECISION,

    // Validación
    isValidNumber,
    isInteger,
    isPositive,
    isInRange,
    safeNumber,
    isEven,
    isOdd,

    // Operaciones básicas
    factorial,
    factorialMemo,
    combinations,
    permutations,
    safePower,

    // Teoría de números
    isPrime,
    nextPrime,
    sieveOfEratosthenes,
    gcd,
    lcm,
    primeFactorization,

    // Estadística
    mean,
    median,
    mode,
    variance,
    standardDeviation,
    calculateStats,

    // Interpolación
    linearInterpolation,
    quadraticInterpolation,
    leastSquares,

    // Conversiones
    degToRad,
    radToDeg,
    convertBase,

    // Formateo
    roundTo,
    formatNumber,
    toScientificNotation,

    // Funciones especiales
    fibonacci,
    catalan,
    sumOfDivisors
};

export default mathHelpers;