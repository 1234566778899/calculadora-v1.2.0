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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress
} from '@mui/material';
import {
    PlayArrow,
    Refresh,
    Restore,
    Clear,
    Equalizer,
    BarChart,
    ShowChart,
    Info,
    Assessment
} from '@mui/icons-material';
import useAlgorithms from '../../../hooks/useAlgorithms';
import useLocalStorage from '../../../hooks/useLocalStorage';
import canvasHelpers from '../../../utils/helpers/canvasHelpers';
import mathHelpers from '../../../utils/helpers/mathHelpers';
import useCanvas from '../../../hooks/useCanvas';



const HistogramEqualization = () => {
    // Estado del histograma
    const [histogramData, setHistogramData] = useState([2, 5, 3, 8, 1, 4, 6, 2]);
    const [equalizedData, setEqualizedData] = useState(null);
    const [inputValue, setInputValue] = useState('2, 5, 3, 8, 1, 4, 6, 2');

    // Configuración
    const [autoSave, setAutoSave] = useState(true);
    const [showStats, setShowStats] = useState(true);
    const [showCDF, setShowCDF] = useState(false);
    const [showTransformTable, setShowTransformTable] = useState(false);
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

    // Hook de canvas para visualización original
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

    // Hook de canvas para visualización ecualizada
    const {
        canvasRef: equalizedCanvasRef,
        drawHistogram: drawEqualizedHistogram,
        clearCanvas: clearEqualizedCanvas,
        isReady: equalizedCanvasReady
    } = useCanvas({
        width: 400,
        height: 200,
        backgroundColor: '#fafafa'
    });

    // Hook de canvas para CDF
    const {
        canvasRef: cdfCanvasRef,
        isReady: cdfCanvasReady
    } = useCanvas({
        width: 400,
        height: 150,
        backgroundColor: '#fafafa'
    });

    // Hook de persistencia
    const [savedData, setSavedData] = useLocalStorage('histogramEqualization', {
        histogramData: [2, 5, 3, 8, 1, 4, 6, 2],
        showCDF: false,
        showTransformTable: false
    });

    // Cargar datos guardados al iniciar
    useEffect(() => {
        if (savedData && Object.keys(savedData).length > 0) {
            const data = savedData.histogramData || [2, 5, 3, 8, 1, 4, 6, 2];
            setHistogramData(data);
            setInputValue(data.join(', '));
            setShowCDF(savedData.showCDF || false);
            setShowTransformTable(savedData.showTransformTable || false);
        }
    }, []);

    // Auto-guardar configuración
    useEffect(() => {
        if (autoSave && histogramData.length > 0) {
            setSavedData({
                histogramData,
                showCDF,
                showTransformTable
            });
        }
    }, [histogramData, showCDF, showTransformTable, autoSave, setSavedData]);

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

    // Calcular ecualización del histograma
    const calculateEqualization = useCallback(async () => {
        try {
            setValidationError('');

            if (!Array.isArray(histogramData) || histogramData.length === 0) {
                setValidationError('Datos de histograma inválidos');
                return;
            }

            // Ejecutar algoritmo de ecualización
            const result = await histogram.equalize(histogramData);

            // Calcular estadísticas adicionales
            const originalStats = mathHelpers.calculateStats(histogramData);
            const equalizedStats = mathHelpers.calculateStats(result.histogram);

            // Calcular CDF para visualización
            const cdf = await histogram.stats(histogramData);

            setEqualizedData({
                histogram: result.histogram,
                cdf: result.cdf,
                lookupTable: result.lookupTable,
                transformation: result.transformation,
                originalStats,
                equalizedStats
            });

        } catch (error) {
            console.error('Error en ecualización:', error);
            setValidationError(error.message);
            setEqualizedData(null);
        }
    }, [histogramData, histogram]);

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

    // Dibujar histograma ecualizado
    useEffect(() => {
        if (equalizedCanvasReady && equalizedData) {
            drawEqualizedHistogram(equalizedData.histogram, {
                barColor: canvasHelpers.COLORS.success,
                borderColor: canvasHelpers.COLORS.primary,
                gridColor: canvasHelpers.COLORS.histogram.grid,
                textColor: canvasHelpers.COLORS.histogram.text,
                showGrid: true,
                showLabels: true,
                showValues: true
            });
        }
    }, [equalizedData, drawEqualizedHistogram, equalizedCanvasReady]);

    // Dibujar CDF
    const drawCDF = useCallback(() => {
        if (!cdfCanvasReady || !equalizedData || !equalizedData.cdf) return;

        const canvas = cdfCanvasRef.current;
        const ctx = canvas.getContext('2d');

        // Limpiar canvas
        ctx.clearRect(0, 0, 400, 150);
        ctx.fillStyle = '#fafafa';
        ctx.fillRect(0, 0, 400, 150);

        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const chartWidth = 400 - margin.left - margin.right;
        const chartHeight = 150 - margin.top - margin.bottom;

        const cdf = equalizedData.cdf;
        const maxCDF = Math.max(...cdf);

        // Dibujar línea CDF
        ctx.strokeStyle = canvasHelpers.COLORS.info;
        ctx.lineWidth = 2;
        ctx.beginPath();

        cdf.forEach((value, index) => {
            const x = margin.left + (index / (cdf.length - 1)) * chartWidth;
            const y = margin.top + chartHeight - (value / maxCDF) * chartHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Etiquetas
        ctx.fillStyle = canvasHelpers.COLORS.histogram.text;
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('CDF (Función de Distribución Acumulativa)', 200, 140);

    }, [cdfCanvasReady, equalizedData, cdfCanvasRef]);

    useEffect(() => {
        if (showCDF && equalizedData) {
            drawCDF();
        }
    }, [showCDF, equalizedData, drawCDF]);

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

    // Limpiar todo
    const handleClear = useCallback(() => {
        setHistogramData([]);
        setInputValue('');
        setEqualizedData(null);
        setValidationError('');
        clearOriginalCanvas();
        clearEqualizedCanvas();
    }, [clearOriginalCanvas, clearEqualizedCanvas]);

    // Restablecer valores por defecto
    const handleReset = useCallback(() => {
        const defaultData = [2, 5, 3, 8, 1, 4, 6, 2];
        setHistogramData(defaultData);
        setInputValue(defaultData.join(', '));
        setShowCDF(false);
        setShowTransformTable(false);
        setEqualizedData(null);
        setValidationError('');
    }, []);

    // Cargar datos guardados
    const handleRestore = useCallback(() => {
        if (savedData && Object.keys(savedData).length > 0) {
            const data = savedData.histogramData || [];
            setHistogramData(data);
            setInputValue(data.join(', '));
            setShowCDF(savedData.showCDF || false);
            setShowTransformTable(savedData.showTransformTable || false);
            setValidationError('');
        }
    }, [savedData]);

    // Calcular si los datos están listos para procesar
    const canCalculate = histogramData.length > 0 &&
        !validationError &&
        !isLoading;

    // Calcular métricas de mejora de contraste
    const getContrastMetrics = useCallback(() => {
        if (!equalizedData) return null;

        const originalVariance = equalizedData.originalStats.variance || 0;
        const equalizedVariance = equalizedData.equalizedStats.variance || 0;
        const contrastImprovement = equalizedVariance > 0 ?
            ((equalizedVariance - originalVariance) / originalVariance * 100) : 0;

        return {
            contrastImprovement: contrastImprovement.toFixed(1),
            originalRange: equalizedData.originalStats.range || 0,
            equalizedRange: equalizedData.equalizedStats.range || 0
        };
    }, [equalizedData]);

    const contrastMetrics = getContrastMetrics();

    return (
        <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
            {/* Encabezado */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'success.main', color: 'white' }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Equalizer fontSize="large" />
                    <Typography variant="h4" component="h1">
                        Ecualización de Histogramas
                    </Typography>
                    <Chip
                        label="v2.0.0"
                        color="secondary"
                        variant="filled"
                        size="small"
                    />
                </Box>
                <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
                    Mejora el contraste redistribuyendo uniformemente los valores de intensidad
                </Typography>
            </Paper>

            {/* Error Display */}
            {(error || validationError) && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error?.message || validationError}
                </Alert>
            )}

            {/* Indicador de carga */}
            {isLoading && (
                <Box sx={{ mb: 2 }}>
                    <LinearProgress />
                    <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                        Calculando ecualización...
                    </Typography>
                </Box>
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

                            {/* Opciones de visualización */}
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Opciones de Visualización
                                </Typography>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={showCDF}
                                            onChange={(e) => setShowCDF(e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label="Mostrar CDF (Función Distribución Acumulativa)"
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={showTransformTable}
                                            onChange={(e) => setShowTransformTable(e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label="Mostrar tabla de transformación"
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
                                    startIcon={<PlayArrow />}
                                    onClick={calculateEqualization}
                                    disabled={!canCalculate}
                                    fullWidth
                                    size="large"
                                    color="success"
                                >
                                    {isLoading ? 'Ecualizando...' : 'Ecualizar Histograma'}
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
                                    Estadísticas y Métricas
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
                                            • Varianza: {mathHelpers.calculateStats(histogramData).variance?.toFixed(2)}<br />
                                            • Rango: [{mathHelpers.calculateStats(histogramData).min}, {mathHelpers.calculateStats(histogramData).max}]
                                        </Typography>
                                    </Box>
                                )}

                                {equalizedData && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" color="success.main">
                                            Histograma Ecualizado:
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            • Valores: {equalizedData.histogram.length}<br />
                                            • Suma: {equalizedData.equalizedStats.sum}<br />
                                            • Promedio: {equalizedData.equalizedStats.mean?.toFixed(2)}<br />
                                            • Varianza: {equalizedData.equalizedStats.variance?.toFixed(2)}<br />
                                            • Rango: [{equalizedData.equalizedStats.min}, {equalizedData.equalizedStats.max}]
                                        </Typography>
                                    </Box>
                                )}

                                {contrastMetrics && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" color="info.main">
                                            Mejora de Contraste:
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            • Cambio en varianza: {contrastMetrics.contrastImprovement}%<br />
                                            • Rango original: {contrastMetrics.originalRange}<br />
                                            • Rango ecualizado: {contrastMetrics.equalizedRange}
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

                {/* Visualización del histograma ecualizado */}
                <Grid item xs={12} lg={4}>
                    <Card elevation={3}>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <Equalizer color="success" />
                                <Typography variant="h6">
                                    Histograma Ecualizado
                                </Typography>
                                {equalizedData && (
                                    <Chip
                                        label={`${equalizedData.histogram.length} valores`}
                                        color="success"
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
                                    borderColor: equalizedData ? 'success.main' : 'grey.300',
                                    borderRadius: 2,
                                    p: 2,
                                    bgcolor: equalizedData ? 'success.lighter' : 'grey.50'
                                }}
                            >
                                <canvas
                                    ref={equalizedCanvasRef}
                                    style={{
                                        maxWidth: '100%',
                                        height: 'auto',
                                        display: 'block'
                                    }}
                                />
                            </Box>

                            {!equalizedData && (
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
                                        Ejecute la ecualización<br />para ver el resultado
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Visualización CDF */}
                {showCDF && equalizedData && (
                    <Grid item xs={12}>
                        <Card elevation={2}>
                            <CardContent>
                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <ShowChart color="info" />
                                    <Typography variant="h6">
                                        Función de Distribución Acumulativa (CDF)
                                    </Typography>
                                    <Tooltip title="La CDF muestra cómo se acumulan las frecuencias">
                                        <IconButton size="small">
                                            <Info />
                                        </IconButton>
                                    </Tooltip>
                                </Box>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        border: '2px solid',
                                        borderColor: 'info.main',
                                        borderRadius: 2,
                                        p: 2,
                                        bgcolor: 'info.lighter'
                                    }}
                                >
                                    <canvas
                                        ref={cdfCanvasRef}
                                        style={{
                                            maxWidth: '100%',
                                            height: 'auto',
                                            display: 'block'
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {/* Tabla de transformación */}
                {showTransformTable && equalizedData && equalizedData.transformation && (
                    <Grid item xs={12}>
                        <Card elevation={2}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom color="primary">
                                    Tabla de Transformación de Valores
                                </Typography>

                                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell><strong>Valor Original</strong></TableCell>
                                                <TableCell><strong>Valor Ecualizado</strong></TableCell>
                                                <TableCell><strong>Frecuencia Original</strong></TableCell>
                                                <TableCell><strong>CDF Normalizada</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {equalizedData.transformation.map((transform, index) => (
                                                <TableRow key={index} hover>
                                                    <TableCell>{transform.oldVal}</TableCell>
                                                    <TableCell>{transform.newVal}</TableCell>
                                                    <TableCell>{histogramData[index] || 0}</TableCell>
                                                    <TableCell>
                                                        {((equalizedData.cdf[index] / equalizedData.cdf[equalizedData.cdf.length - 1]) * 100).toFixed(1)}%
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {/* Información detallada de resultados */}
                {equalizedData && (
                    <Grid item xs={12}>
                        <Card elevation={2}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom color="primary">
                                    Resultados Detallados
                                </Typography>

                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Datos Ecualizados:
                                        </Typography>
                                        <Paper sx={{ p: 2, bgcolor: 'success.lighter' }}>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                                [{equalizedData.histogram.join(', ')}]
                                            </Typography>
                                        </Paper>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Lookup Table (Mapeo de Transformación):
                                        </Typography>
                                        <Paper sx={{ p: 2, bgcolor: 'info.lighter' }}>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                                [{equalizedData.lookupTable.join(', ')}]
                                            </Typography>
                                        </Paper>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Comparación de Estadísticas:
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Paper sx={{ p: 2, bgcolor: 'primary.lighter' }}>
                                                    <Typography variant="subtitle2">Original</Typography>
                                                    <Typography variant="body2">
                                                        Media: {equalizedData.originalStats.mean?.toFixed(2)}<br />
                                                        Desv. Std: {equalizedData.originalStats.standardDeviation?.toFixed(2)}<br />
                                                        Varianza: {equalizedData.originalStats.variance?.toFixed(2)}
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Paper sx={{ p: 2, bgcolor: 'success.lighter' }}>
                                                    <Typography variant="subtitle2">Ecualizado</Typography>
                                                    <Typography variant="body2">
                                                        Media: {equalizedData.equalizedStats.mean?.toFixed(2)}<br />
                                                        Desv. Std: {equalizedData.equalizedStats.standardDeviation?.toFixed(2)}<br />
                                                        Varianza: {equalizedData.equalizedStats.variance?.toFixed(2)}
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

export default HistogramEqualization;