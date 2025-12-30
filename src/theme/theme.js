// import { createTheme, alpha } from '@mui/material/styles';

// const lightPalette = {
//     mode: 'light',
//     primary: {
//         main: '#9666D6',
//         light: '#e7e1ee',
//         dark: '#7A4AB3',
//         contrastText: '#FFFFFF',
//     },
//     secondary: {
//         main: '#EC4899',
//         light: '#F472B6',
//         dark: '#DB2777',
//         contrastText: '#FFFFFF',
//     },
//     background: {
//         default: '#eeeeee',
//         paper: '#FFFFFF',
//     },
//     text: {
//         primary: '#1F2937',
//         secondary: '#6B7280',
//     },
//     divider: '#E5E7EB',
//     error: { main: '#EF4444' },
//     success: { main: '#22C55E' },
//     info: { main: '#3B82F6' },
//     warning: { main: '#F59E0B' },
// };

// const darkPalette = {
//     mode: 'dark',
//     primary: {
//         main: '#A78BFA', // Lighter purple for dark mode
//         light: '#C4B5FD',
//         dark: '#7C3AED',
//         contrastText: '#FFFFFF',
//     },
//     secondary: {
//         main: '#F472B6', // Lighter pink
//         light: '#FBCFE8',
//         dark: '#DB2777',
//         contrastText: '#FFFFFF',
//     },
//     background: {
//         default: '#111827', // Dark gray/blue (Cool dark)
//         paper: '#1F2937',   // Slightly lighter gray
//     },
//     text: {
//         primary: '#F9FAFB',
//         secondary: '#9CA3AF',
//     },
//     divider: '#374151',
//     error: { main: '#F87171' },
//     success: { main: '#4ADE80' },
//     info: { main: '#60A5FA' },
//     warning: { main: '#FBBF24' },
// };

// const getTheme = (mode) => {
//     const palette = mode === 'dark' ? darkPalette : lightPalette;

//     return createTheme({
//         palette,
//         typography: {
//             fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
//             h1: { fontSize: '2.5rem', fontWeight: 700, color: palette.text.primary },
//             h2: { fontSize: '2rem', fontWeight: 700, color: palette.text.primary },
//             h3: { fontSize: '1.75rem', fontWeight: 600, color: palette.text.primary },
//             h4: { fontSize: '1.5rem', fontWeight: 600, color: palette.text.primary },
//             h5: { fontSize: '1.25rem', fontWeight: 600, color: palette.text.primary },
//             h6: { fontSize: '1rem', fontWeight: 600, color: palette.text.primary },
//             subtitle1: { fontSize: '1rem', fontWeight: 500, color: palette.text.secondary },
//             subtitle2: { fontSize: '0.875rem', fontWeight: 500, color: palette.text.secondary },
//             body1: { fontSize: '1rem', lineHeight: 1.5, color: palette.text.primary },
//             body2: { fontSize: '0.875rem', lineHeight: 1.43, color: palette.text.secondary },
//             button: { textTransform: 'none', fontWeight: 600 },
//         },
//         shape: { borderRadius: 12 },
//         components: {
//             MuiCssBaseline: {
//                 styleOverrides: {
//                     body: {
//                         backgroundImage: mode === 'light' ?
//                             'radial-gradient(at 0% 0%, rgba(79, 70, 229, 0.05) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(236, 72, 153, 0.05) 0px, transparent 50%)'
//                             : 'none',
//                         backgroundAttachment: 'fixed',
//                         scrollbarColor: mode === 'dark' ? '#4B5563 #1F2937' : '#9CA3AF #F3F4F6',
//                         '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
//                             backgroundColor: mode === 'dark' ? '#1F2937' : '#F3F4F6',
//                         },
//                         '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
//                             backgroundColor: mode === 'dark' ? '#4B5563' : '#9CA3AF',
//                             border: `2px solid ${mode === 'dark' ? '#1F2937' : '#F3F4F6'}`,
//                         },
//                         '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
//                             backgroundColor: mode === 'dark' ? '#6B7280' : '#6B7280',
//                         },
//                     },
//                 },
//             },
//             MuiButton: {
//                 styleOverrides: {
//                     root: {
//                         borderRadius: 50,
//                         padding: '8px 20px',
//                         boxShadow: 'none',
//                         '&:hover': {
//                             boxShadow: `0 4px 12px ${alpha(palette.primary.main, 0.2)}`,
//                         },
//                     },
//                     containedPrimary: {
//                         background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${palette.primary.dark} 100%)`,
//                     },
//                     containedSecondary: {
//                         background: `linear-gradient(135deg, ${palette.secondary.main} 0%, ${palette.secondary.dark} 100%)`,
//                     },
//                 },
//             },
//             MuiCard: {
//                 styleOverrides: {
//                     root: {
//                         borderRadius: 16,
//                         backgroundImage: 'none',
//                         border: `1px solid ${mode === 'dark' ? alpha('#ffffff', 0.1) : alpha(palette.primary.main, 0.05)}`,
//                         boxShadow: mode === 'dark' ? 'none' : '0 4px 20px rgba(0,0,0,0.05)',
//                     },
//                 },
//             },
//             MuiAppBar: {
//                 styleOverrides: {
//                     root: {
//                         background: mode === 'dark' ? '#1F2937' : '#fff',
//                         color: palette.text.primary,
//                         boxShadow: mode === 'dark' ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
//                         borderBottom: `1px solid ${palette.divider}`
//                     },
//                 },
//             },
//             MuiDrawer: {
//                 styleOverrides: {
//                     paper: {
//                         borderRight: `1px solid ${palette.divider}`,
//                         backgroundColor: palette.background.paper,
//                     },
//                 },
//             },
//         },
//     });
// };

