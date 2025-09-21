/**
 * Utilidades para operaciones de canvas y visualización
 * Funciones helper para geometría, dibujo, colores y layouts
 */

// ==================== CONSTANTES ====================

export const COLORS = {
    primary: '#3f51b5',
    secondary: '#f50057',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',

    // Paleta para grafos
    vertex: {
        default: '#000000',
        selected: '#ff0000',
        highlighted: '#00ff00',
        text: '#ffffff'
    },

    edge: {
        default: '#000000',
        highlighted: '#00ff00',
        optimal: '#ff0000',
        text: '#ff0000'
    },

    // Paleta para histogramas
    histogram: {
        bar: '#3f51b5',
        border: '#1a237e',
        grid: '#e0e0e0',
        text: '#333333',
        background: '#ffffff'
    }
};

export const SHAPES = {
    RECTANGLE: 'rectangle',
    CIRCLE: 'circle',
    DIAMOND: 'diamond',
    TRIANGLE: 'triangle'
};

// ==================== GEOMETRÍA BÁSICA ====================

/**
 * Calcula la distancia entre dos puntos
 */
export const distance = (p1, p2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Calcula el punto medio entre dos puntos
 */
export const midpoint = (p1, p2) => ({
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2
});

/**
 * Calcula el ángulo entre dos puntos en radianes
 */
export const angle = (p1, p2) => {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};

/**
 * Rota un punto alrededor de otro punto
 */
export const rotatePoint = (point, center, angleRad) => {
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    const dx = point.x - center.x;
    const dy = point.y - center.y;

    return {
        x: center.x + dx * cos - dy * sin,
        y: center.y + dx * sin + dy * cos
    };
};

/**
 * Verifica si un punto está dentro de un rectángulo
 */
export const pointInRect = (point, rect) => {
    return point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height;
};

/**
 * Verifica si un punto está dentro de un círculo
 */
export const pointInCircle = (point, center, radius) => {
    return distance(point, center) <= radius;
};

/**
 * Calcula la intersección de una línea con un rectángulo
 */
export const lineRectIntersection = (lineStart, lineEnd, rect) => {
    const center = {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2
    };

    // Calcular intersección con cada borde
    const intersections = [];

    // Borde superior
    const top = lineIntersection(
        lineStart, lineEnd,
        { x: rect.x, y: rect.y },
        { x: rect.x + rect.width, y: rect.y }
    );
    if (top) intersections.push(top);

    // Borde inferior
    const bottom = lineIntersection(
        lineStart, lineEnd,
        { x: rect.x, y: rect.y + rect.height },
        { x: rect.x + rect.width, y: rect.y + rect.height }
    );
    if (bottom) intersections.push(bottom);

    // Borde izquierdo
    const left = lineIntersection(
        lineStart, lineEnd,
        { x: rect.x, y: rect.y },
        { x: rect.x, y: rect.y + rect.height }
    );
    if (left) intersections.push(left);

    // Borde derecho
    const right = lineIntersection(
        lineStart, lineEnd,
        { x: rect.x + rect.width, y: rect.y },
        { x: rect.x + rect.width, y: rect.y + rect.height }
    );
    if (right) intersections.push(right);

    // Retornar la intersección más cercana al punto de inicio
    if (intersections.length === 0) return null;

    return intersections.reduce((closest, current) => {
        return distance(lineStart, current) < distance(lineStart, closest)
            ? current : closest;
    });
};

/**
 * Calcula la intersección entre dos líneas
 */
export const lineIntersection = (p1, p2, p3, p4) => {
    const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);

    if (Math.abs(denom) < 1e-10) return null; // Líneas paralelas

    const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom;
    const u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / denom;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return {
            x: p1.x + t * (p2.x - p1.x),
            y: p1.y + t * (p2.y - p1.y)
        };
    }

    return null;
};

// ==================== UTILIDADES DE DIBUJO ====================

/**
 * Dibuja una línea con flecha
 */
