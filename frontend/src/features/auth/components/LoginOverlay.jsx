const LoginOverlay = ({ children }) => {
  return (
    <div className="fixed inset-0 overflow-hidden">
      {children}
    </div>
  );
};

export default LoginOverlay;
