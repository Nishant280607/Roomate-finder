import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./Bits";

/** Who is signed in, from the profile if it has loaded, otherwise from the sign-in account. */
function describe(user, me) {
  const meta = user?.user_metadata || {};
  const demo = user?.app_metadata?.provider === "demo";
  return {
    id: user?.id,
    demo,
    full_name: me?.full_name || meta.full_name || meta.name || (demo ? "Guest" : (user?.email || "").split("@")[0]),
    avatar_url: me?.avatar_url || meta.avatar_url || meta.picture || null,
    email: demo ? "Demo account" : user?.email,
  };
}

/** Small "signed in as" button for the top of the page, with a menu to sign out. */
export default function AccountChip({ me, showProfile = false, compact = false }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const outside = (e) => {
      if (!box.current?.contains(e.target)) setOpen(false);
    };
    const escape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  if (!user) return null;
  const account = describe(user, me);

  return (
    <div className="account" ref={box}>
      <button
        type="button"
        className={`account-chip ${compact ? "is-compact" : ""}`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Signed in as ${account.full_name}`}
        title={`Signed in as ${account.email}`}
        onClick={() => setOpen((v) => !v)}
      >
        <Avatar person={account} size={28} />
        {!compact && <span className="account-name">{account.full_name}</span>}
      </button>
      {open && (
        <div className="account-menu" role="menu">
          <p className="account-who">
            <span className="account-label">Signed in as</span>
            <strong>{account.full_name}</strong>
            <span>{account.email}</span>
          </p>
          {showProfile && (
            <Link to="/profile" role="menuitem" className="account-item" onClick={() => setOpen(false)}>
              <User size={16} aria-hidden /> Your profile
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            className="account-item"
            onClick={async () => {
              setOpen(false);
              await signOut();
              navigate("/", { replace: true });
            }}
          >
            <LogOut size={16} aria-hidden /> {account.demo ? "Leave demo" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
