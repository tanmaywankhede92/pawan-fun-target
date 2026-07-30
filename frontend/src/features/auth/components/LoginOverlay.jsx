const LoginOverlay = ({ children }) => {
  return (
    <div className="fixed inset-0 overflow-hidden">
      <div
        className="absolute"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          minWidth: '100vw',
          minHeight: '100vh',
          aspectRatio: '1448 / 1086',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default LoginOverlay;
