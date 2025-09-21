/**
 * Algoritmos de criptografía
 * Congruencias lineales, RSA, teoría de números
 */

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Calcula el máximo común divisor (GCD) usando algoritmo de Euclides
 */
export const gcd = (a, b) => {
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
 * Algoritmo extendido de Euclides
 * Retorna {gcd, x, y} donde gcd = ax + by
 */
export const extendedGCD = (a, b) => {
    if (b === 0) {
        return { gcd: a, x: 1, y: 0 };
    }

    const result = extendedGCD(b, a % b);
    const x = result.y;
    const y = result.x - Math.floor(a / b) * result.y;

    return { gcd: result.gcd, x, y };
};

/**
 * Calcula el inverso modular de a módulo m
 * Retorna x tal que (a * x) ≡ 1 (mod m)
 */
export const modularInverse = (a, m) => {
    const result = extendedGCD(a, m);

    if (result.gcd !== 1) {
        throw new Error(`No existe inverso modular de ${a} módulo ${m}`);
    }

    // Asegurar que el resultado sea positivo
    return ((result.x % m) + m) % m;
};

/**
 * Exponenciación modular eficiente
 * Calcula (base^exp) mod mod
 */
export const modularPow = (base, exp, mod) => {
    if (mod === 1) return 0;

    let result = 1;
    base = base % mod;

    while (exp > 0) {
        if (exp % 2 === 1) {
            result = (result * base) % mod;
        }
        exp = Math.floor(exp / 2);
        base = (base * base) % mod;
    }

    return result;
};

/**
 * Verifica si un número es primo
 */
export const isPrime = (n) => {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;

    for (let i = 3; i * i <= n; i += 2) {
        if (n % i === 0) return false;
    }
    return true;
};

/**
 * Genera números primos hasta un límite
 */
export const generatePrimes = (limit) => {
    const primes = [];
    for (let i = 2; i <= limit; i++) {
        if (isPrime(i)) {
            primes.push(i);
        }
    }
    return primes;
};

// ==================== CONGRUENCIAS LINEALES ====================

/**
 * Resuelve congruencia lineal ax ≡ b (mod n)
 * Retorna todas las soluciones en el rango [0, n-1]
 */
export const solveLinearCongruence = (a, b, n) => {
    // Validar entrada
    if (n <= 0) {
        throw new Error('El módulo debe ser positivo');
    }

    if (a === 0) {
        if (b === 0) {
            return {
                solutions: Array.from({ length: n }, (_, i) => i),
                count: n,
                hasInfiniteSolutions: true,
                steps: ['Si a = 0 y b = 0, entonces toda x es solución']
            };
        } else {
            return {
                solutions: [],
                count: 0,
                hasInfiniteSolutions: false,
                steps: ['Si a = 0 y b ≠ 0, no hay solución']
            };
        }
    }

    const steps = [];
    const originalA = a;
    const originalB = b;
    const originalN = n;

    steps.push(`Resolver: ${originalA}x ≡ ${originalB} (mod ${originalN})`);

    // Normalizar a y b al rango [0, n)
    a = ((a % n) + n) % n;
    b = ((b % n) + n) % n;

    if (a !== originalA || b !== originalB) {
        steps.push(`Simplificar: ${a}x ≡ ${b} (mod ${n})`);
    }

    // Calcular GCD(a, n)
    const g = gcd(a, n);
    steps.push(`gcd(${a}, ${n}) = ${g}`);

    // Verificar si hay solución
    if (b % g !== 0) {
        steps.push(`Como ${b} no es divisible por ${g}, no hay solución`);
        return {
            solutions: [],
            count: 0,
            hasInfiniteSolutions: false,
            steps
        };
    }

    // Reducir la ecuación
    const a1 = a / g;
    const b1 = b / g;
    const n1 = n / g;

    steps.push(`Dividir por ${g}: ${a1}x ≡ ${b1} (mod ${n1})`);

    // Encontrar inverso modular de a1 módulo n1
    let inverse;
    try {
        inverse = modularInverse(a1, n1);
        steps.push(`Inverso de ${a1} módulo ${n1} es ${inverse}`);
    } catch (error) {
        steps.push(`Error: ${error.message}`);
        return {
            solutions: [],
            count: 0,
            hasInfiniteSolutions: false,
            steps
        };
    }

    // Calcular solución base
    const x0 = (b1 * inverse) % n1;
    steps.push(`x ≡ ${b1} × ${inverse} ≡ ${x0} (mod ${n1})`);

    // Generar todas las soluciones
    const solutions = [];
    for (let i = 0; i < g; i++) {
        const solution = (x0 + i * n1) % n;
        solutions.push(solution);
    }

    solutions.sort((a, b) => a - b);

    if (g === 1) {
        steps.push(`Solución única: x ≡ ${solutions[0]} (mod ${n})`);
    } else {
        steps.push(`${g} soluciones: x ≡ {${solutions.join(', ')}} (mod ${n})`);
    }

    return {
        solutions,
        count: g,
        hasInfiniteSolutions: false,
        steps,
        verification: solutions.map(x => ({
            x,
            result: (originalA * x) % originalN,
            expected: originalB % originalN,
            isValid: ((originalA * x) % originalN) === (originalB % originalN)
        }))
    };
};

// ==================== ALGORITMO RSA ====================

/**
 * Calcula φ(n) - función de Euler
 */
export const eulerTotient = (n) => {
    if (n <= 1) return 0;

    let result = n;

    // Encontrar todos los factores primos
    for (let p = 2; p * p <= n; p++) {
        if (n % p === 0) {
            // Quitar todas las ocurrencias de p
            while (n % p === 0) {
                n /= p;
            }
            // Aplicar fórmula φ(n) = n * (1 - 1/p)
            result -= result / p;
        }
    }

    // Si n > 1, entonces es primo
    if (n > 1) {
        result -= result / n;
    }

    return Math.floor(result);
};

/**
 * Genera parámetros RSA básicos
 */
export const generateRSAParameters = (p, q) => {
    // Validar que p y q sean primos
    if (!isPrime(p)) {
        throw new Error(`${p} no es primo`);
    }
    if (!isPrime(q)) {
        throw new Error(`${q} no es primo`);
    }
    if (p === q) {
        throw new Error('p y q deben ser diferentes');
    }

    const n = p * q;
    const phi = (p - 1) * (q - 1);

    // Encontrar valores válidos para e (exponente público)
    const validEs = [];
    for (let e = 2; e < phi; e++) {
        if (gcd(e, phi) === 1) {
            validEs.push(e);
        }
    }

    return {
        p,
        q,
        n,
        phi,
        validEs: validEs.slice(0, 20), // Limitar a primeros 20 valores
        maxMessage: n - 1
    };
};

/**
 * Genera claves RSA completas
 */
export const generateRSAKeys = (p, q, e) => {
    const params = generateRSAParameters(p, q);

    if (!params.validEs.includes(e)) {
        throw new Error(`e = ${e} no es válido. Debe ser coprimo con φ(n) = ${params.phi}`);
    }

    // Calcular d (exponente privado)
    const d = modularInverse(e, params.phi);

    return {
        ...params,
        e, // Exponente público
        d, // Exponente privado
        publicKey: { n: params.n, e },
        privateKey: { n: params.n, d },
        keyInfo: {
            publicKeyString: `(${params.n}, ${e})`,
            privateKeyString: `(${params.n}, ${d})`
        }
    };
};

/**
 * Encripta un mensaje usando RSA
 */
export const rsaEncrypt = (message, publicKey) => {
    const { n, e } = publicKey;

    if (message < 0 || message >= n) {
        throw new Error(`Mensaje debe estar en rango [0, ${n - 1}]`);
    }

    const ciphertext = modularPow(message, e, n);

    return {
        plaintext: message,
        ciphertext,
        operation: `${message}^${e} mod ${n} = ${ciphertext}`
    };
};

/**
 * Desencripta un mensaje usando RSA
 */
export const rsaDecrypt = (ciphertext, privateKey) => {
    const { n, d } = privateKey;

    if (ciphertext < 0 || ciphertext >= n) {
        throw new Error(`Texto cifrado debe estar en rango [0, ${n - 1}]`);
    }

    const plaintext = modularPow(ciphertext, d, n);

    return {
        ciphertext,
        plaintext,
        operation: `${ciphertext}^${d} mod ${n} = ${plaintext}`
    };
};

/**
 * Proceso completo RSA (generar claves, encriptar, desencriptar)
 */
export const completeRSAProcess = (p, q, e, message) => {
    try {
        // Generar claves
        const keys = generateRSAKeys(p, q, e);

        // Encriptar
        const encrypted = rsaEncrypt(message, keys.publicKey);

        // Desencriptar para verificar
        const decrypted = rsaDecrypt(encrypted.ciphertext, keys.privateKey);

        return {
            success: true,
            keys,
            encryption: encrypted,
            decryption: decrypted,
            verification: decrypted.plaintext === message,
            steps: [
                `p = ${p}, q = ${q}`,
                `n = p × q = ${keys.n}`,
                `φ(n) = (p-1)(q-1) = ${keys.phi}`,
                `e = ${e} (coprimo con φ(n))`,
                `d = ${keys.d} (inverso de e mod φ(n))`,
                `Clave pública: (${keys.n}, ${keys.e})`,
                `Clave privada: (${keys.n}, ${keys.d})`,
                `Encriptar: ${encrypted.operation}`,
                `Desencriptar: ${decrypted.operation}`
            ]
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            steps: []
        };
    }
};

// ==================== UTILIDADES ADICIONALES ====================

/**
 * Factorización básica de un número
 */
export const factorize = (n) => {
    const factors = [];
    let temp = n;

    for (let i = 2; i * i <= temp; i++) {
        while (temp % i === 0) {
            factors.push(i);
            temp /= i;
        }
    }

    if (temp > 1) {
        factors.push(temp);
    }

    return factors;
};

/**
 * Verifica la seguridad de parámetros RSA
 */
export const checkRSASecurity = (p, q) => {
    const warnings = [];
    const suggestions = [];

    if (p < 100 || q < 100) {
        warnings.push('Primos muy pequeños - inseguro para uso real');
    }

    if (Math.abs(p - q) < Math.max(p, q) * 0.1) {
        warnings.push('p y q son muy cercanos - vulnerable a factorización');
    }

    if (p < 1000 && q < 1000) {
        suggestions.push('Use primos de al menos 3-4 dígitos para mayor seguridad');
    }

    return {
        isSecure: warnings.length === 0,
        warnings,
        suggestions,
        n: p * q,
        bitLength: Math.floor(Math.log2(p * q)) + 1
    };
};

// ==================== EXPORTACIONES PRINCIPALES ====================

export const cryptography = {
    // Teoría de números básica
    gcd,
    extendedGCD,
    modularInverse,
    modularPow,
    isPrime,
    generatePrimes,
    eulerTotient,
    factorize,

    // Congruencias lineales
    linearCongruence: solveLinearCongruence,

    // RSA
    rsa: {
        generateParameters: generateRSAParameters,
        generateKeys: generateRSAKeys,
        encrypt: rsaEncrypt,
        decrypt: rsaDecrypt,
        completeProcess: completeRSAProcess,
        checkSecurity: checkRSASecurity
    }
};

export default cryptography;