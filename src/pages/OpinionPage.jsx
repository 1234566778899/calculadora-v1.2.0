import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Rating,
    FormControl,
    FormLabel,
    Paper,
    Avatar,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
    Divider,
    Card,
    CardContent,
    IconButton,
    Backdrop,
    CircularProgress
} from '@mui/material';
import {
    Feedback,
    Google,
    Send,
    AccountCircle,
    Star,
    Close,
    Logout
} from '@mui/icons-material';
import { useSigninCheck, useFirestore, useUser } from 'reactfire';
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signOut
} from 'firebase/auth';
import {
    collection,
    addDoc,
    serverTimestamp,
    doc,
    getDoc
} from 'firebase/firestore';

const OpinionPage = () => {
    const auth = getAuth();
    const firestore = useFirestore();
    const { status: authStatus, data: signInCheckResult } = useSigninCheck(auth);
    const user = signInCheckResult?.user;

    // Estados del formulario
    const [feedbackData, setFeedbackData] = useState({
        rating: 0,
        functionality: '',
        improvements: '',
        bugReports: '',
        suggestions: ''
    });

    // Estados de UI
    const [loginDialogOpen, setLoginDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [hasSubmittedToday, setHasSubmittedToday] = useState(false);

    // Verificar si el usuario ya envió feedback hoy
    useEffect(() => {
        const checkTodaySubmission = async () => {
            if (user) {
                try {
                    const today = new Date().toISOString().split('T')[0];
                    const userFeedbackRef = doc(firestore, 'userFeedback', `${user.uid}_${today}`);
                    const docSnap = await getDoc(userFeedbackRef);
                    setHasSubmittedToday(docSnap.exists());
                } catch (error) {
                    console.error('Error checking today submission:', error);
                }
            }
        };

        if (authStatus === 'success' && signInCheckResult?.signedIn && user) {
            checkTodaySubmission();
        }
    }, [signInCheckResult, authStatus, firestore]);

    // Verificar si necesita login al cargar la página
    useEffect(() => {
        if (authStatus === 'success' && !signInCheckResult?.signedIn) {
            setLoginDialogOpen(true);
        }
    }, [authStatus, signInCheckResult]);

    // Función para login con Google
    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: 'select_account'
            });

            await signInWithPopup(auth, provider);
            setLoginDialogOpen(false);
            showSnackbar('¡Bienvenido! Ya puedes compartir tu opinión.', 'success');
        } catch (error) {
            console.error('Error en login:', error);
            showSnackbar('Error al iniciar sesión. Intenta nuevamente.', 'error');
        }
    };

    // Función para logout
    const handleLogout = async () => {
        try {
            await signOut(auth);
            showSnackbar('Sesión cerrada correctamente.', 'info');
        } catch (error) {
            console.error('Error en logout:', error);
        }
    };

    // Función para mostrar snackbar
    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    // Manejar cambios en el formulario
    const handleInputChange = (field, value) => {
        setFeedbackData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Enviar feedback a Firebase
    const handleSubmitFeedback = async () => {
        if (!signInCheckResult?.signedIn || !user) {
            setLoginDialogOpen(true);
            return;
        }

        if (feedbackData.rating === 0) {
            showSnackbar('Por favor, asigna una calificación.', 'warning');
            return;
        }

        setIsSubmitting(true);

        try {
            // Guardar en colección general de feedback
            await addDoc(collection(firestore, 'feedback'), {
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName,
                userPhoto: user.photoURL,
                rating: feedbackData.rating,
                functionality: feedbackData.functionality,
                improvements: feedbackData.improvements,
                bugReports: feedbackData.bugReports,
                suggestions: feedbackData.suggestions,
                timestamp: serverTimestamp(),
                date: new Date().toISOString().split('T')[0]
            });

            // Guardar registro de usuario para evitar spam (un feedback por día)
            const today = new Date().toISOString().split('T')[0];
            await addDoc(collection(firestore, 'userFeedback'), {
                userId: user.uid,
                date: today,
                timestamp: serverTimestamp()
            });

            // Resetear formulario
            setFeedbackData({
                rating: 0,
                functionality: '',
                improvements: '',
                bugReports: '',
                suggestions: ''
            });

            setHasSubmittedToday(true);
            showSnackbar('¡Gracias por tu feedback! Tu opinión es muy valiosa.', 'success');

        } catch (error) {
            console.error('Error al enviar feedback:', error);
            showSnackbar('Error al enviar tu opinión. Intenta nuevamente.', 'error');
        }

        setIsSubmitting(false);
    };

    // Loading state
    if (authStatus === 'loading') {
        return (
            <Backdrop open={true} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <CircularProgress color="inherit" />
            </Backdrop>
        );
    }

    return (
        <Container sx={{ py: 4 }}>
            {/* Header con información del usuario */}
            <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Feedback sx={{ fontSize: 40 }} />
                        <Box>
                            <Typography variant="h4" component="h1" fontWeight="bold">
                                Tu Opinión Importa
                            </Typography>
                            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                                Comparte tu experiencia y ayúdanos a mejorar
                            </Typography>
                        </Box>
                    </Box>

                    {signInCheckResult?.signedIn && user && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar src={user.photoURL} sx={{ width: 40, height: 40 }} />
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="body2">{user.displayName}</Typography>
                                <IconButton
                                    size="small"
                                    onClick={handleLogout}
                                    sx={{ color: 'white', ml: 1 }}
                                >
                                    <Logout fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Paper>

            {/* Verificar si ya envió feedback hoy */}
            {hasSubmittedToday ? (
                <Card sx={{ textAlign: 'center', py: 6 }}>
                    <CardContent>
                        <Star sx={{ fontSize: 60, color: 'gold', mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                            ¡Gracias por tu feedback!
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Ya has enviado tu opinión hoy. Puedes enviar una nueva opinión mañana.
                        </Typography>
                        <Chip label="Feedback enviado" color="success" sx={{ mt: 2 }} />
                    </CardContent>
                </Card>
            ) : (
                /* Formulario de Feedback */
                <Card elevation={2}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
                            Cuéntanos tu experiencia
                        </Typography>

                        {/* Calificación General */}
                        <FormControl component="fieldset" sx={{ mb: 4, width: '100%' }}>
                            <FormLabel component="legend" sx={{ mb: 2, fontWeight: 'bold', fontSize: '1.1rem' }}>
                                ¿Cómo calificarías la aplicación en general? *
                            </FormLabel>
                            <Rating
                                value={feedbackData.rating}
                                onChange={(event, newValue) => handleInputChange('rating', newValue)}
                                size="large"
                                sx={{ fontSize: '2.5rem' }}
                            />
                        </FormControl>

                        <Divider sx={{ my: 3 }} />

                        {/* Funcionalidad más útil */}
                        <TextField
                            fullWidth
                            label="¿Cuál es la funcionalidad que más te ha servido?"
                            multiline
                            rows={3}
                            value={feedbackData.functionality}
                            onChange={(e) => handleInputChange('functionality', e.target.value)}
                            sx={{ mb: 3 }}
                            placeholder="Ej: Los filtros de imágenes, la aritmética modular, algoritmos de grafos..."
                            variant="outlined"
                        />

                        {/* Sugerencias de mejora */}
                        <TextField
                            fullWidth
                            label="¿Qué te gustaría que mejoremos?"
                            multiline
                            rows={3}
                            value={feedbackData.improvements}
                            onChange={(e) => handleInputChange('improvements', e.target.value)}
                            sx={{ mb: 3 }}
                            placeholder="Comparte ideas para hacer la aplicación más útil..."
                            variant="outlined"
                        />

                        {/* Reportes de bugs */}
                        <TextField
                            fullWidth
                            label="¿Has encontrado algún error o bug?"
                            multiline
                            rows={2}
                            value={feedbackData.bugReports}
                            onChange={(e) => handleInputChange('bugReports', e.target.value)}
                            sx={{ mb: 3 }}
                            placeholder="Describe cualquier problema técnico que hayas encontrado..."
                            variant="outlined"
                        />

                        {/* Nuevas funcionalidades */}
                        <TextField
                            fullWidth
                            label="¿Qué nuevas funcionalidades te gustaría ver?"
                            multiline
                            rows={3}
                            value={feedbackData.suggestions}
                            onChange={(e) => handleInputChange('suggestions', e.target.value)}
                            sx={{ mb: 4 }}
                            placeholder="Nuevos algoritmos, herramientas, mejoras en la interfaz..."
                            variant="outlined"
                        />

                        {/* Botón de envío */}
                        <Box sx={{ textAlign: 'center' }}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
                                onClick={handleSubmitFeedback}
                                disabled={isSubmitting || !signInCheckResult?.signedIn}
                                sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
                            >
                                {isSubmitting ? 'Enviando...' : 'Enviar Opinión'}
                            </Button>

                            {!signInCheckResult?.signedIn && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                    Necesitas iniciar sesión para enviar tu opinión
                                </Typography>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Dialog de Login */}
            <Dialog
                open={loginDialogOpen}
                onClose={() => setLoginDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
                    <AccountCircle sx={{ fontSize: 50, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h5" component="div">
                        Iniciar Sesión
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Para compartir tu opinión, necesitas iniciar sesión con tu cuenta de Google
                    </Typography>

                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<Google />}
                        onClick={handleGoogleLogin}
                        sx={{
                            bgcolor: '#4285f4',
                            '&:hover': { bgcolor: '#3367d6' },
                            px: 4,
                            py: 1.5
                        }}
                    >
                        Continuar con Google
                    </Button>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setLoginDialogOpen(false)} color="inherit">
                        Cancelar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar para notificaciones */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default OpinionPage;