import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook personalizado para manejar localStorage con sincronización reactiva
 * Útil para persistir configuraciones, resultados y estado entre sesiones
 */

const useLocalStorage = (key, defaultValue, options = {}) => {
    const {
        serialize = JSON.stringify,
        deserialize = JSON.parse,
        validator = null,
        syncAcrossTabs = true,
        errorHandler = null,
        namespace = 'mathCalculator'
    } = options;

    // Crear clave con namespace para evitar colisiones
    const namespacedKey = `${namespace}_${key}`;

    // Ref para detectar cambios externos
    const valueRef = useRef(defaultValue);
    const [storedValue, setStoredValue] = useState(() => {
        return getStoredValue(namespacedKey, defaultValue, deserialize, validator, errorHandler);
    });

    /**
     * Lee valor del localStorage de forma segura
     */
    function getStoredValue(storageKey, fallback, deserializeFunc, validatorFunc, onError) {
        // Verificar si estamos en el navegador
        if (typeof window === 'undefined') {
            return fallback;
        }

        try {
            const item = window.localStorage.getItem(storageKey);

            if (item === null) {
                return fallback;
            }

            const parsedValue = deserializeFunc(item);

            // Validar el valor si se proporciona un validador
            if (validatorFunc && !validatorFunc(parsedValue)) {
                console.warn(`Valor inválido en localStorage para clave "${storageKey}". Usando valor por defecto.`);
                return fallback;
            }

            return parsedValue;
        } catch (error) {
            console.error(`Error leyendo localStorage para clave "${storageKey}":`, error);

            if (onError) {
                onError(error, 'read', storageKey);
            }

            return fallback;
        }
    }

    /**
     * Escribe valor al localStorage de forma segura
     */
    const setStoredValueSafe = useCallback((storageKey, value, serializeFunc, onError) => {
        if (typeof window === 'undefined') {
            return false;
        }

        try {
            const serializedValue = serializeFunc(value);
            window.localStorage.setItem(storageKey, serializedValue);
            return true;
        } catch (error) {
            console.error(`Error escribiendo localStorage para clave "${storageKey}":`, error);

            if (onError) {
                onError(error, 'write', storageKey);
            }

            return false;
        }
    }, []);

    /**
     * Actualiza tanto el estado como localStorage
     */
    const setValue = useCallback((value) => {
        try {
            // Permitir función para actualización basada en valor anterior
            const valueToStore = value instanceof Function ? value(storedValue) : value;

            // Validar nuevo valor
            if (validator && !validator(valueToStore)) {
                console.warn(`Intento de guardar valor inválido para clave "${namespacedKey}"`);
                return false;
            }

            setStoredValue(valueToStore);
            valueRef.current = valueToStore;

            const success = setStoredValueSafe(namespacedKey, valueToStore, serialize, errorHandler);

            if (!success) {
                console.warn(`No se pudo persistir el valor para clave "${namespacedKey}"`);
            }

            return success;
        } catch (error) {
            console.error(`Error en setValue para clave "${namespacedKey}":`, error);

            if (errorHandler) {
                errorHandler(error, 'setValue', namespacedKey);
            }

            return false;
        }
    }, [storedValue, namespacedKey, validator, serialize, setStoredValueSafe, errorHandler]);

    /**
     * Elimina el valor del localStorage
     */
    const removeValue = useCallback(() => {
        try {
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(namespacedKey);
            }

            setStoredValue(defaultValue);
            valueRef.current = defaultValue;
            return true;
        } catch (error) {
            console.error(`Error removiendo clave "${namespacedKey}" del localStorage:`, error);

            if (errorHandler) {
                errorHandler(error, 'remove', namespacedKey);
            }

            return false;
        }
    }, [namespacedKey, defaultValue, errorHandler]);

    /**
     * Recarga el valor desde localStorage
     */
    const reloadValue = useCallback(() => {
        const freshValue = getStoredValue(namespacedKey, defaultValue, deserialize, validator, errorHandler);
        setStoredValue(freshValue);
        valueRef.current = freshValue;
        return freshValue;
    }, [namespacedKey, defaultValue, deserialize, validator, errorHandler]);

    /**
     * Verifica si el valor existe en localStorage
     */
    const hasValue = useCallback(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        return window.localStorage.getItem(namespacedKey) !== null;
    }, [namespacedKey]);

    /**
     * Obtiene el tamaño del valor en bytes
     */
    const getValueSize = useCallback(() => {
        if (typeof window === 'undefined') {
            return 0;
        }

        try {
            const item = window.localStorage.getItem(namespacedKey);
            return item ? new Blob([item]).size : 0;
        } catch (error) {
            return 0;
        }
    }, [namespacedKey]);

    /**
     * Maneja cambios en el storage de otras pestañas
     */
    useEffect(() => {
        if (!syncAcrossTabs || typeof window === 'undefined') {
            return;
        }

        const handleStorageChange = (e) => {
            if (e.key !== namespacedKey || e.newValue === null) {
                return;
            }

            try {
                const newValue = deserialize(e.newValue);

                // Solo actualizar si el valor realmente cambió
                if (newValue !== valueRef.current) {
                    setStoredValue(newValue);
                    valueRef.current = newValue;
                }
            } catch (error) {
                console.error(`Error sincronizando cambios de localStorage para clave "${namespacedKey}":`, error);

                if (errorHandler) {
                    errorHandler(error, 'sync', namespacedKey);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [namespacedKey, deserialize, syncAcrossTabs, errorHandler]);

    // Funciones de utilidad para tipos específicos
    const utilities = {
        /**
         * Para matrices
         */
        matrix: {
            saveMatrix: (matrix) => setValue({ type: 'matrix', data: matrix, timestamp: Date.now() }),
            loadMatrix: () => {
                const stored = storedValue;
                return (stored && stored.type === 'matrix') ? stored.data : null;
            }
        },

        /**
         * Para configuraciones
         */
        config: {
            updateConfig: (updates) => setValue(prev => ({ ...prev, ...updates })),
            resetConfig: () => setValue(defaultValue),
            getConfig: (configKey) => storedValue?.[configKey]
        },

        /**
         * Para historial de resultados
         */
        history: {
            addResult: (result) => setValue(prev => {
                const history = Array.isArray(prev) ? prev : [];
                return [...history.slice(-9), { ...result, timestamp: Date.now() }]; // Máximo 10 elementos
            }),
            clearHistory: () => setValue([]),
            getLatest: () => {
                const history = Array.isArray(storedValue) ? storedValue : [];
                return history[history.length - 1] || null;
            }
        },

        /**
         * Para cache de algoritmos
         */
        cache: {
            cacheResult: (algorithmName, input, result) => {
                const cacheKey = `${algorithmName}_${JSON.stringify(input)}`;
                setValue(prev => ({
                    ...prev,
                    [cacheKey]: {
                        result,
                        timestamp: Date.now(),
                        ttl: Date.now() + (1000 * 60 * 30) // 30 minutos TTL
                    }
                }));
            },
            getCachedResult: (algorithmName, input) => {
                const cacheKey = `${algorithmName}_${JSON.stringify(input)}`;
                const cached = storedValue?.[cacheKey];

                if (cached && cached.ttl > Date.now()) {
                    return cached.result;
                }

                return null;
            },
            clearExpiredCache: () => {
                const now = Date.now();
                setValue(prev => {
                    const filtered = {};
                    Object.entries(prev || {}).forEach(([key, value]) => {
                        if (!value.ttl || value.ttl > now) {
                            filtered[key] = value;
                        }
                    });
                    return filtered;
                });
            }
        }
    };

    /**
     * Información de debug
     */
    const debug = {
        key: namespacedKey,
        hasValue: hasValue(),
        valueSize: getValueSize(),
        lastUpdate: valueRef.current !== defaultValue ? new Date().toISOString() : null,
        options: {
            syncAcrossTabs,
            hasValidator: !!validator,
            hasErrorHandler: !!errorHandler,
            namespace
        }
    };

    return [
        storedValue,
        setValue,
        {
            remove: removeValue,
            reload: reloadValue,
            hasValue,
            getSize: getValueSize,
            utilities,
            debug
        }
    ];
};

/**
 * Hook especializado para configuraciones de la aplicación
 */
export const useAppConfig = (defaultConfig = {}) => {
    return useLocalStorage('appConfig', defaultConfig, {
        validator: (value) => typeof value === 'object' && value !== null,
        errorHandler: (error, operation, key) => {
            console.error(`Error en configuración de app (${operation}):`, error);
        }
    });
};

/**
 * Hook especializado para historial de cálculos
 */
export const useCalculationHistory = (maxItems = 10) => {
    const [history, setHistory, { utilities }] = useLocalStorage('calculationHistory', [], {
        validator: (value) => Array.isArray(value),
        errorHandler: (error, operation, key) => {
            console.error(`Error en historial de cálculos (${operation}):`, error);
        }
    });

    const addCalculation = useCallback((calculation) => {
        setHistory(prev => {
            const newHistory = Array.isArray(prev) ? [...prev] : [];
            newHistory.push({
                ...calculation,
                id: Date.now(),
                timestamp: new Date().toISOString()
            });

            // Mantener solo los últimos maxItems elementos
            return newHistory.slice(-maxItems);
        });
    }, [setHistory, maxItems]);

    return [history, addCalculation, utilities.history];
};

/**
 * Hook especializado para cache de resultados
 */
export const useResultCache = (ttlMinutes = 30) => {
    return useLocalStorage('resultCache', {}, {
        validator: (value) => typeof value === 'object' && value !== null,
        errorHandler: (error, operation, key) => {
            console.error(`Error en cache de resultados (${operation}):`, error);
        }
    });
};

export default useLocalStorage;