// export default getTheme;




import { createTheme, alpha } from '@mui/material/styles';

/* =======================
   LIGHT THEME (Warm Coral)
   ======================= */
const lightPalette = {
    mode: 'light',
    primary: {
        main: '#F97316',        // Warm Coral
        light: '#FFEDD5',
        dark: '#C2410C',
        contrastText: '#FFFFFF',
    },
    secondary: {
        main: '#EC4899',
        light: '#F472B6',
        dark: '#DB2777',
        contrastText: '#FFFFFF',
    },
    background: {
        default: '#eeeeee',
        paper: '#FFFFFF',
    },
    text: {
        primary: '#1F2937',
        secondary: '#6B7280',
    },
    divider: '#E5E7EB',
    error: { main: '#EF4444' },
    success: { main: '#22C55E' },
    info: { main: '#3B82F6' },
    warning: { main: '#F59E0B' },
};

/* =======================
   DARK THEME (Warm Coral)
   ======================= */
const darkPalette = {
    mode: 'dark',
    primary: {
        main: '#FB923C',   // Softer coral for dark mode
        light: '#FED7AA',
        dark: '#EA580C',
        contrastText: '#FFFFFF',
    },
    secondary: {
        main: '#F472B6',
        light: '#FBCFE8',
        dark: '#DB2777',
        contrastText: '#FFFFFF',
    },
    background: {
        default: '#111827',
        paper: '#1F2937',
    },
    text: {
        primary: '#F9FAFB',
        secondary: '#9CA3AF',
    },
    divider: '#374151',
    error: { main: '#F87171' },
    success: { main: '#4ADE80' },
    info: { main: '#60A5FA' },
    warning: { main: '#FBBF24' },
};