export const drawArrow = (ctx, start, end, options = {}) => {
    const {
        arrowSize = 10,
        color = '#000000',
        lineWidth = 2,
        dashPattern = null
    } = options;

    ctx.save();

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    if (dashPattern) {
        ctx.setLineDash(dashPattern);
    }

    // Dibujar línea principal
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    // Calcular ángulo para la flecha
    const arrowAngle = angle(start, end);

    // Dibujar cabeza de flecha
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
        end.x - arrowSize * Math.cos(arrowAngle - Math.PI / 6),
        end.y - arrowSize * Math.sin(arrowAngle - Math.PI / 6)
    );
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
        end.x - arrowSize * Math.cos(arrowAngle + Math.PI / 6),
        end.y - arrowSize * Math.sin(arrowAngle + Math.PI / 6)
    );
    ctx.stroke();

    ctx.restore();
};

/**
 * Dibuja texto con fondo
 */
export const drawTextWithBackground = (ctx, text, x, y, options = {}) => {
    const {
        textColor = '#000000',
        backgroundColor = '#ffffff',
        padding = 4,
        borderColor = null,
        borderWidth = 1,
        font = '12px Arial',
        textAlign = 'center',
        textBaseline = 'middle'
    } = options;

    ctx.save();

    ctx.font = font;
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;

    // Medir texto
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = parseInt(font); // Aproximación

    // Ajustar posición según alineación
    let bgX = x - textWidth / 2 - padding;
    let bgY = y - textHeight / 2 - padding;

    if (textAlign === 'left') {
        bgX = x - padding;
    } else if (textAlign === 'right') {
        bgX = x - textWidth - padding;
    }

    // Dibujar fondo
    if (backgroundColor) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(bgX, bgY, textWidth + padding * 2, textHeight + padding * 2);
    }

    // Dibujar borde
    if (borderColor) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(bgX, bgY, textWidth + padding * 2, textHeight + padding * 2);
    }

    // Dibujar texto
    ctx.fillStyle = textColor;
    ctx.fillText(text, x, y);

    ctx.restore();

    return {
        x: bgX,
        y: bgY,
        width: textWidth + padding * 2,
        height: textHeight + padding * 2
    };
};

/**
 * Dibuja una forma geométrica
 */
export const drawShape = (ctx, shape, x, y, size, options = {}) => {
    const {
        fillColor = null,
        strokeColor = '#000000',
        lineWidth = 2,
        rotation = 0
    } = options;

    ctx.save();

    if (rotation !== 0) {
        ctx.translate(x + size / 2, y + size / 2);
        ctx.rotate(rotation);
        ctx.translate(-size / 2, -size / 2);
        x = 0;
        y = 0;
    }

    ctx.beginPath();

    switch (shape) {
        case SHAPES.RECTANGLE:
            ctx.rect(x, y, size, size);
            break;

        case SHAPES.CIRCLE:
            ctx.arc(x + size / 2, y + size / 2, size / 2, 0, 2 * Math.PI);
            break;

        case SHAPES.DIAMOND:
            ctx.moveTo(x + size / 2, y);
            ctx.lineTo(x + size, y + size / 2);
            ctx.lineTo(x + size / 2, y + size);
            ctx.lineTo(x, y + size / 2);
            ctx.closePath();
            break;

        case SHAPES.TRIANGLE:
            ctx.moveTo(x + size / 2, y);
            ctx.lineTo(x + size, y + size);
            ctx.lineTo(x, y + size);
            ctx.closePath();
            break;
    }

    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }

    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }

    ctx.restore();
};

/**
 * Dibuja una grilla
 */
