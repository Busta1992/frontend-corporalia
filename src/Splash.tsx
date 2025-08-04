import { useEffect, useState } from "react";

import logoZercana from "./assets/Logo_Zercana (sin fondo).png";

function Splash({ onFinish }: { onFinish: () => void }) {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    setOpacity(1);
    const fadeOutTimer = setTimeout(() => setOpacity(0), 2000);
    const finishTimer = setTimeout(() => onFinish(), 3500);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      style={{
        opacity,
        transition: "opacity 1.5s ease",
        backgroundColor: "black",
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
      }}
    >
      <img
        src={logoZercana}
        alt="Logo Zercana"
        style={{
          maxWidth: "80%",
          maxHeight: "80%",
          transition: "opacity 1.5s ease",
          opacity,
        }}
      />
    </div>
  );
}

export default Splash;
