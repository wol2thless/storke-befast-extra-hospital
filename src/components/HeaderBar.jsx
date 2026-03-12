import { Link } from "react-router";

const HeaderBar = () => {
  return (
    <div className="navbar bg-primary text-primary-content shadow-sm sticky top-0 z-40">
      <div className="flex-1">
        <span className="text-lg font-bold">ระบบติดตามสุขภาพโรคหลอดเลือดสมอง</span>
      </div>
      <div className="flex-none">
        <div className="dropdown dropdown-end">
          <button tabIndex={0} className="btn btn-ghost btn-circle" aria-label="menu">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-5 w-5 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 text-base-content rounded-box shadow-sm w-40 mt-2 p-2 z-50">
            <li>
              <Link to="/logout" className="text-error">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-4 w-4 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                </svg>
                ออกจากระบบ
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HeaderBar;
