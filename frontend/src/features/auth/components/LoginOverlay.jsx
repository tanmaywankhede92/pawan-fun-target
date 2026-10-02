const LoginOverlay = ({ children }) => {
  return (
    <div className="fixed inset-0 overflow-hidden bg-black ft-login-root">
      <div className="relative w-screen h-screen ft-login-inner">
        {children}
      </div>
    </div>
  );
};

export default LoginOverlay;
