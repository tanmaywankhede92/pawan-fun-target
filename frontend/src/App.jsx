import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppRoutes from "@routes/AppRoutes";
import SplashScreen from "@components/common/SplashScreen";
import FullscreenHandler from "@components/common/FullscreenHandler";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FullscreenHandler />
        <AppRoutes />
        <SplashScreen />
        {/* <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        /> */}
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
