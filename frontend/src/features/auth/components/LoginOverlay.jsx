import { useEffect, useState } from "react";

const readViewport = () => {
  if (window.visualViewport) {
    return {
      width: window.visualViewport.width,
      height: window.visualViewport.height,
      offsetTop: window.visualViewport.offsetTop,
    };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    offsetTop: 0,
  };
};

const LoginOverlay = ({ children }) => {
  const [vv, setVv] = useState(readViewport);

  useEffect(() => {
    const vvApi = window.visualViewport;
    if (!vvApi) return;

    const update = () => setVv(readViewport);
    vvApi.addEventListener("resize", update);
    vvApi.addEventListener("scroll", update);

    update();
    return () => {
      vvApi.removeEventListener("resize", update);
      vvApi.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black ft-login-root">
      <div
        className="relative ft-login-inner"
        style={{
          width: vv.width,
          height: vv.height,
          transform: `translateY(${vv.offsetTop}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default LoginOverlay;
