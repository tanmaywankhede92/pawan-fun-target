const HomeOverlay = ({ children }) => {
  return (
    <div className="fixed inset-0 overflow-hidden bg-black" onContextMenu={(e) => e.preventDefault()}>
      <div className="relative w-screen h-screen select-none">{children}</div>
    </div>
  );
};

export default HomeOverlay;
