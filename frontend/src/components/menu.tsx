import { useState } from "react";
import { useNavigate } from "react-router";
import "../styles/menu.css";

interface MenuItem {
  label: string;
  path: string;
  icon?: string;
}

function Menu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems: MenuItem[] = [
    { label: "Grados", path: "/grade-list", icon: "📊" },
    { label: "Cursos", path: "/course-list", icon: "📚" },
    { label: "Evaluaciones", path: "/assessment-list", icon: "📝" },
    { label: "Semestres", path: "/semester", icon: "📅" },
  ];

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="menu-container">
      <button
        className="menu-toggle-btn"
        onClick={toggleMenu}
        aria-label="Abrir menú"
      >
        <span className={`hamburger ${isOpen ? "open" : ""}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      {isOpen && (
        <nav className="menu-dropdown">
          <div className="menu-header">
            <h2>Menú</h2>
            <button
              className="menu-close-btn"
              onClick={toggleMenu}
              aria-label="Cerrar menú"
            >
              ✕
            </button>
          </div>
          <ul className="menu-list">
            {menuItems.map((item) => (
              <li key={item.path}>
                <button
                  className="menu-item"
                  onClick={() => handleMenuItemClick(item.path)}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {isOpen && <div className="menu-overlay" onClick={toggleMenu}></div>}
    </div>
  );
}

export default Menu;
