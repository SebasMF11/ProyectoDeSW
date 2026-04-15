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
    { label: "Start a new semester", path: "/semester" },
    { label: "Assessments", path: "/assessment-list" },
    { label: "Courses", path: "/course-list" },
    { label: "Qualifications", path: "/grade-list" },
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
        aria-label="Open menu"
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
            <h2>Menu</h2>
            <button
              className="menu-close-btn"
              onClick={toggleMenu}
              aria-label="Close menu"
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
