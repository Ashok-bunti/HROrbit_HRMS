import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AuthProvider } from './context/AuthContext';
import { ThemeProviderWrapper } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';

function App() {
    return (
        <Provider store={store}>
            <ThemeProviderWrapper>
                <AuthProvider>
                    <Router>
                        <AppRoutes />
                    </Router>
                </AuthProvider>
            </ThemeProviderWrapper>
        </Provider>
    );
}

export default App;
