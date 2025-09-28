import React , {useState} from "react";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import styles from "./navbar.module.css"

export default function Navbar() {
 const [displayMenu, setDisplayMenu] = useState(true);

  const hideMenu = () => setDisplayMenu(false);
  const showMenu = () => setDisplayMenu(true);
  return (
    <div className={styles.navbar}>
      <div className={styles.navbarLeft}>
        {displayMenu ? (
          <CloseIcon className={styles.closeIcon} onClick={hideMenu} />
        ) : (
          <MenuIcon className={styles.menuIcon} onClick={showMenu} />
        )}
        {displayMenu && <a href="#">Home</a>}
      </div>
      <div className={styles.navbarRight}>
        <Link href="/get-help" className={`btn-a outline-btn ${styles.btnA} ${styles.outlineBtn} `}>
          Get Help
        </Link>
      </div>
    </div>
  );
}
