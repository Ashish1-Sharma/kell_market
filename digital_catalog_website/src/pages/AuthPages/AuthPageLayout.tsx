import React, { useEffect, useRef } from "react";
import GridShape from "../../components/common/GridShape";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";
import lottie from "lottie-web";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Background animation (looping)
    const bgAnim = lottie.loadAnimation({
      container: bgRef.current!,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path:  `${import.meta.env.BASE_URL}animations/Background.json`,
    });

    return () => {
      bgAnim.destroy();
    };
  }, []);

  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      {/* Background animation container */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      ></div>

      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0 z-10">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-transparent dark:bg-white/5 lg:grid">
          <div className="relative flex items-center justify-center z-1">
            <GridShape />
            <div className="flex flex-col items-center max-w-xs">
              <p className="text-center text-gray-400 dark:text-white/60 text-lg font-medium">
                Welcome to Kell Plus Admin panel
              </p>
            </div>
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
