const LoginOverlay = ({ children, isShifted = false }) => {
  return (
    <div className="fixed inset-0 overflow-hidden bg-black ft-login-root">
      <div
        className="relative w-screen h-screen ft-login-inner transition-transform duration-300 ease-out"
        style={isShifted ? { transform: "translateY(-30vh)" } : undefined}
      >
        {children}
      </div>
    </div>
  );
};

export default LoginOverlay;
