import { useState, useCallback, useMemo } from 'react';

/**
 * Hook personalizado para manejar matrices dinámicas
 * Basado en la funcionalidad original de matrices de la aplicación
 */

const useMatrix = (initialSize = 3, options = {}) => {
    const {
        minSize = 2,
        maxSize = 7,
        defaultValue = '',
        initialValues = null,
        validateValue = null,
        onChange = null,
        type = 'square' // 'square', 'rectangular', 'mask'
    } = options;

    // Estado principal de la matriz
    const [size, setSize] = useState(initialSize);
    const [matrix, setMatrix] = useState(() => createInitialMatrix(initialSize, defaultValue, initialValues));

    // Estado para dimensiones rectangulares
    const [rows, setRows] = useState(initialSize);
    const [cols, setCols] = useState(initialSize);

    /**
     * Crea matriz inicial
     */
    function createInitialMatrix(matrixSize, fillValue, values = null) {
        const newMatrix = [];

        for (let i = 0; i < matrixSize; i++) {
            newMatrix[i] = [];
            for (let j = 0; j < matrixSize; j++) {
                if (values && values[i] && values[i][j] !== undefined) {
                    newMatrix[i][j] = values[i][j];
                } else {
                    newMatrix[i][j] = fillValue;
                }
            }
        }

        return newMatrix;
    }

    /**
     * Crea matriz rectangular
     */
    function createRectangularMatrix(numRows, numCols, fillValue, values = null) {
        const newMatrix = [];

        for (let i = 0; i < numRows; i++) {
            newMatrix[i] = [];
            for (let j = 0; j < numCols; j++) {
                if (values && values[i] && values[i][j] !== undefined) {
                    newMatrix[i][j] = values[i][j];
                } else {
                    newMatrix[i][j] = fillValue;
                }
            }
        }

        return newMatrix;
    }

    /**
     * Valida un valor antes de asignarlo
     */
    const validateAndParseValue = useCallback((value) => {
        if (validateValue) {
            return validateValue(value);
        }

        // Validación por defecto
        if (value === '' || value === null || value === undefined) {
            return '';
        }

        const numValue = parseFloat(value);
        return isNaN(numValue) ? value : numValue;
    }, [validateValue]);

    /**
     * Actualiza el tamaño de la matriz (cuadrada)
     */
    const updateSize = useCallback((newSize) => {
        if (newSize < minSize || newSize > maxSize) {
            return false;
        }

        const newMatrix = createInitialMatrix(newSize, defaultValue);

        // Copiar valores existentes
        for (let i = 0; i < Math.min(size, newSize); i++) {
            for (let j = 0; j < Math.min(size, newSize); j++) {
                newMatrix[i][j] = matrix[i][j];
            }
        }

        setSize(newSize);
        setMatrix(newMatrix);

        if (onChange) {
            onChange(newMatrix, { action: 'resize', size: newSize });
        }

        return true;
    }, [size, matrix, minSize, maxSize, defaultValue, onChange]);

    /**
     * Aumenta el tamaño de la matriz
     */
    const increaseSize = useCallback(() => {
        return updateSize(size + 1);
    }, [size, updateSize]);

    /**
     * Disminuye el tamaño de la matriz
     */
    const decreaseSize = useCallback(() => {
        return updateSize(size - 1);
    }, [size, updateSize]);

    /**
     * Actualiza dimensiones rectangulares
     */
    const updateDimensions = useCallback((newRows, newCols) => {
        if (newRows < minSize || newRows > maxSize || newCols < minSize || newCols > maxSize) {
            return false;
        }

        const newMatrix = createRectangularMatrix(newRows, newCols, defaultValue);

        // Copiar valores existentes
        for (let i = 0; i < Math.min(rows, newRows); i++) {
            for (let j = 0; j < Math.min(cols, newCols); j++) {
                if (matrix[i] && matrix[i][j] !== undefined) {
                    newMatrix[i][j] = matrix[i][j];
                }
            }
        }

        setRows(newRows);
        setCols(newCols);
        setMatrix(newMatrix);

        if (onChange) {
            onChange(newMatrix, { action: 'resize', rows: newRows, cols: newCols });
        }

        return true;
    }, [rows, cols, matrix, minSize, maxSize, defaultValue, onChange]);

    /**
     * Actualiza un valor específico de la matriz
     */
    const updateValue = useCallback((row, col, value) => {
        const validatedValue = validateAndParseValue(value);

        setMatrix(prevMatrix => {
            const newMatrix = prevMatrix.map(r => [...r]);
            if (newMatrix[row] && newMatrix[row][col] !== undefined) {
                newMatrix[row][col] = validatedValue;
            }

            if (onChange) {
                onChange(newMatrix, { action: 'update', row, col, value: validatedValue });
            }

            return newMatrix;
        });
    }, [validateAndParseValue, onChange]);

    /**
     * Llena toda la matriz con un valor
     */
    const fillMatrix = useCallback((value) => {
        const validatedValue = validateAndParseValue(value);

        setMatrix(prevMatrix => {
            const newMatrix = prevMatrix.map(row =>
                row.map(() => validatedValue)
            );

            if (onChange) {
                onChange(newMatrix, { action: 'fill', value: validatedValue });
            }

            return newMatrix;
        });
    }, [validateAndParseValue, onChange]);

    /**
     * Limpia la matriz (rellena con defaultValue)
     */
    const clearMatrix = useCallback(() => {
        fillMatrix(defaultValue);
    }, [fillMatrix, defaultValue]);

    /**
     * Establece una matriz completa
     */
    const setMatrixValues = useCallback((newMatrix) => {
        if (!Array.isArray(newMatrix) || !Array.isArray(newMatrix[0])) {
            console.error('setMatrixValues: se esperaba una matriz 2D');
            return false;
        }

        const validatedMatrix = newMatrix.map(row =>
            row.map(value => validateAndParseValue(value))
        );

        // Actualizar dimensiones si es necesario
        const newRows = validatedMatrix.length;
        const newCols = validatedMatrix[0].length;

        if (type === 'rectangular') {
            setRows(newRows);
            setCols(newCols);
        } else {
            setSize(Math.max(newRows, newCols));
        }

        setMatrix(validatedMatrix);

        if (onChange) {
            onChange(validatedMatrix, { action: 'setMatrix' });
        }

        return true;
    }, [validateAndParseValue, onChange, type]);

    /**
     * Copia valores desde un array plano
     */
    const setFromFlatArray = useCallback((flatArray, matrixRows = rows, matrixCols = cols) => {
        if (!Array.isArray(flatArray)) {
            return false;
        }

        const expectedLength = matrixRows * matrixCols;
        if (flatArray.length !== expectedLength) {
            console.warn(`setFromFlatArray: se esperaban ${expectedLength} elementos, se recibieron ${flatArray.length}`);
        }

        const newMatrix = [];
        let index = 0;

        for (let i = 0; i < matrixRows; i++) {
            newMatrix[i] = [];
            for (let j = 0; j < matrixCols; j++) {
                const value = index < flatArray.length ? flatArray[index] : defaultValue;
                newMatrix[i][j] = validateAndParseValue(value);
                index++;
            }
        }

        if (type === 'rectangular') {
            setRows(matrixRows);
            setCols(matrixCols);
        } else {
            setSize(Math.max(matrixRows, matrixCols));
        }

        setMatrix(newMatrix);

        if (onChange) {
            onChange(newMatrix, { action: 'setFromArray', source: flatArray });
        }

        return true;
    }, [rows, cols, defaultValue, validateAndParseValue, onChange, type]);

    /**
     * Convierte matriz a array plano
     */
    const toFlatArray = useCallback(() => {
        return matrix.flat();
    }, [matrix]);

    /**
     * Convierte matriz a números (para algoritmos)
     */
    const toNumberMatrix = useCallback(() => {
        return matrix.map(row =>
            row.map(value => {
                const num = parseFloat(value);
                return isNaN(num) ? 0 : num;
            })
        );
    }, [matrix]);

    /**
     * Verifica si la matriz está vacía
     */
    const isEmpty = useMemo(() => {
        return matrix.every(row =>
            row.every(value => value === '' || value === defaultValue)
        );
    }, [matrix, defaultValue]);

    /**
     * Verifica si la matriz es válida
     */
    const isValid = useMemo(() => {
        return matrix.length > 0 && matrix.every(row => row.length > 0);
    }, [matrix]);

    /**
     * Obtiene estadísticas de la matriz
     */
    const stats = useMemo(() => {
        const flatValues = matrix.flat();
        const numericValues = flatValues
            .map(val => parseFloat(val))
            .filter(val => !isNaN(val));

        return {
            rows: matrix.length,
            cols: matrix[0]?.length || 0,
            totalCells: flatValues.length,
            filledCells: flatValues.filter(val => val !== '' && val !== defaultValue).length,
            numericValues: numericValues.length,
            sum: numericValues.reduce((a, b) => a + b, 0),
            min: numericValues.length > 0 ? Math.min(...numericValues) : null,
            max: numericValues.length > 0 ? Math.max(...numericValues) : null,
            avg: numericValues.length > 0 ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length : null
        };
    }, [matrix, defaultValue]);

    /**
     * Resetea la matriz al estado inicial
     */
    const reset = useCallback(() => {
        const newMatrix = createInitialMatrix(initialSize, defaultValue, initialValues);
        setSize(initialSize);
        setRows(initialSize);
        setCols(initialSize);
        setMatrix(newMatrix);

        if (onChange) {
            onChange(newMatrix, { action: 'reset' });
        }
    }, [initialSize, defaultValue, initialValues, onChange]);

    // Funciones específicas para tipos de matrices
    const matrixTypeHelpers = useMemo(() => {
        if (type === 'mask') {
            return {
                setMask: (maskArray) => {
                    if (maskArray.length === 9) {
                        const mask3x3 = [
                            [maskArray[0], maskArray[1], maskArray[2]],
                            [maskArray[3], maskArray[4], maskArray[5]],
                            [maskArray[6], maskArray[7], maskArray[8]]
                        ];
                        setMatrixValues(mask3x3);
                    }
                }
            };
        }

        if (type === 'adjacency') {
            return {
                setEdge: (from, to, weight = 1) => {
                    updateValue(from, to, weight);
                },
                removeEdge: (from, to) => {
                    updateValue(from, to, 0);
                },
                isSymmetric: () => {
                    const numMatrix = toNumberMatrix();
                    for (let i = 0; i < numMatrix.length; i++) {
                        for (let j = 0; j < numMatrix[i].length; j++) {
                            if (numMatrix[i][j] !== numMatrix[j][i]) {
                                return false;
                            }
                        }
                    }
                    return true;
                }
            };
        }

        return {};
    }, [type, setMatrixValues, updateValue, toNumberMatrix]);

    return {
        // Estado
        matrix,
        size,
        rows,
        cols,

        // Modificación
        updateValue,
        fillMatrix,
        clearMatrix,
        setMatrixValues,
        setFromFlatArray,

        // Redimensionamiento
        updateSize,
        increaseSize,
        decreaseSize,
        updateDimensions,

        // Conversión
        toFlatArray,
        toNumberMatrix,

        // Estado computado
        isEmpty,
        isValid,
        stats,

        // Utilidades
        reset,

        // Helpers específicos por tipo
        ...matrixTypeHelpers,

        // Metadatos
        config: {
            minSize,
            maxSize,
            defaultValue,
            type
        }
    };
};

export default useMatrix;