import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppRoutes from '@routes/AppRoutes';
import RotateDeviceOverlay from '@components/common/RotateDeviceOverlay';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <RotateDeviceOverlay />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
