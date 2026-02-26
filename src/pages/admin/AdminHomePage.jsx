import { useState, useEffect } from "react";
import { FaUserMd, FaSearch, FaChartBar } from "react-icons/fa";
import axios from "axios";
import { maskNationalId } from '../../utils/pdpaUtils';

const AdminHomePage = () => {
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/patients"); // แก้ไข URL ให้ตรงกับ API จริง
        setPatients(response.data);
      } catch {
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filtered = patients.filter(
    (p) => p.name.includes(search) || p.cid.includes(search)
  );

  return (
    <div className="max-w-2xl mx-auto py-6 px-2">
      <div className="flex items-center gap-2 mb-4">
        <FaUserMd className="text-2xl text-primary" />
        <h1 className="text-2xl font-bold">แดชบอร์ดผู้ดูแล/แพทย์</h1>
      </div>
      <div className="card bg-base-100 shadow mb-4 p-4">
        <div className="flex items-center gap-2 mb-2">
          <FaSearch className="text-lg" />
          <input
            className="input input-bordered input-sm w-full max-w-xs"
            placeholder="ค้นหาชื่อหรือเลขบัตรประชาชน"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center text-info py-4">กำลังโหลดข้อมูล...</div>
          ) : error ? (
            <div className="text-center text-error py-4">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-base-content/60 py-4">
              ไม่พบข้อมูล
            </div>
          ) : (
            <table className="table table-zebra table-sm">
              <thead>
                <tr>
                  <th>ชื่อ-นามสกุล</th>
                  <th>เลขบัตร</th>
                  <th>คะแนนล่าสุด</th>
                  <th>ดูคลิป</th>
                  <th>ออกกำลังกาย</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td className="font-mono text-xs">{maskNationalId(p.cid)}</td>
                    <td>{p.lastScore}</td>
                    <td>{p.videoCount}</td>
                    <td>{p.exercise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <div className="card bg-base-100 shadow p-4 flex flex-col items-center">
        <FaChartBar className="text-3xl text-primary mb-2" />
        <div className="text-lg font-semibold mb-1">สถิติภาพรวม</div>
        <div className="flex gap-6">
          <div className="stat">
            <div className="stat-title">จำนวนผู้ป่วย</div>
            <div className="stat-value text-primary">{patients.length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">คะแนนเฉลี่ย</div>
            <div className="stat-value">
              {patients.length > 0
                ? (
                    patients.reduce((a, b) => a + b.lastScore, 0) /
                    patients.length
                  ).toFixed(1)
                : 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;
