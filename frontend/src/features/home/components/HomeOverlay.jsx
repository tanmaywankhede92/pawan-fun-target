const HomeOverlay = ({ children }) => {
  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <div className="relative w-screen h-screen">{children}</div>
    </div>
  );
};

export default HomeOverlay;
