import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileTopbar from "./MobileTopbar";
import Topbar from "./Topbar";
import BottomNav from "./BottomNav";
import DrawerMenu from "./DrawerMenu";
import MascotWidget from "../chat/MascotWidget";
import { useAuthStore } from "../../store/stores";

export default function MainLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();
  const { user } = useAuthStore();

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "#E8F0FE",
      }}
    >
      {/* Desktop sidebar */}
      {!isMobile && <Sidebar />}

      {/* Mobile drawer overlay */}
      {isMobile && drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.45)",
            zIndex: 200,
          }}
        />
      )}
      {isMobile && (
        <DrawerMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      )}

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background:
            "linear-gradient(180deg,#D4E8FF 0%,#EEF4FF 40%,#F0F4FF 100%)",
        }}
      >
        {isMobile ? (
          <MobileTopbar onHamburger={() => setDrawerOpen(true)} />
        ) : (
          <Topbar />
        )}
        <main
          style={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            maxWidth: "100%",
            overflowY: "auto",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            boxSizing: "border-box",
            padding: isMobile
              ? "16px 14px max(84px, calc(74px + env(safe-area-inset-bottom, 0px)))"
              : "18px 28px 28px",
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      {isMobile && <BottomNav />}

      {!["teacher", "parent"].includes(user?.role) && <MascotWidget />}
    </div>
  );
}
