import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Alert,
    Card,
    CardContent,
    Divider,
    Chip,
    FormControlLabel,
    Switch,
    Tooltip,
    IconButton,
    CircularProgress
} from '@mui/material';
import {
    PlayArrow,
    Refresh,
    Save,
    Restore,
    Info,
    TrendingUp,
    BarChart,
    Clear
} from '@mui/icons-material';
import useCanvas from '../../../hooks/useCanvas';
import useAlgorithms from '../../../hooks/useAlgorithms';
import mathHelpers from '../../../utils/helpers/mathHelpers';
import useLocalStorage from '../../../hooks/useLocalStorage';
import canvasHelpers from '../../../utils/helpers/canvasHelpers';



const HistogramExpansion = () => {
    // Estado del histograma
    const [histogramData, setHistogramData] = useState([2, 5, 3, 8, 1, 4, 6, 2]);
    const [expandedData, setExpandedData] = useState(null);
    const [minRange, setMinRange] = useState(1);
    const [maxRange, setMaxRange] = useState(7);
    const [inputValue, setInputValue] = useState('2, 5, 3, 8, 1, 4, 6, 2');

    // Configuración
    const [showInterpolated, setShowInterpolated] = useState(false);
    const [autoSave, setAutoSave] = useState(true);
    const [showStats, setShowStats] = useState(true);
    const [validationError, setValidationError] = useState('');

    // Hook de algoritmos
    const {
        histogram,
        isLoading,
        error,
        getMetrics
    } = useAlgorithms({
        enableCache: true,
        onComplete: (algorithm, result, time) => {
            console.log(`${algorithm} completado en ${time.toFixed(2)}ms`);
        },
        onError: (error, algorithm) => {
            console.error(`Error en ${algorithm}:`, error);
        }
    });

    // Hook de canvas para visualización
    const {
        canvasRef: originalCanvasRef,
        drawHistogram: drawOriginalHistogram,
        clearCanvas: clearOriginalCanvas,
        isReady: originalCanvasReady
    } = useCanvas({
        width: 400,
        height: 200,
        backgroundColor: '#fafafa'
    });

    const {
        canvasRef: expandedCanvasRef,
        drawHistogram: drawExpandedHistogram,
        clearCanvas: clearExpandedCanvas,
        isReady: expandedCanvasReady
    } = useCanvas({
        width: 400,
        height: 200,
        backgroundColor: '#fafafa'
    });

    // Hook de persistencia
    const [savedData, setSavedData] = useLocalStorage('histogramExpansion', {
        histogramData: [2, 5, 3, 8, 1, 4, 6, 2],
        minRange: 1,
        maxRange: 7,
        showInterpolated: false
    });

    // Cargar datos guardados al iniciar
    useEffect(() => {
        if (savedData && Object.keys(savedData).length > 0) {
            const data = savedData.histogramData || [2, 5, 3, 8, 1, 4, 6, 2];
            setHistogramData(data);
            setInputValue(data.join(', '));
            setMinRange(savedData.minRange || 1);
            setMaxRange(savedData.maxRange || 7);
            setShowInterpolated(savedData.showInterpolated || false);
        }
    }, []);

    // Auto-guardar configuración
    useEffect(() => {
        if (autoSave && histogramData.length > 0) {
            setSavedData({
                histogramData,
                minRange,
                maxRange,
                showInterpolated
            });
        }
    }, [histogramData, minRange, maxRange, showInterpolated, autoSave, setSavedData]);

    // Validar entrada de histograma
    const validateHistogramInput = useCallback((input) => {
        try {
            if (!input || input.trim() === '') {
                return { valid: false, error: 'Ingrese valores para el histograma' };
            }

            const values = input.split(',').map(val => val.trim());
            const numbers = values.map(val => {
                const num = mathHelpers.safeNumber(val, null);
                if (num === null || !mathHelpers.isValidNumber(num)) {
                    throw new Error(`"${val}" no es un número válido`);
                }
                if (num < 0) {
                    throw new Error(`Los valores deben ser no negativos`);
                }
                return num;
            });

            if (numbers.length < 2) {
                return { valid: false, error: 'Se requieren al menos 2 valores' };
            }

            if (numbers.length > 20) {
                return { valid: false, error: 'Máximo 20 valores permitidos' };
            }

            return { valid: true, data: numbers, error: '' };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }, []);

    // Validar rango
    const validateRange = useCallback((min, max) => {
        if (!mathHelpers.isValidNumber(min) || !mathHelpers.isValidNumber(max)) {
            return { valid: false, error: 'Min y Max deben ser números válidos' };
        }

        if (min >= max) {
            return { valid: false, error: 'Min debe ser menor que Max' };
        }

        if (max - min > 50) {
            return { valid: false, error: 'El rango no puede exceder 50 unidades' };
        }

        if (max - min < 1) {
            return { valid: false, error: 'El rango debe ser al menos 1 unidad' };
        }

        return { valid: true, error: '' };
    }, []);

    // Calcular expansión del histograma
    const calculateExpansion = useCallback(async () => {
        try {
            setValidationError('');

            // Validar datos
            const rangeValidation = validateRange(minRange, maxRange);
            if (!rangeValidation.valid) {
                setValidationError(rangeValidation.error);
                return;
            }

            if (!Array.isArray(histogramData) || histogramData.length === 0) {
                setValidationError('Datos de histograma inválidos');
                return;
            }

            // Ejecutar algoritmo de expansión
            const result = await histogram.expand(histogramData, minRange, maxRange);

            // Si está habilitado, también calcular versión interpolada
            let interpolatedResult = null;
            if (showInterpolated) {
                interpolatedResult = await histogram.expandInterpolated(
                    histogramData,
                    minRange,
                    maxRange
                );
            }

            // Calcular estadísticas
            const originalStats = mathHelpers.calculateStats(histogramData);
            const expandedStats = mathHelpers.calculateStats(result);

            setExpandedData({
                standard: result,
                interpolated: interpolatedResult,
                originalStats,
                expandedStats
            });

        } catch (error) {
            console.error('Error en expansión:', error);
            setValidationError(error.message);
            setExpandedData(null);
        }
    }, [histogramData, minRange, maxRange, showInterpolated, histogram, validateRange]);

    // Dibujar histograma original
    useEffect(() => {
        if (originalCanvasReady && histogramData && histogramData.length > 0) {
            drawOriginalHistogram(histogramData, {
                barColor: canvasHelpers.COLORS.histogram.bar,
                borderColor: canvasHelpers.COLORS.histogram.border,
                gridColor: canvasHelpers.COLORS.histogram.grid,
                textColor: canvasHelpers.COLORS.histogram.text,
                showGrid: true,
                showLabels: true,
                showValues: true
            });
        }
    }, [histogramData, drawOriginalHistogram, originalCanvasReady]);

    // Dibujar histograma expandido
    useEffect(() => {
        if (expandedCanvasReady && expandedData) {
            const dataToShow = showInterpolated && expandedData.interpolated
                ? expandedData.interpolated
                : expandedData.standard;

            drawExpandedHistogram(dataToShow, {
                barColor: showInterpolated
                    ? canvasHelpers.COLORS.secondary
                    : canvasHelpers.COLORS.primary,
                borderColor: canvasHelpers.COLORS.histogram.border,
                gridColor: canvasHelpers.COLORS.histogram.grid,
                textColor: canvasHelpers.COLORS.histogram.text,
                showGrid: true,
                showLabels: true,
                showValues: true
            });
        }
    }, [expandedData, showInterpolated, drawExpandedHistogram, expandedCanvasReady]);

    // Manejar cambio en datos del histograma
    const handleHistogramChange = useCallback((event) => {
        const input = event.target.value;
        setInputValue(input);

        const validation = validateHistogramInput(input);
        if (validation.valid) {
            setHistogramData(validation.data);
            setValidationError('');
        } else {
            setValidationError(validation.error);
        }
    }, [validateHistogramInput]);

    // Manejar cambio de rango
    const handleRangeChange = useCallback((field, value) => {
        const numValue = mathHelpers.safeNumber(value, field === 'min' ? 0 : 1);

        if (field === 'min') {
            setMinRange(numValue);
        } else {
            setMaxRange(numValue);
        }

        // Validar nuevo rango
        const newMin = field === 'min' ? numValue : minRange;
        const newMax = field === 'max' ? numValue : maxRange;
        const validation = validateRange(newMin, newMax);

        if (!validation.valid) {
            setValidationError(validation.error);
        } else {
            setValidationError('');
        }
    }, [minRange, maxRange, validateRange]);

    // Limpiar todo
    const handleClear = useCallback(() => {
        setHistogramData([]);
        setInputValue('');
        setExpandedData(null);
        setValidationError('');
        clearOriginalCanvas();
        clearExpandedCanvas();
    }, [clearOriginalCanvas, clearExpandedCanvas]);

    // Restablecer valores por defecto
    const handleReset = useCallback(() => {
        const defaultData = [2, 5, 3, 8, 1, 4, 6, 2];
        setHistogramData(defaultData);
        setInputValue(defaultData.join(', '));
        setMinRange(1);
        setMaxRange(7);
        setShowInterpolated(false);
        setExpandedData(null);
        setValidationError('');
    }, []);

    // Cargar datos guardados
    const handleRestore = useCallback(() => {
        if (savedData && Object.keys(savedData).length > 0) {
            const data = savedData.histogramData || [];
            setHistogramData(data);
            setInputValue(data.join(', '));
            setMinRange(savedData.minRange || 1);
            setMaxRange(savedData.maxRange || 7);
            setShowInterpolated(savedData.showInterpolated || false);
            setValidationError('');
        }
    }, [savedData]);

    // Calcular si los datos están listos para procesar
    const canCalculate = histogramData.length > 0 &&
        !validationError &&
        !isLoading &&
        validateRange(minRange, maxRange).valid;

    return (
        <Box sx={{ p: 3, mx: 'auto' }}>
            {/* Encabezado */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <TrendingUp fontSize="large" />
                    <Typography variant="h4" component="h1">
                        Expansión de Histogramas
                    </Typography>
                    <Chip
                        label="v2.0.0"
                        color="secondary"
                        variant="filled"
                        size="small"
                    />
                </Box>
                <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
                    Expande histogramas linealmente a un nuevo rango de valores
                </Typography>
            </Paper>

            {/* Error Display */}
            {(error || validationError) && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error?.message || validationError}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Panel de entrada */}
                <Grid item xs={12} lg={4}>
                    <Card elevation={3}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="primary">
                                Configuración
                            </Typography>

                            {/* Entrada de datos */}
                            <TextField
                                fullWidth
                                label="Datos del Histograma"
                                placeholder="2, 5, 3, 8, 1, 4, 6, 2"
                                value={inputValue}
                                onChange={handleHistogramChange}
                                margin="normal"
                                helperText="Valores separados por comas (2-20 valores)"
                                error={!!validationError && validationError.includes('valores')}
                                multiline
                                rows={2}
                            />

                            {/* Configuración de rango */}
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Rango de Expansión
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Actual: [{minRange}; {maxRange}] (Tamaño: {maxRange - minRange})
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Mínimo"
                                            type="number"
                                            value={minRange}
                                            onChange={(e) => handleRangeChange('min', e.target.value)}
                                            size="small"
                                            error={!!validationError && validationError.includes('Min')}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Máximo"
                                            type="number"
                                            value={maxRange}
                                            onChange={(e) => handleRangeChange('max', e.target.value)}
                                            size="small"
                                            error={!!validationError && validationError.includes('Max')}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Opciones */}
                            <Box sx={{ mt: 3 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={showInterpolated}
                                            onChange={(e) => setShowInterpolated(e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label="Mostrar versión interpolada"
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={autoSave}
                                            onChange={(e) => setAutoSave(e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label="Auto-guardar configuración"
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={showStats}
                                            onChange={(e) => setShowStats(e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label="Mostrar estadísticas detalladas"
                                />
                            </Box>

                            {/* Botones de acción */}
                            <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    startIcon={isLoading ? <CircularProgress size={20} /> : <PlayArrow />}
                                    onClick={calculateExpansion}
                                    disabled={!canCalculate}
                                    fullWidth
                                    size="large"
                                >
                                    {isLoading ? 'Calculando...' : 'Expandir Histograma'}
                                </Button>

                                <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<Refresh />}
                                        onClick={handleReset}
                                        size="small"
                                    >
                                        Reset
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        startIcon={<Restore />}
                                        onClick={handleRestore}
                                        disabled={!savedData || Object.keys(savedData).length === 0}
                                        size="small"
                                    >
                                        Restaurar
                                    </Button>

                                    <Tooltip title="Limpiar todo">
                                        <IconButton onClick={handleClear} color="error" size="small">
                                            <Clear />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Panel de estadísticas */}
                    {showStats && (
                        <Card elevation={2} sx={{ mt: 2 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom color="primary">
                                    Estadísticas
                                </Typography>

                                {histogramData.length > 0 && (
                                    <Box>
                                        <Typography variant="subtitle2" color="text.primary">
                                            Histograma Original:
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            • Valores: {histogramData.length}<br />
                                            • Suma: {mathHelpers.calculateStats(histogramData).sum}<br />
                                            • Promedio: {mathHelpers.calculateStats(histogramData).mean?.toFixed(2)}<br />
                                            • Rango: [{mathHelpers.calculateStats(histogramData).min}, {mathHelpers.calculateStats(histogramData).max}]
                                        </Typography>
                                    </Box>
                                )}

                                {expandedData && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" color="secondary.main">
                                            Histograma Expandido:
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            • Valores: {expandedData.standard.length}<br />
                                            • Suma: {expandedData.expandedStats.sum}<br />
                                            • Promedio: {expandedData.expandedStats.mean?.toFixed(2)}<br />
                                            • Nuevo rango: [{minRange}, {maxRange}]
                                        </Typography>
                                    </Box>
                                )}

                                {/* Métricas de rendimiento */}
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" color="info.main">
                                    Métricas de Rendimiento:
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    • Cache hits: {getMetrics().cacheHits}<br />
                                    • Tiempo promedio: {getMetrics().averageExecutionTime.toFixed(2)}ms<br />
                                    • Ejecuciones totales: {getMetrics().totalExecutions}
                                </Typography>
                            </CardContent>
                        </Card>
                    )}
                </Grid>

                {/* Visualización del histograma original */}
                <Grid item xs={12} lg={4}>
                    <Card elevation={3}>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <BarChart color="primary" />
                                <Typography variant="h6">
                                    Histograma Original
                                </Typography>
                                {histogramData.length > 0 && (
                                    <Chip
                                        label={`${histogramData.length} valores`}
                                        color="primary"
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                            </Box>

                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    border: '2px solid',
                                    borderColor: 'grey.300',
                                    borderRadius: 2,
                                    p: 2,
                                    bgcolor: 'grey.50'
                                }}
                            >
                                <canvas
                                    ref={originalCanvasRef}
                                    style={{
                                        maxWidth: '100%',
                                        height: 'auto',
                                        display: 'block'
                                    }}
                                />
                            </Box>

                            {histogramData.length === 0 && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: 200,
                                        color: 'text.secondary',
                                        border: '2px dashed',
                                        borderColor: 'grey.300',
                                        borderRadius: 2,
                                        mt: 2
                                    }}
                                >
                                    <Typography>
                                        Ingrese datos para visualizar
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Visualización del histograma expandido */}
                <Grid item xs={12} lg={4}>
                    <Card elevation={3}>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <TrendingUp color="secondary" />
                                <Typography variant="h6">
                                    Histograma Expandido
                                </Typography>
                                {expandedData && showInterpolated && (
                                    <Chip
                                        label="Interpolado"
                                        color="secondary"
                                        size="small"
                                    />
                                )}
                                {expandedData && (
                                    <Chip
                                        label={`${expandedData.standard.length} valores`}
                                        color="secondary"
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                            </Box>

                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    border: '2px solid',
                                    borderColor: expandedData ? 'secondary.main' : 'grey.300',
                                    borderRadius: 2,
                                    p: 2,
                                    bgcolor: expandedData ? 'secondary.lighter' : 'grey.50'
                                }}
                            >
                                <canvas
                                    ref={expandedCanvasRef}
                                    style={{
                                        maxWidth: '100%',
                                        height: 'auto',
                                        display: 'block'
                                    }}
                                />
                            </Box>

                            {!expandedData && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: 200,
                                        color: 'text.secondary',
                                        border: '2px dashed',
                                        borderColor: 'grey.300',
                                        borderRadius: 2,
                                        mt: 2
                                    }}
                                >
                                    <Typography align="center">
                                        Ejecute la expansión<br />para ver el resultado
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Información adicional */}
                {expandedData && (
                    <Grid item xs={12}>
                        <Card elevation={2}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom color="primary">
                                    Resultados Detallados
                                </Typography>

                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Datos Expandidos (Estándar):
                                        </Typography>
                                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                                [{expandedData.standard.join(', ')}]
                                            </Typography>
                                        </Paper>
                                    </Grid>

                                    {showInterpolated && expandedData.interpolated && (
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle1" gutterBottom>
                                                Datos Expandidos (Interpolados):
                                            </Typography>
                                            <Paper sx={{ p: 2, bgcolor: 'secondary.lighter' }}>
                                                <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                                    [{expandedData.interpolated.join(', ')}]
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    )}

                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Comparación de Estadísticas:
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Paper sx={{ p: 2, bgcolor: 'primary.lighter' }}>
                                                    <Typography variant="subtitle2">Original</Typography>
                                                    <Typography variant="body2">
                                                        Media: {expandedData.originalStats.mean?.toFixed(2)}<br />
                                                        Desv. Std: {expandedData.originalStats.standardDeviation?.toFixed(2)}
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Paper sx={{ p: 2, bgcolor: 'secondary.lighter' }}>
                                                    <Typography variant="subtitle2">Expandido</Typography>
                                                    <Typography variant="body2">
                                                        Media: {expandedData.expandedStats.mean?.toFixed(2)}<br />
                                                        Desv. Std: {expandedData.expandedStats.standardDeviation?.toFixed(2)}
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default HistogramExpansion;