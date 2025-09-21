import { useState, useCallback, useMemo, useRef } from 'react';
import { imageProcessing } from '../utils/algorithms/imageProcessing';
import { graphTheory } from '../utils/algorithms/graphTheory';
import { cryptography } from '../utils/algorithms/cryptography';
import { gameTheory } from '../utils/algorithms/gameTheory';
import { histograms } from '../utils/algorithms/histograms';

/**
 * Hook unificado para la ejecución de algoritmos con gestión de estado,
 * cache, validación y métricas de rendimiento
 */

const useAlgorithms = (options = {}) => {
    const {
        enableCache = true,
        cacheTTL = 30 * 60 * 1000, // 30 minutos
        enableMetrics = true,
        maxCacheSize = 100,
        onError = null,
        onComplete = null
    } = options;

    // Estado de ejecución
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastResult, setLastResult] = useState(null);
    const [executionHistory, setExecutionHistory] = useState([]);

    // Cache y métricas
    const cacheRef = useRef(new Map());
    const metricsRef = useRef({
        totalExecutions: 0,
        cacheHits: 0,
        cacheMisses: 0,
        averageExecutionTime: 0,
        algorithmStats: {}
    });

    /**
     * Genera clave de cache basada en algoritmo y parámetros
     */
    const generateCacheKey = useCallback((algorithm, params) => {
        try {
            return `${algorithm}_${JSON.stringify(params)}`;
        } catch (error) {
            // Fallback si los parámetros no son serializables
            return `${algorithm}_${Date.now()}_${Math.random()}`;
        }
    }, []);

    /**
     * Limpia cache expirado
     */
    const cleanExpiredCache = useCallback(() => {
        const now = Date.now();
        const cache = cacheRef.current;

        for (const [key, entry] of cache.entries()) {
            if (entry.expires < now) {
                cache.delete(key);
            }
        }
    }, []);

    /**
     * Obtiene resultado del cache si existe y es válido
     */
    const getCachedResult = useCallback((cacheKey) => {
        if (!enableCache) return null;

        const cache = cacheRef.current;
        const entry = cache.get(cacheKey);

        if (entry && entry.expires > Date.now()) {
            metricsRef.current.cacheHits++;
            return entry.result;
        }

        if (entry) {
            cache.delete(cacheKey); // Eliminar entrada expirada
        }

        metricsRef.current.cacheMisses++;
        return null;
    }, [enableCache]);

    /**
     * Guarda resultado en cache
     */
    const setCachedResult = useCallback((cacheKey, result) => {
        if (!enableCache) return;

        const cache = cacheRef.current;

        // Limpiar cache si excede el tamaño máximo
        if (cache.size >= maxCacheSize) {
            // Eliminar las entradas más antiguas
            const entries = Array.from(cache.entries());
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

            for (let i = 0; i < Math.floor(maxCacheSize * 0.3); i++) {
                cache.delete(entries[i][0]);
            }
        }

        cache.set(cacheKey, {
            result,
            timestamp: Date.now(),
            expires: Date.now() + cacheTTL
        });
    }, [enableCache, maxCacheSize, cacheTTL]);

    /**
     * Actualiza métricas de rendimiento
     */
    const updateMetrics = useCallback((algorithm, executionTime, fromCache = false) => {
        if (!enableMetrics) return;

        const metrics = metricsRef.current;

        if (!fromCache) {
            metrics.totalExecutions++;

            // Actualizar promedio de tiempo de ejecución
            const total = metrics.averageExecutionTime * (metrics.totalExecutions - 1);
            metrics.averageExecutionTime = (total + executionTime) / metrics.totalExecutions;

            // Estadísticas por algoritmo
            if (!metrics.algorithmStats[algorithm]) {
                metrics.algorithmStats[algorithm] = {
                    executions: 0,
                    totalTime: 0,
                    averageTime: 0,
                    errors: 0
                };
            }

            const algStats = metrics.algorithmStats[algorithm];
            algStats.executions++;
            algStats.totalTime += executionTime;
            algStats.averageTime = algStats.totalTime / algStats.executions;
        }
    }, [enableMetrics]);

    /**
     * Ejecutor principal de algoritmos con gestión de errores y cache
     */
    const executeAlgorithm = useCallback(async (algorithmPath, params = [], options = {}) => {
        const {
            skipCache = false,
            timeout = 30000,
            validateInput = true,
            transform = null
        } = options;

        setIsLoading(true);
        setError(null);

        const startTime = performance.now();
        const [category, method] = algorithmPath.split('.');
        const cacheKey = generateCacheKey(algorithmPath, params);

        try {
            // Verificar cache primero
            if (!skipCache) {
                const cachedResult = getCachedResult(cacheKey);
                if (cachedResult) {
                    setLastResult(cachedResult);
                    setIsLoading(false);
                    updateMetrics(algorithmPath, 0, true);
                    return cachedResult;
                }
            }

            // Validar que el algoritmo existe
            const algorithmMap = {
                imageProcessing,
                graphTheory,
                cryptography,
                gameTheory,
                histograms
            };

            const algorithmCategory = algorithmMap[category];
            if (!algorithmCategory) {
                throw new Error(`Categoría de algoritmo no encontrada: ${category}`);
            }

            const algorithm = method ? algorithmCategory[method] : algorithmCategory;
            if (!algorithm || typeof algorithm !== 'function') {
                throw new Error(`Algoritmo no encontrado: ${algorithmPath}`);
            }

            // Configurar timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout: El algoritmo tardó demasiado')), timeout);
            });

            // Ejecutar algoritmo
            const executionPromise = Promise.resolve(algorithm(...params));
            const result = await Promise.race([executionPromise, timeoutPromise]);

            // Transformar resultado si se especifica
            const finalResult = transform ? transform(result) : result;

            // Actualizar estado y métricas
            const executionTime = performance.now() - startTime;
            updateMetrics(algorithmPath, executionTime);

            // Guardar en cache
            setCachedResult(cacheKey, finalResult);

            // Actualizar historial
            setExecutionHistory(prev => [...prev.slice(-19), {
                algorithm: algorithmPath,
                params: params.length,
                executionTime,
                timestamp: Date.now(),
                success: true
            }]);

            setLastResult(finalResult);

            if (onComplete) {
                onComplete(algorithmPath, finalResult, executionTime);
            }

            return finalResult;

        } catch (error) {
            const executionTime = performance.now() - startTime;

            // Actualizar métricas de error
            if (enableMetrics && metricsRef.current.algorithmStats[algorithmPath]) {
                metricsRef.current.algorithmStats[algorithmPath].errors++;
            }

            // Actualizar historial con error
            setExecutionHistory(prev => [...prev.slice(-19), {
                algorithm: algorithmPath,
                params: params.length,
                executionTime,
                timestamp: Date.now(),
                success: false,
                error: error.message
            }]);

            setError(error);

            if (onError) {
                onError(error, algorithmPath, params);
            }

            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [
        generateCacheKey,
        getCachedResult,
        setCachedResult,
        updateMetrics,
        enableMetrics,
        onError,
        onComplete
    ]);

    // ==================== ALGORITMOS ESPECÍFICOS ====================

    /**
     * Procesamiento de imágenes
     */
    const imageAlgorithms = useMemo(() => ({
        laplacian: (matrix, mask) => executeAlgorithm('imageProcessing.laplacian', [matrix, mask]),
        mean: (matrix, mask) => executeAlgorithm('imageProcessing.mean', [matrix, mask]),
        median: (matrix) => executeAlgorithm('imageProcessing.median', [matrix]),

        // Funciones de conveniencia con validación
        applyFilter: async (filterType, matrix, mask = null) => {
            if (!matrix || !Array.isArray(matrix)) {
                throw new Error('Matriz inválida para filtro');
            }

            const filterMap = {
                laplacian: 'imageProcessing.laplacian',
                mean: 'imageProcessing.mean',
                median: 'imageProcessing.median'
            };

            const algorithmPath = filterMap[filterType];
            if (!algorithmPath) {
                throw new Error(`Tipo de filtro no válido: ${filterType}`);
            }

            const params = mask ? [matrix, mask] : [matrix];
            return executeAlgorithm(algorithmPath, params);
        }
    }), [executeAlgorithm]);

    /**
     * Teoría de grafos
     */
    const graphAlgorithms = useMemo(() => ({
        pathMatrix: (matrix) => executeAlgorithm('graphTheory.pathMatrix', [matrix]),
        connectedComponents: (matrix) => executeAlgorithm('graphTheory.connectedComponents', [matrix]),
        hamiltonianCycle: (matrix) => executeAlgorithm('graphTheory.hamiltonianCycle', [matrix]),
        floydWarshall: (matrix) => executeAlgorithm('graphTheory.floydWarshallDistances', [matrix]),

        // Análisis completo de grafo
        analyzeGraph: async (matrix) => {
            const [pathMatrix, components, distances] = await Promise.all([
                executeAlgorithm('graphTheory.pathMatrix', [matrix]),
                executeAlgorithm('graphTheory.connectedComponents', [matrix]),
                executeAlgorithm('graphTheory.floydWarshallDistances', [matrix])
            ]);

            return {
                pathMatrix,
                components,
                distances,
                analysis: {
                    isConnected: components.count === 1,
                    vertexCount: matrix.length,
                    edgeCount: matrix.flat().filter(val => val > 0).length
                }
            };
        }
    }), [executeAlgorithm]);

    /**
     * Criptografía
     */
    const cryptoAlgorithms = useMemo(() => ({
        linearCongruence: (a, b, n) => executeAlgorithm('cryptography.linearCongruence', [a, b, n]),
        rsaGenerate: (p, q, e) => executeAlgorithm('cryptography.rsa.generateKeys', [p, q, e]),
        rsaEncrypt: (message, publicKey) => executeAlgorithm('cryptography.rsa.encrypt', [message, publicKey]),
        rsaDecrypt: (ciphertext, privateKey) => executeAlgorithm('cryptography.rsa.decrypt', [ciphertext, privateKey]),

        // Proceso RSA completo
        rsaComplete: (p, q, e, message) => executeAlgorithm('cryptography.rsa.completeProcess', [p, q, e, message])
    }), [executeAlgorithm]);

    /**
     * Teoría de juegos
     */
    const gameAlgorithms = useMemo(() => ({
        nashEquilibria: (matrix) => executeAlgorithm('gameTheory.findNashEquilibria', [matrix]),
        analyzeGame: (matrix) => executeAlgorithm('gameTheory.analyzeGame', [matrix]),
        dominance: (matrix) => executeAlgorithm('gameTheory.analyzeDominance', [matrix])
    }), [executeAlgorithm]);

    /**
     * Histogramas
     */
    const histogramAlgorithms = useMemo(() => ({
        expand: (histogram, min, max) => executeAlgorithm('histograms.expand', [histogram, min, max]),
        equalize: (histogram) => executeAlgorithm('histograms.equalize', [histogram]),
        stats: (histogram) => executeAlgorithm('histograms.stats', [histogram]),
        compare: (hist1, hist2) => executeAlgorithm('histograms.compare', [hist1, hist2])
    }), [executeAlgorithm]);

    // ==================== FUNCIONES DE UTILIDAD ====================

    /**
     * Limpia toda la cache
     */
    const clearCache = useCallback(() => {
        cacheRef.current.clear();
        metricsRef.current.cacheHits = 0;
        metricsRef.current.cacheMisses = 0;
    }, []);

    /**
     * Obtiene métricas de rendimiento
     */
    const getMetrics = useCallback(() => {
        cleanExpiredCache();
        return {
            ...metricsRef.current,
            cacheSize: cacheRef.current.size,
            cacheHitRatio: metricsRef.current.totalExecutions > 0
                ? metricsRef.current.cacheHits / (metricsRef.current.cacheHits + metricsRef.current.cacheMisses)
                : 0
        };
    }, [cleanExpiredCache]);

    /**
     * Valida entrada para algoritmos específicos
     */
    const validateInput = useCallback((algorithmType, input) => {
        switch (algorithmType) {
            case 'matrix':
                return Array.isArray(input) && input.every(row => Array.isArray(row));
            case 'histogram':
                return Array.isArray(input) && input.every(val => typeof val === 'number' && val >= 0);
            case 'number':
                return typeof input === 'number' && !isNaN(input);
            default:
                return true;
        }
    }, []);

    /**
     * Resetea métricas
     */
    const resetMetrics = useCallback(() => {
        metricsRef.current = {
            totalExecutions: 0,
            cacheHits: 0,
            cacheMisses: 0,
            averageExecutionTime: 0,
            algorithmStats: {}
        };
        setExecutionHistory([]);
    }, []);

    return {
        // Estado
        isLoading,
        error,
        lastResult,
        executionHistory,

        // Ejecución directa
        execute: executeAlgorithm,

        // Algoritmos categorizados
        image: imageAlgorithms,
        graph: graphAlgorithms,
        crypto: cryptoAlgorithms,
        game: gameAlgorithms,
        histogram: histogramAlgorithms,

        // Utilidades
        clearCache,
        getMetrics,
        validateInput,
        resetMetrics,

        // Información de configuración
        config: {
            enableCache,
            cacheTTL,
            enableMetrics,
            maxCacheSize
        }
    };
};

export default useAlgorithms;