import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  FaUsers,
  FaEdit,
  FaTrash,
  FaUserPlus,
  FaUndo,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
} from "react-icons/fa";
import { useAdminStore } from "@store/adminStore";

const AdminUserManagement = () => {
  const navigate = useNavigate();
  const {
    adminUser,
    getAllUsers,
    updateUser,
    deleteUser,
    restoreUser,
    loading,
  } = useAdminStore();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filterStatus, setFilterStatus] = useState("active"); // 'active', 'inactive', 'all'
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    password: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Check if current user is admin
  if (adminUser?.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <span>คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (เฉพาะ Admin เท่านั้น)</span>
        </div>
        <button
          className="btn btn-outline mt-4"
          onClick={() => navigate("/admin")}
        >
          <FaArrowLeft /> กลับหน้าแรก
        </button>
      </div>
    );
  }

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterUsersByStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, filterStatus]);

  const fetchUsers = async () => {
    const result = await getAllUsers();
    if (result.success) {
      setUsers(result.data);
    }
  };

  const filterUsersByStatus = () => {
    let filtered = users;
    if (filterStatus === "active") {
      filtered = users.filter((u) => u.is_active == 1);
    } else if (filterStatus === "inactive") {
      filtered = users.filter((u) => u.is_active == 0);
    }
    setFilteredUsers(filtered);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      role: user.role,
      password: "",
    });
    setSuccessMessage("");
    setErrorMessage("");
    document.getElementById("edit_modal").showModal();
  };

  const handleUpdate = async () => {
    if (!formData.name || !formData.role) {
      setErrorMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const updateData = {
      name: formData.name,
      role: formData.role,
    };

    if (formData.password) {
      if (formData.password.length < 6) {
        setErrorMessage("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
        return;
      }
      updateData.password = formData.password;
    }

    const result = await updateUser(editingUser.id, updateData);

    if (result.success) {
      setSuccessMessage(result.message || "อัปเดตข้อมูลสำเร็จ");
      setErrorMessage("");
      fetchUsers();
      setTimeout(() => {
        document.getElementById("edit_modal").close();
        setEditingUser(null);
      }, 1500);
    } else {
      setErrorMessage(result.error || "เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`คุณต้องการปิดการใช้งานบัญชี "${user.name}" ใช่หรือไม่?`)) {
      return;
    }

    const result = await deleteUser(user.id);

    if (result.success) {
      setSuccessMessage(result.message);
      fetchUsers();
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      setErrorMessage(result.error || "เกิดข้อผิดพลาด");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleRestore = async (user) => {
    if (!confirm(`คุณต้องการกู้คืนบัญชี "${user.name}" ใช่หรือไม่?`)) {
      return;
    }

    const result = await restoreUser(user.id);

    if (result.success) {
      setSuccessMessage(result.message);
      fetchUsers();
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      setErrorMessage(result.error || "เกิดข้อผิดพลาด");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { color: "badge-error", label: "Admin" },
      supervisor: { color: "badge-warning", label: "Supervisor" },
      staff: { color: "badge-info", label: "Staff" },
    };
    const config = roleConfig[role] || roleConfig.staff;
    return <span className={`badge ${config.color}`}>{config.label}</span>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center bg-primary rounded-full">
            <FaUsers className="w-6 h-6 text-primary-content" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">จัดการผู้ใช้งาน</h1>
            <p className="text-sm text-base-content/70">
              แก้ไขและจัดการบัญชีผู้ใช้งานในระบบ
            </p>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/admin/create-user")}
        >
          <FaUserPlus /> สร้างผู้ใช้งานใหม่
        </button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="alert alert-success mb-4">
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="alert alert-error mb-4">
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="tabs tabs-boxed mb-6">
        <button
          className={`tab ${filterStatus === "active" ? "tab-active" : ""}`}
          onClick={() => setFilterStatus("active")}
        >
          ใช้งานอยู่ ({users.filter((u) => u.is_active == 1).length})
        </button>
        <button
          className={`tab ${filterStatus === "inactive" ? "tab-active" : ""}`}
          onClick={() => setFilterStatus("inactive")}
        >
          ปิดการใช้งาน ({users.filter((u) => u.is_active == 0).length})
        </button>
        <button
          className={`tab ${filterStatus === "all" ? "tab-active" : ""}`}
          onClick={() => setFilterStatus("all")}
        >
          ทั้งหมด ({users.length})
        </button>
      </div>

      {/* Users Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-0">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center p-12">
              <p className="text-base-content/60">ไม่พบข้อมูลผู้ใช้งาน</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>เลขบัตรประจำตัวประชาชน</th>
                    <th>ชื่อ-นามสกุล</th>
                    <th>สิทธิ์</th>
                    <th>สถานะ</th>
                    <th>วันที่สร้าง</th>
                    <th>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className={user.is_active === 0 ? "opacity-50" : ""}
                    >
                      <td>
                        <span className="font-medium">{user.provider_id}</span>
                        {user.id === adminUser.id && (
                          <span className="badge badge-sm badge-outline ml-2">
                            คุณ
                          </span>
                        )}
                      </td>
                      <td>{user.name}</td>
                      <td>{getRoleBadge(user.role)}</td>
                      <td>
                        {user.is_active == 1 ? (
                          <span className="badge badge-success">
                            ใช้งานอยู่
                          </span>
                        ) : (
                          <span className="badge badge-ghost">
                            ปิดการใช้งาน
                          </span>
                        )}
                      </td>
                      <td>
                        {new Date(user.created_at).toLocaleDateString("th-TH")}
                      </td>
                      <td>
                        {user.id === adminUser.id ? (
                          <span className="text-sm text-base-content/50">
                            -
                          </span>
                        ) : (
                          <div className="flex gap-2">
                            {user.is_active == 1 ? (
                              <>
                                <button
                                  className="btn btn-sm btn-ghost"
                                  onClick={() => handleEdit(user)}
                                  title="แก้ไข"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  className="btn btn-sm btn-ghost text-error"
                                  onClick={() => handleDelete(user)}
                                  title="ปิดการใช้งาน"
                                >
                                  <FaTrash />
                                </button>
                              </>
                            ) : (
                              <button
                                className="btn btn-sm btn-ghost text-success"
                                onClick={() => handleRestore(user)}
                                title="กู้คืน"
                              >
                                <FaUndo />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <dialog id="edit_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">แก้ไขข้อมูลผู้ใช้งาน</h3>

          {errorMessage && (
            <div className="alert alert-error mb-4">
              <span className="text-sm">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success mb-4">
              <span className="text-sm">{successMessage}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Provider ID (Read-only) */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">เลขบัตรประจำตัวประชาชน</span>
              </label>
              <input
                type="text"
                value={editingUser?.provider_id || ""}
                className="input input-bordered"
                disabled
              />
            </div>

            {/* Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">ชื่อ-นามสกุล</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="input input-bordered"
                placeholder="กรอกชื่อ-นามสกุล"
              />
            </div>

            {/* Role */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">สิทธิ์การใช้งาน</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="select select-bordered"
              >
                <option value="staff">Staff</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  รหัสผ่านใหม่ (ถ้าต้องการเปลี่ยน)
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="input input-bordered w-full pr-12"
                  placeholder="ปล่อยว่างถ้าไม่ต้องการเปลี่ยน"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <label className="label">
                <span className="label-text-alt">ขั้นต่ำ 6 ตัวอักษร</span>
              </label>
            </div>
          </div>

          <div className="modal-action">
            <button
              className="btn btn-primary"
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "บันทึก"
              )}
            </button>
            <form method="dialog">
              <button className="btn">ยกเลิก</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default AdminUserManagement;