export const drawGrid = (ctx, width, height, options = {}) => {
    const {
        cellSize = 20,
        color = '#e0e0e0',
        lineWidth = 1,
        offsetX = 0,
        offsetY = 0
    } = options;

    ctx.save();

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    // Líneas verticales
    for (let x = offsetX % cellSize; x < width; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    // Líneas horizontales
    for (let y = offsetY % cellSize; y < height; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    ctx.restore();
};

// ==================== MANEJO DE COLORES ====================

/**
 * Convierte color hex a RGB
 */
export const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

/**
 * Convierte RGB a hex
 */
export const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Interpola entre dos colores
 */
export const interpolateColor = (color1, color2, factor) => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    if (!rgb1 || !rgb2) return color1;

    const r = Math.round(rgb1.r + factor * (rgb2.r - rgb1.r));
    const g = Math.round(rgb1.g + factor * (rgb2.g - rgb1.g));
    const b = Math.round(rgb1.b + factor * (rgb2.b - rgb1.b));

    return rgbToHex(r, g, b);
};

/**
 * Genera paleta de colores
 */
export const generateColorPalette = (count, options = {}) => {
    const {
        saturation = 70,
        lightness = 50,
        startHue = 0,
        endHue = 360
    } = options;

    const colors = [];
    const hueStep = (endHue - startHue) / count;

    for (let i = 0; i < count; i++) {
        const hue = (startHue + i * hueStep) % 360;
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }

    return colors;
};

/**
 * Ajusta la opacidad de un color
 */
export const adjustOpacity = (color, opacity) => {
    const rgb = hexToRgb(color);
    if (!rgb) return color;

    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
};

// ==================== LAYOUTS Y ALGORITMOS ====================

/**
 * Calcula layout circular para vértices
 */
export const circularLayout = (vertexCount, centerX, centerY, radius) => {
    const positions = [];
    const angleStep = (2 * Math.PI) / vertexCount;

    for (let i = 0; i < vertexCount; i++) {
        const angle = i * angleStep - Math.PI / 2; // Empezar desde arriba
        positions.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        });
    }

    return positions;
};

/**
 * Calcula layout en grilla para vértices
 */
export const gridLayout = (vertexCount, startX, startY, cellSize, maxCols = null) => {
    const positions = [];
    const cols = maxCols || Math.ceil(Math.sqrt(vertexCount));

    for (let i = 0; i < vertexCount; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;

        positions.push({
            x: startX + col * cellSize,
            y: startY + row * cellSize
        });
    }

    return positions;
};

/**
 * Algoritmo simple de force-directed layout
 */
export const forceDirectedLayout = (vertices, edges, options = {}) => {
    const {
        iterations = 100,
        repulsionForce = 1000,
        attractionForce = 0.01,
        damping = 0.9,
        centerForce = 0.001,
        centerX = 300,
        centerY = 150
    } = options;

    // Inicializar velocidades si no existen
    vertices.forEach(vertex => {
        if (!vertex.vx) vertex.vx = 0;
        if (!vertex.vy) vertex.vy = 0;
    });

    for (let iteration = 0; iteration < iterations; iteration++) {
        // Fuerzas de repulsión entre todos los vértices
        for (let i = 0; i < vertices.length; i++) {
            for (let j = i + 1; j < vertices.length; j++) {
                const v1 = vertices[i];
                const v2 = vertices[j];

                const dx = v2.x - v1.x;
                const dy = v2.y - v1.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;

                const force = repulsionForce / (dist * dist);
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;

                v1.vx -= fx;
                v1.vy -= fy;
                v2.vx += fx;
                v2.vy += fy;
            }
        }

        // Fuerzas de atracción para vértices conectados
        edges.forEach(edge => {
            const v1 = edge.vertex1;
            const v2 = edge.vertex2;

            const dx = v2.x - v1.x;
            const dy = v2.y - v1.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;

            const force = attractionForce * dist;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            v1.vx += fx;
            v1.vy += fy;
            v2.vx -= fx;
            v2.vy -= fy;
        });

        // Fuerza hacia el centro
        vertices.forEach(vertex => {
            const dx = centerX - vertex.x;
            const dy = centerY - vertex.y;

            vertex.vx += dx * centerForce;
            vertex.vy += dy * centerForce;
        });

        // Aplicar velocidades y damping
        vertices.forEach(vertex => {
            vertex.vx *= damping;
            vertex.vy *= damping;

            vertex.x += vertex.vx;
            vertex.y += vertex.vy;
        });
    }

    return vertices;
};

// ==================== ANIMACIÓN ====================

