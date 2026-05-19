import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { createPortal } from "react-dom";
import { FaPlus } from "react-icons/fa6";
import "../styles/floatingActionMenu.css";

export type FloatingActionMenuItem = {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  ariaLabel?: string;
};

type FloatingActionMenuProps = {
  items?: FloatingActionMenuItem[];
  ariaLabel?: string;
};

function FloatingActionMenu({ items, ariaLabel = "Quick actions menu" }: FloatingActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const contentRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close menu when clicking outside the content (toggle + panel) without using an overlay
  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!contentRef.current) return;
      if (!contentRef.current.contains(target)) setIsOpen(false);
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isOpen]);

  const defaultItems = useMemo<FloatingActionMenuItem[]>(
    () => [
      { label: "Assign grade", onClick: () => navigate("/grade") },
      { label: "Add course", onClick: () => navigate("/course") },
      { label: "Create assessment", onClick: () => navigate("/assessment") },
    ],
    [navigate],
  );

  const actionItems = useMemo(
    () => (items ?? defaultItems).filter((item) => item.label.trim().length > 0),
    [items, defaultItems],
  );

  return createPortal(
    <div className="floating-action-menu" data-open={isOpen}>
      <div className="floating-action-menu__content" ref={contentRef}>
        {isOpen && (
          <div className="floating-action-menu__panel" role="menu" aria-label={ariaLabel}>
            {actionItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className="floating-action-menu__item"
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                aria-label={item.ariaLabel ?? item.label}
                role="menuitem"
              >
                {item.icon ? <span className="floating-action-menu__item-icon">{item.icon}</span> : null}
                <span className="floating-action-menu__item-label">{item.label}</span>
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          className="floating-action-menu__toggle"
          aria-label={isOpen ? "Close quick actions" : "Open quick actions"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          <FaPlus className="floating-action-menu__toggle-icon" />
        </button>
      </div>
    </div>,
    document.body,
  );
}

export default FloatingActionMenu;
