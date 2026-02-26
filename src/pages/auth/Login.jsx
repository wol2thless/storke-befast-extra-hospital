import { FaBrain, FaBook, FaQuestionCircle } from "react-icons/fa";
import { MdLogin } from "react-icons/md";

const Login = () => {
  const response_type = "code";

  const handleLoginThaiD = () => {
    const client_id = "aWhCVlhzWVd2RkFqUnFxWDVOd2NFR3RDZnI3MFFSQmE";
    const redirect_uri = window.location.origin + "/stroke-befast/core";
    const scope =
      "openid pid address gender birthdate given_name middle_name family_name name given_name_en middle_name_en family_name_en name_en title title_en ial smartcard_code date_of_expiry date_of_issuance";
    const state = "ThaiD";
    const ThaiD_URL = "https://imauth.bora.dopa.go.th/api/v2/oauth2/auth/?";
    const url = `${ThaiD_URL}&client_id=${client_id}&scope=${scope}&state=${state}&response_type=${response_type}&redirect_uri=${encodeURIComponent(
      redirect_uri
    )}`;
    window.location.href = url;
  };
  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-xs bg-base-100 rounded-xl shadow-lg p-6 flex flex-col items-center">
        <span className="w-16 h-16 mb-4 flex items-center justify-center bg-primary rounded-full shadow">
          <FaBrain className="w-10 h-10 text-white" />
        </span>
        <h1 className="text-xl font-bold mb-1 text-center">Stroke-BEFAST</h1>
        <h2 className="text-base font-medium mb-2 text-center text-base-content/80">
          ระบบจัดการข้อมูลโรคหลอดเลือดสมอง
        </h2>
        <p className="text-sm text-center mb-6 text-base-content/70">
          กรุณาเข้าสู่ระบบด้วย ThaiD เพื่อความปลอดภัยของข้อมูล
        </p>
        <button
          className="btn btn-primary w-full flex items-center justify-center gap-2 text-lg"
          onClick={handleLoginThaiD}
        >
          <MdLogin className="h-6 w-6" />
          เข้าสู่ระบบด้วย ThaiD
        </button>

        {/* Manual & Help Link */}
        <div className="mt-6 w-full">
          <a
            href="https://docs.google.com/document/d/1dkDCJHBWbSAF0BPPeE1MtXEyMeahFHte8Wa9p2bEDk4/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-info btn-sm w-full flex items-center justify-center gap-2"
          >
            <FaBook className="h-4 w-4" />
            คู่มือการใช้งานและปัญหาการใช้งาน
          </a>
        </div>
        <div className="mt-6 w-full">
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSdN2Gq3LXRngr4sL7yaM8JXKRx03-Sx5B4G5uwcq2QIjc35Fg/viewform?usp=dialog"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-success btn-sm w-full flex items-center justify-center gap-2"
          >
            <FaBook className="h-4 w-4" />
            แบบประเมินความรู้เบื้องต้น
          </a>
        </div>

        {/* Admin Login Link */}
        <div className="divider my-4">หรือ</div>
        <button
          className="btn btn-outline btn-warning btn-sm w-full"
          onClick={() => (window.location.href = "/stroke-befast/admin/login")}
        >
          เข้าสู่ระบบสำหรับเจ้าหน้าที่
        </button>
      </div>
    </div>
  );
};
export default Login;
