import { createContext, useState, useMemo, useEffect, useContext } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import getTheme from '../theme/theme';

const ThemeContext = createContext({
    toggleColorMode: () => { },
    mode: 'light',
    primaryColor: '#F97316',
    secondaryColor: '#EC4899',
    setPrimaryColor: () => { },
    setSecondaryColor: () => { },
});

export const useColorMode = () => {
    return useContext(ThemeContext);
};

export const ThemeProviderWrapper = ({ children }) => {
    const [mode, setMode] = useState('light');
    const [primaryColor, setPrimaryColor] = useState('#F97316');
    const [secondaryColor, setSecondaryColor] = useState('#EC4899');

    useEffect(() => {
        const savedMode = localStorage.getItem('colorMode');
        const savedPrimary = localStorage.getItem('primaryColor');
        const savedSecondary = localStorage.getItem('secondaryColor');

        if (savedMode) setMode(savedMode);
        if (savedPrimary) setPrimaryColor(savedPrimary);
        if (savedSecondary) setSecondaryColor(savedSecondary);

        if (!savedMode && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setMode('dark');
        }
    }, []);

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => {
                    const newMode = prevMode === 'light' ? 'dark' : 'light';
                    localStorage.setItem('colorMode', newMode);
                    return newMode;
                });
            },
            mode,
            primaryColor,
            secondaryColor,
            setPrimaryColor: (color) => {
                setPrimaryColor(color);
                localStorage.setItem('primaryColor', color);
            },
            setSecondaryColor: (color) => {
                setSecondaryColor(color);
                localStorage.setItem('secondaryColor', color);
            },
        }),
        [mode, primaryColor, secondaryColor]
    );

    const theme = useMemo(() => getTheme(mode, primaryColor, secondaryColor), [mode, primaryColor, secondaryColor]);

    return (
        <ThemeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};
