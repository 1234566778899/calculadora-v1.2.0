import { useRef, useEffect, useCallback, useState } from 'react';

/**
 * Hook personalizado para manejo de canvas dinámico
 * Basado en las visualizaciones de grafos e histogramas del código original
 */

const useCanvas = (options = {}) => {
    const {
        width = 600,
        height = 300,
        backgroundColor = '#ffffff',
        enableInteraction = true,
        enableAnimation = false,
        pixelRatio = window.devicePixelRatio || 1,
        onCanvasClick = null,
        onCanvasMouseMove = null
    } = options;

    // Referencias y estado
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const animationRef = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const [canvasBounds, setCanvasBounds] = useState(null);

    // Estado para elementos dibujados
    const [vertices, setVertices] = useState([]);
    const [edges, setEdges] = useState([]);
    const [drawings, setDrawings] = useState([]);

    /**
     * Inicializa el canvas y contexto
     */
    const initializeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Configurar tamaño real vs display
        canvas.width = width * pixelRatio;
        canvas.height = height * pixelRatio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const context = canvas.getContext('2d');
        context.scale(pixelRatio, pixelRatio);
        context.lineCap = 'round';
        context.lineJoin = 'round';

        contextRef.current = context;
        setCanvasBounds(canvas.getBoundingClientRect());
        setIsReady(true);

        // Limpiar canvas inicial
        clearCanvas();
    }, [width, height, pixelRatio]);

    /**
     * Limpia completamente el canvas
     */
    const clearCanvas = useCallback(() => {
        const context = contextRef.current;
        if (!context) return;

        context.clearRect(0, 0, width, height);
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, width, height);
    }, [width, height, backgroundColor]);

    /**
     * Convierte coordenadas del mouse a coordenadas del canvas
     */
    const getCanvasCoordinates = useCallback((event) => {
        if (!canvasBounds) return { x: 0, y: 0 };

        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }, [canvasBounds]);

    // ==================== CLASES PARA ELEMENTOS GRÁFICOS ====================

    /**
     * Clase Vertex para grafos (basada en tu CVertice original)
     */
    const Vertex = useCallback(class {
        constructor(id, x, y, label = null, options = {}) {
            this.id = id;
            this.x = x;
            this.y = y;
            this.label = label !== null ? label : id;
            this.size = options.size || 20;
            this.color = options.color || '#000000';
            this.textColor = options.textColor || '#ffffff';
            this.borderColor = options.borderColor || '#333333';
            this.borderWidth = options.borderWidth || 2;
        }

        draw(context) {
            // Dibujar vértice
            context.fillStyle = this.color;
            context.fillRect(this.x, this.y, this.size, this.size);

            // Dibujar borde
            context.strokeStyle = this.borderColor;
            context.lineWidth = this.borderWidth;
            context.strokeRect(this.x, this.y, this.size, this.size);

            // Dibujar etiqueta
            context.font = '12px Verdana';
            context.fillStyle = this.textColor;
            context.textAlign = 'center';
            context.fillText(
                this.label.toString(),
                this.x + this.size / 2,
                this.y + this.size / 2 + 4
            );
        }

        containsPoint(x, y) {
            return x >= this.x && x <= this.x + this.size &&
                y >= this.y && y <= this.y + this.size;
        }

        getCenterPoint() {
            return {
                x: this.x + this.size / 2,
                y: this.y + this.size / 2
            };
        }
    }, []);

    /**
     * Clase Edge para aristas (basada en tu CLinea original)
     */
    const Edge = useCallback(class {
        constructor(vertex1, vertex2, weight = 1, options = {}) {
            this.vertex1 = vertex1;
            this.vertex2 = vertex2;
            this.weight = weight;
            this.color = options.color || '#000000';
            this.highlightColor = options.highlightColor || '#00ff00';
            this.lineWidth = options.lineWidth || 2;
            this.showWeight = options.showWeight !== false;
            this.isHighlighted = options.isHighlighted || false;
        }

        draw(context) {
            const center1 = this.vertex1.getCenterPoint();
            const center2 = this.vertex2.getCenterPoint();

            context.beginPath();
            context.strokeStyle = this.isHighlighted ? this.highlightColor : this.color;
            context.lineWidth = this.lineWidth;
            context.moveTo(center1.x, center1.y);
            context.lineTo(center2.x, center2.y);
            context.stroke();

            // Dibujar peso si está habilitado
            if (this.showWeight) {
                const midX = (center1.x + center2.x) / 2;
                const midY = (center1.y + center2.y) / 2;

                context.font = '12px Verdana';
                context.fillStyle = '#ff0000';
                context.textAlign = 'center';
                context.fillText(this.weight.toString(), midX, midY);
            }
        }
    }, []);

    // ==================== FUNCIONES DE DIBUJO ====================

    /**
     * Dibuja un histograma
     */
    const drawHistogram = useCallback((data, options = {}) => {
        const context = contextRef.current;
        if (!context || !Array.isArray(data)) return;

        const {
            barColor = '#3f51b5',
            borderColor = '#1a237e',
            gridColor = '#e0e0e0',
            textColor = '#333333',
            margin = { top: 20, right: 20, bottom: 40, left: 40 },
            showGrid = true,
            showLabels = true,
            showValues = true
        } = options;

        clearCanvas();

        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        const barWidth = chartWidth / data.length;
        const maxValue = Math.max(...data, 1); // Evitar división por cero

        // Dibujar grid
        if (showGrid) {
            context.strokeStyle = gridColor;
            context.lineWidth = 1;

            // Líneas horizontales
            for (let i = 0; i <= 5; i++) {
                const y = margin.top + (chartHeight / 5) * i;
                context.beginPath();
                context.moveTo(margin.left, y);
                context.lineTo(margin.left + chartWidth, y);
                context.stroke();
            }

            // Líneas verticales
            for (let i = 0; i <= data.length; i++) {
                const x = margin.left + (chartWidth / data.length) * i;
                context.beginPath();
                context.moveTo(x, margin.top);
                context.lineTo(x, margin.top + chartHeight);
                context.stroke();
            }
        }

        // Dibujar barras
        data.forEach((value, index) => {
            const barHeight = (value / maxValue) * chartHeight;
            const x = margin.left + index * barWidth;
            const y = margin.top + chartHeight - barHeight;

            // Barra
            context.fillStyle = barColor;
            context.fillRect(x + 2, y, barWidth - 4, barHeight);

            // Borde de la barra
            context.strokeStyle = borderColor;
            context.lineWidth = 1;
            context.strokeRect(x + 2, y, barWidth - 4, barHeight);

            // Etiquetas del eje X
            if (showLabels) {
                context.fillStyle = textColor;
                context.font = '10px Arial';
                context.textAlign = 'center';
                context.fillText(
                    index.toString(),
                    x + barWidth / 2,
                    margin.top + chartHeight + 15
                );
            }

            // Valores sobre las barras
            if (showValues && value > 0) {
                context.fillStyle = textColor;
                context.font = '10px Arial';
                context.textAlign = 'center';
                context.fillText(
                    value.toString(),
                    x + barWidth / 2,
                    y - 5
                );
            }
        });
    }, [width, height, clearCanvas]);

    /**
     * Dibuja un grafo con vértices y aristas
     */
    const drawGraph = useCallback(() => {
        const context = contextRef.current;
        if (!context) return;

        clearCanvas();

        // Dibujar aristas primero (para que queden debajo)
        edges.forEach(edge => edge.draw(context));

        // Dibujar vértices después
        vertices.forEach(vertex => vertex.draw(context));
    }, [vertices, edges, clearCanvas]);

    /**
     * Redibuja todo el canvas
     */
    const redraw = useCallback(() => {
        const context = contextRef.current;
        if (!context) return;

        clearCanvas();

        // Dibujar elementos en orden: fondo -> aristas -> vértices -> dibujos custom
        edges.forEach(edge => edge.draw(context));
        vertices.forEach(vertex => vertex.draw(context));
        drawings.forEach(drawing => {
            if (typeof drawing === 'function') {
                drawing(context);
            }
        });
    }, [clearCanvas, edges, vertices, drawings]);

    // ==================== GESTIÓN DE ELEMENTOS ====================

    /**
     * Añade un vértice
     */
    const addVertex = useCallback((x, y, label = null, options = {}) => {
        const id = vertices.length;
        const newVertex = new Vertex(id, x, y, label, options);

        setVertices(prev => [...prev, newVertex]);
        return newVertex;
    }, [vertices, Vertex]);

    /**
     * Añade una arista
     */
    const addEdge = useCallback((vertex1, vertex2, weight = 1, options = {}) => {
        const newEdge = new Edge(vertex1, vertex2, weight, options);
        setEdges(prev => [...prev, newEdge]);
        return newEdge;
    }, [Edge]);

    /**
     * Encuentra vértice en coordenadas
     */
    const findVertexAt = useCallback((x, y) => {
        return vertices.find(vertex => vertex.containsPoint(x, y));
    }, [vertices]);

    /**
     * Actualiza arista específica
     */
    const updateEdge = useCallback((edgeIndex, updates) => {
        setEdges(prev => prev.map((edge, index) =>
            index === edgeIndex ? { ...edge, ...updates } : edge
        ));
    }, []);

    /**
     * Resalta camino específico
     */
    const highlightPath = useCallback((pathEdges) => {
        setEdges(prev => prev.map(edge => ({
            ...edge,
            isHighlighted: pathEdges.some(([v1, v2]) =>
                (edge.vertex1.id === v1 && edge.vertex2.id === v2) ||
                (edge.vertex1.id === v2 && edge.vertex2.id === v1)
            )
        })));
    }, []);

    /**
     * Limpia todos los elementos
     */
    const clearAll = useCallback(() => {
        setVertices([]);
        setEdges([]);
        setDrawings([]);
        clearCanvas();
    }, [clearCanvas]);

    // ==================== MANEJO DE EVENTOS ====================

    /**
     * Maneja clicks en el canvas
     */
    const handleCanvasClick = useCallback((event) => {
        if (!enableInteraction) return;

        const coords = getCanvasCoordinates(event);
        const clickedVertex = findVertexAt(coords.x, coords.y);

        if (onCanvasClick) {
            onCanvasClick(coords, clickedVertex, event);
        }
    }, [enableInteraction, getCanvasCoordinates, findVertexAt, onCanvasClick]);

    /**
     * Maneja movimiento del mouse
     */
    const handleMouseMove = useCallback((event) => {
        if (!enableInteraction) return;

        const coords = getCanvasCoordinates(event);

        if (onCanvasMouseMove) {
            onCanvasMouseMove(coords, event);
        }
    }, [enableInteraction, getCanvasCoordinates, onCanvasMouseMove]);

    // ==================== ANIMACIÓN ====================

    /**
     * Inicia loop de animación
     */
    const startAnimation = useCallback((animationCallback) => {
        if (!enableAnimation) return;

        const animate = () => {
            if (animationCallback) {
                animationCallback(contextRef.current);
            }
            redraw();
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();
    }, [enableAnimation, redraw]);

    /**
     * Detiene animación
     */
    const stopAnimation = useCallback(() => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
    }, []);

    // ==================== EFECTOS ====================

    useEffect(() => {
        initializeCanvas();

        return () => {
            stopAnimation();
        };
    }, [initializeCanvas, stopAnimation]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !enableInteraction) return;

        canvas.addEventListener('click', handleCanvasClick);
        canvas.addEventListener('mousemove', handleMouseMove);

        return () => {
            canvas.removeEventListener('click', handleCanvasClick);
            canvas.removeEventListener('mousemove', handleMouseMove);
        };
    }, [enableInteraction, handleCanvasClick, handleMouseMove]);

    useEffect(() => {
        if (isReady) {
            redraw();
        }
    }, [vertices, edges, drawings, isReady, redraw]);

    // ==================== UTILIDADES ====================

    /**
     * Exporta canvas como imagen
     */
    const exportAsImage = useCallback((format = 'png') => {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        return canvas.toDataURL(`image/${format}`);
    }, []);

    /**
     * Redimensiona el canvas
     */
    const resize = useCallback((newWidth, newHeight) => {
        if (newWidth && newHeight) {
            // Actualizar opciones y re-inicializar
            options.width = newWidth;
            options.height = newHeight;
            initializeCanvas();
        }
    }, [initializeCanvas]);

    return {
        // Ref del canvas
        canvasRef,

        // Estado
        isReady,
        vertices,
        edges,

        // Funciones de dibujo
        clearCanvas,
        clearAll,
        drawHistogram,
        drawGraph,
        redraw,

        // Gestión de elementos
        addVertex,
        addEdge,
        findVertexAt,
        updateEdge,
        highlightPath,

        // Clases
        Vertex,
        Edge,

        // Animación
        startAnimation,
        stopAnimation,

        // Utilidades
        exportAsImage,
        resize,
        getCanvasCoordinates,

        // Estado de configuración
        config: {
            width,
            height,
            backgroundColor,
            enableInteraction,
            enableAnimation
        }
    };
};

export default useCanvas;