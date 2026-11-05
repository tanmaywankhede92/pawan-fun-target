const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen overflow-hidden" style={{ backgroundColor: "#1a0804" }}>
      {children}
    </div>
  );
};

export default MainLayout; 