/**
 * Función de easing cuadrática
 */
export const easeInOutQuad = (t) => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

/**
 * Interpola entre dos valores
 */
export const lerp = (start, end, factor) => {
    return start + (end - start) * factor;
};

/**
 * Interpola entre dos puntos
 */
export const lerpPoint = (start, end, factor) => ({
    x: lerp(start.x, end.x, factor),
    y: lerp(start.y, end.y, factor)
});

/**
 * Crea una animación de transición
 */
export const createTransition = (from, to, duration, easing = easeInOutQuad) => {
    const startTime = Date.now();

    return (currentTime = Date.now()) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(progress);

        const current = {};
        Object.keys(from).forEach(key => {
            if (typeof from[key] === 'number' && typeof to[key] === 'number') {
                current[key] = lerp(from[key], to[key], easedProgress);
            } else {
                current[key] = progress < 1 ? from[key] : to[key];
            }
        });

        return {
            current,
            progress,
            completed: progress >= 1
        };
    };
};

// ==================== UTILIDADES ESPECÍFICAS ====================

/**
 * Calcula dimensiones óptimas para histograma
 */
export const calculateHistogramLayout = (data, canvasWidth, canvasHeight, options = {}) => {
    const {
        margin = { top: 20, right: 20, bottom: 40, left: 40 },
        minBarWidth = 10,
        maxBarWidth = 50,
        barSpacing = 2
    } = options;

    const chartWidth = canvasWidth - margin.left - margin.right;
    const chartHeight = canvasHeight - margin.top - margin.bottom;

    const barCount = data.length;
    const availableWidth = chartWidth - (barCount - 1) * barSpacing;
    let barWidth = availableWidth / barCount;

    // Aplicar límites de ancho
    barWidth = Math.max(minBarWidth, Math.min(maxBarWidth, barWidth));

    const totalBarsWidth = barCount * barWidth + (barCount - 1) * barSpacing;
    const offsetX = (chartWidth - totalBarsWidth) / 2;

    return {
        chartWidth,
        chartHeight,
        barWidth,
        barSpacing,
        offsetX: margin.left + offsetX,
        offsetY: margin.top,
        margin
    };
};

/**
 * Optimiza posiciones de vértices para evitar superposición
 */
export const optimizeVertexPositions = (vertices, minDistance = 30) => {
    const optimized = vertices.map(v => ({ ...v }));

    for (let iteration = 0; iteration < 100; iteration++) {
        let hasOverlap = false;

        for (let i = 0; i < optimized.length; i++) {
            for (let j = i + 1; j < optimized.length; j++) {
                const v1 = optimized[i];
                const v2 = optimized[j];

                const dist = distance(v1, v2);

                if (dist < minDistance) {
                    hasOverlap = true;

                    // Separar vértices
                    const angle = Math.atan2(v2.y - v1.y, v2.x - v1.x);
                    const separation = (minDistance - dist) / 2;

                    v1.x -= Math.cos(angle) * separation;
                    v1.y -= Math.sin(angle) * separation;
                    v2.x += Math.cos(angle) * separation;
                    v2.y += Math.sin(angle) * separation;
                }
            }
        }

        if (!hasOverlap) break;
    }

    return optimized;
};

// ==================== EXPORTACIÓN ====================

export const canvasHelpers = {
    // Geometría
    distance,
    midpoint,
    angle,
    rotatePoint,
    pointInRect,
    pointInCircle,
    lineRectIntersection,
    lineIntersection,

    // Dibujo
    drawArrow,
    drawTextWithBackground,
    drawShape,
    drawGrid,

    // Colores
    hexToRgb,
    rgbToHex,
    interpolateColor,
    generateColorPalette,
    adjustOpacity,

    // Layouts
    circularLayout,
    gridLayout,
    forceDirectedLayout,

    // Animación
    easeInOutQuad,
    lerp,
    lerpPoint,
    createTransition,

    // Específicas
    calculateHistogramLayout,
    optimizeVertexPositions,

    // Constantes
    COLORS,
    SHAPES
};

export default canvasHelpers;