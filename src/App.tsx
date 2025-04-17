import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router';
import './index.css'
import Home from './pages/Home';
import Layout from './layout/Layout';
import { ThemeProvider } from './context/ThemeContext';
import BruttoNettoRechnerModern from './components/BruttoNetto';
import { useTheme } from './context/ThemeContext';

// Wrapper-Komponente für den Router, um den Dark Mode auf die gesamte Seite anzuwenden
const ThemedRouter = () => {
  const { isDarkMode } = useTheme();
  
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<Layout />} >
        <Route index element={<Home/>} />
      </Route>
    )
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <RouterProvider router={router} />
      <BruttoNettoRechnerModern />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ThemedRouter />
    </ThemeProvider>
  );
}

export default App;
