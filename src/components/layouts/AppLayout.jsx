import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    Collapse,
    IconButton,
    Button,
    Container,
    useTheme,
    useMediaQuery,
    Chip
} from '@mui/material';
import {
    Menu as MenuIcon,
    ExpandLess,
    ExpandMore,
    Calculate,
    WhatsApp,
    Launch,
    Feedback
} from '@mui/icons-material';

const DRAWER_WIDTH = 280;

// Datos del menú con rutas
const menuItems = [
    {
        id: 'expansion',
        label: 'Expansión de un histograma',
        type: 'single',
        route: '/expansion'
    },
    {
        id: 'ecualization',
        label: 'Ecualización de un histograma',
        type: 'single',
        route: '/ecualization'
    },
    {
        id: 'filtros',
        label: 'Filtros',
        type: 'dropdown',
        children: [
            { id: 'laplaciano', label: 'Laplaciano', route: '/filtros/laplaciano' },
            { id: 'media', label: 'Media', route: '/filtros/media' },
            { id: 'mediana', label: 'Mediana', route: '/filtros/mediana' }
        ]
    },
    {
        id: 'aritmetica',
        label: 'Aritmética Modular',
        type: 'dropdown',
        children: [
            { id: 'congruencias', label: 'Congruencias lineales', route: '/aritmetica/congruencias' },
            { id: 'rsa', label: 'Encriptación RSA', route: '/aritmetica/rsa' }
        ]
    },
    {
        id: 'matriz-caminos',
        label: 'Matriz de Caminos',
        type: 'single',
        route: '/matriz-caminos'
    },
    {
        id: 'conexas',
        label: 'Componentes conexas',
        type: 'single',
        route: '/conexas'
    },
    {
        id: 'hamiltoniano',
        label: 'Ciclo Hamiltoniano',
        type: 'external',
        url: './assets/hamiltoniano.html'
    },
    {
        id: 'ford-fulkerson',
        label: 'Algoritmo de Ford-Fulkerson',
        type: 'external',
        url: 'https://graphonline.ru/es/'
    },
    {
        id: 'dijkstra',
        label: 'Algoritmo de Dijkstra',
        type: 'external',
        url: 'https://graphonline.ru/es/'
    },
    {
        id: 'huffman',
        label: 'Algoritmo de Huffman',
        type: 'external',
        url: './assets/huffman/index.html'
    },
    {
        id: 'juegos',
        label: 'Teoría de Juegos',
        type: 'single',
        route: '/juegos'
    },
    {
        id: 'hasse',
        label: 'Diagrama de Hasse',
        type: 'external',
        url: './assets/DiagramaHasse/index.html'
    },
    {
        id: 'verdad',
        label: 'Tablas de verdad',
        type: 'external',
        url: './assets/tablas-verdad/index.html'
    }
];

