import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Schedule from './pages/Schedule';
import Analytics from './pages/Analytics';
import Integrations from './pages/Integrations';
import Login from './pages/Login';

function App() {
    return (
        <BrowserRouter>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    },
                }}
            />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="upload" element={<Upload />} />
                    <Route path="schedule" element={<Schedule />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="integrations" element={<Integrations />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