const getTheme = (mode, primaryColor = '#F97316', secondaryColor = '#EC4899') => {
    const isDark = mode === 'dark';

    const palette = {
        mode,
        primary: {
            main: primaryColor,
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: secondaryColor,
            contrastText: '#FFFFFF',
        },
        background: {
            default: isDark ? '#111827' : '#eeeeee',
            paper: isDark ? '#1F2937' : '#FFFFFF',
        },
        text: {
            primary: isDark ? '#F9FAFB' : '#1F2937',
            secondary: isDark ? '#9CA3AF' : '#6B7280',
        },
        divider: isDark ? '#374151' : '#E5E7EB',
        error: { main: isDark ? '#F87171' : '#EF4444' },
        success: { main: isDark ? '#4ADE80' : '#22C55E' },
        info: { main: isDark ? '#60A5FA' : '#3B82F6' },
        warning: { main: isDark ? '#FBBF24' : '#F59E0B' },
    };

    const theme = createTheme({
        palette,
        typography: {
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            h1: { fontSize: '2.5rem', fontWeight: 700, color: palette.text.primary },
            h2: { fontSize: '2rem', fontWeight: 700, color: palette.text.primary },
            h3: { fontSize: '1.75rem', fontWeight: 600, color: palette.text.primary },
            h4: { fontSize: '1.5rem', fontWeight: 600, color: palette.text.primary },
            h5: { fontSize: '1.25rem', fontWeight: 600, color: palette.text.primary },
            h6: { fontSize: '1rem', fontWeight: 600, color: palette.text.primary },
            subtitle1: { fontSize: '1rem', fontWeight: 500, color: palette.text.secondary },
            subtitle2: { fontSize: '0.875rem', fontWeight: 500, color: palette.text.secondary },
            body1: { fontSize: '1rem', lineHeight: 1.5, color: palette.text.primary },
            body2: { fontSize: '0.875rem', lineHeight: 1.43, color: palette.text.secondary },
            button: { textTransform: 'none', fontWeight: 600 },
        },
        shape: { borderRadius: 12 },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        backgroundImage:
                            mode === 'light'
                                ? `radial-gradient(at 0% 0%, ${alpha(palette.primary.main, 0.08)} 0px, transparent 50%),
                                   radial-gradient(at 100% 0%, ${alpha(palette.secondary.main, 0.06)} 0px, transparent 50%)`
                                : 'none',
                        backgroundAttachment: 'fixed',
                        scrollbarColor:
                            mode === 'dark'
                                ? '#4B5563 #1F2937'
                                : '#9CA3AF #F3F4F6',
                        '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                            backgroundColor: mode === 'dark' ? '#1F2937' : '#F3F4F6',
                        },
                        '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                            backgroundColor: mode === 'dark' ? '#4B5563' : '#9CA3AF',
                            border: `2px solid ${mode === 'dark' ? '#1F2937' : '#F3F4F6'}`,
                        },
                        '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
                            backgroundColor: '#6B7280',
                        },
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 50,
                        padding: '8px 20px',
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: `0 4px 12px ${alpha(palette.primary.main, 0.25)}`,
                        },
                    },

                    containedPrimary: {
                        backgroundColor: palette.primary.main,
                        '&:hover': {
                            backgroundColor: alpha(palette.primary.main, 0.9),
                        },
                    },

                    containedSecondary: {
                        backgroundColor: palette.secondary.main,
                        '&:hover': {
                            backgroundColor: alpha(palette.secondary.main, 0.9),
                        },
                    },
                },
            },

            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 16,
                        backgroundImage: 'none',
                        border: `1px solid ${mode === 'dark'
                            ? alpha('#ffffff', 0.1)
                            : alpha(palette.primary.main, 0.08)
                            }`,
                        boxShadow:
                            mode === 'dark'
                                ? 'none'
                                : '0 4px 20px rgba(0,0,0,0.05)',
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        background: mode === 'dark' ? '#1F2937' : '#fff',
                        color: palette.text.primary,
                        boxShadow: mode === 'dark'
                            ? 'none'
                            : '0 1px 3px rgba(0,0,0,0.05)',
                        borderBottom: `1px solid ${palette.divider}`,
                    },
                },
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        borderRight: `1px solid ${palette.divider}`,
                        backgroundColor: palette.background.paper,
                    },
                },
            },
        },
    });

    return theme;
};

export default getTheme;