const AppLayout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const location = useLocation();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [openDropdowns, setOpenDropdowns] = useState({});

    // Determinar módulo activo basado en la ruta actual
    const getActiveModule = () => {
        const currentPath = location.pathname;

        // Buscar en items de primer nivel
        for (const item of menuItems) {
            if (item.route === currentPath) {
                return item.id;
            }

            // Buscar en children de dropdowns
            if (item.children) {
                for (const child of item.children) {
                    if (child.route === currentPath) {
                        return child.id;
                    }
                }
            }
        }

        return null;
    };

    // Verificar si un dropdown debe estar abierto basado en la ruta actual
    const shouldDropdownBeOpen = (item) => {
        if (item.type !== 'dropdown' || !item.children) return false;

        const currentPath = location.pathname;
        return item.children.some(child => child.route === currentPath);
    };

    // Inicializar dropdowns abiertos basado en la ruta actual
    React.useEffect(() => {
        const initialOpenDropdowns = {};
        menuItems.forEach(item => {
            if (shouldDropdownBeOpen(item)) {
                initialOpenDropdowns[item.id] = true;
            }
        });
        setOpenDropdowns(initialOpenDropdowns);
    }, [location.pathname]);

    const activeModule = getActiveModule();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleDropdownToggle = (itemId) => {
        setOpenDropdowns(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const handleMenuItemClick = (item) => {
        if (item.type === 'external') {
            window.open(item.url, '_blank');
        } else if (item.type === 'single' && item.route) {
            navigate(item.route);
            if (isMobile) {
                setMobileOpen(false);
            }
        }
    };

    const handleChildClick = (child) => {
        if (child.route) {
            navigate(child.route);
            if (isMobile) {
                setMobileOpen(false);
            }
        }
    };

    // Función para navegar a la página de opinión
    const handleFeedbackNavigation = () => {
        navigate('/opinion');
    };

    const renderMenuItem = (item) => {
        if (item.type === 'dropdown') {
            const isOpen = openDropdowns[item.id] || shouldDropdownBeOpen(item);

            return (
                <Box key={item.id}>
                    <ListItemButton onClick={() => handleDropdownToggle(item.id)}>
                        <ListItemText primary={item.label} />
                        {isOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {item.children.map((child) => (
                                <ListItemButton
                                    key={child.id}
                                    sx={{ pl: 4 }}
                                    selected={activeModule === child.id}
                                    onClick={() => handleChildClick(child)}
                                >
                                    <ListItemText primary={child.label} />
                                </ListItemButton>
                            ))}
                        </List>
                    </Collapse>
                </Box>
            );
        }

        return (
            <ListItemButton
                key={item.id}
                selected={activeModule === item.id}
                onClick={() => handleMenuItemClick(item)}
            >
                <ListItemText primary={item.label} />
                {item.type === 'external' && <Launch fontSize="small" />}
            </ListItemButton>
        );
    };

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <List sx={{ flexGrow: 1, py: 2 }}>
                {menuItems.map(renderMenuItem)}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* AppBar */}
            <AppBar
                position="fixed"
                sx={{
                    zIndex: theme.zIndex.drawer + 1,
                    bgcolor: 'primary.main'
                }}
            >
                <Toolbar>
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}

                    <Calculate sx={{ mr: 2 }} />

                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    >
                        MATEMÁTICA COMPUTACIONAL: CALCULADORA
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                            label="Versión 2.0.0"
                            variant="outlined"
                            size="small"
                            sx={{ color: 'white', borderColor: 'white' }}
                        />

                        {/* Botón de Opinión */}
                        <Button
                            color="inherit"
                            startIcon={<Feedback />}
                            onClick={handleFeedbackNavigation}
                            sx={{ ml: 1 }}
                        >
                            {isMobile ? '' : 'Dar Opinión'}
                        </Button>

                        <Button
                            color="inherit"
                            startIcon={<WhatsApp />}
                            href="https://wa.me/51904435631?text=Hola Carlos!"
                            target="_blank"
                            sx={{ ml: 1 }}
                        >
                            {isMobile ? '' : 'Contacto'}
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Box
                component="nav"
                sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
            >
                {/* Mobile drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: DRAWER_WIDTH,
                            bgcolor: 'grey.50'
                        },
                    }}
                >
                    {drawer}
                </Drawer>

                {/* Desktop drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: DRAWER_WIDTH,
                            bgcolor: 'grey.50'
                        },
                    }}
                    open
                >
                    <Toolbar /> {/* Spacer for AppBar */}
                    {drawer}
                </Drawer>
            </Box>

            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 0,
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    minHeight: '100vh',
                    bgcolor: 'grey.100'
                }}
            >
                <Toolbar /> {/* Spacer for AppBar */}

                <Container
                    maxWidth="xl"
                    sx={{
                        py: 3,
                        height: 'calc(100vh - 64px)', // 64px is AppBar height
                        overflow: 'auto'
                    }}
                >
                    <Box
                        sx={{
                            bgcolor: 'white',
                            borderRadius: 2,
                            boxShadow: 1,
                            minHeight: 'calc(100vh - 128px)'
                        }}
                    >
                        <Outlet />
                    </Box>
                </Container>
            </Box>

            {/* Right sidebar placeholder */}
            <Box
                sx={{
                    width: { xs: 0, lg: 200 },
                    display: { xs: 'none', lg: 'block' },
                    bgcolor: 'grey.200',
                    p: 2
                }}
            >
                <Typography variant="body2" sx={{ textAlign: 'center', mt: 8 }}>
                    ACTIVE
                </Typography>
            </Box>
        </Box>
    );
};

export default AppLayout;