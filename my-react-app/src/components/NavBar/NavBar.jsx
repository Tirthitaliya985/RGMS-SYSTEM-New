import { useState } from "react";
import { motion } from "framer-motion";
import "./Navbar.css";

export default function Navbar() {
  const [active, setActive] = useState("home");

  const menuItems = ["Home", "Residents", "Visitors", "Complaints", "Dashboard"];

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
    >
      <div className="logo">🏢 Luxury Society</div>

      <ul className="menu">
        {menuItems.map((item) => (
          <motion.li
            key={item}
            whileHover={{ scale: 1.2, color: "#ffeb3b" }}
            onClick={() => setActive(item)}
            className={active === item ? "active" : ""}
          >
            {item}
          </motion.li>
        ))}
      </ul>
    </motion.nav>
  );
}
