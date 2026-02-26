import { useState } from "react";
import { Link } from "react-router";

const HeaderBar = () => {
  const [open, setOpen] = useState(false);
  return (
    <header className="w-full bg-primary text-primary-content shadow-md py-3 px-4 flex items-center justify-between sticky top-0 z-40">
      <div className="font-bold text-lg tracking-wide">ระบบติดตามสุขภาพโรคหลอดเลือดสมอง</div>
      <div className="relative">
        <button
          className="btn btn-ghost btn-circle"
          aria-label="menu"
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            width="28"
            height="28"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-40 bg-base-100 text-base-content rounded shadow-lg z-50 animate-fade-in">
            <ul className="menu menu-compact">
              <li>
                <Link
                  to="/logout"
                  onClick={() => setOpen(false)}
                  className="text-error"
                >
                  <span className="inline-flex items-center">
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="mr-2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                      />
                    </svg>
                    ออกจากระบบ
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderBar;
