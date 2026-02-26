import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  FaUsers,
  FaUserPlus,
  FaHeartbeat,
  FaDumbbell,
  FaPills,
  FaClipboardCheck,
  FaSmile,
  FaChartBar,
  FaCalendarAlt,
  FaStethoscope,
  FaUserMd,
  FaPlay,
  FaComments,
  FaUtensils,
} from "react-icons/fa";
import { useAdminStore } from "@store/adminStore";

const AdminOverview = () => {
  const { dashboardStats, getDashboardStats, loading, error, adminUser } =
    useAdminStore();

  // State สำหรับเลือกเดือน
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  useEffect(() => {
    getDashboardStats(selectedMonth);
  }, [getDashboardStats, selectedMonth]);

  // ฟังก์ชันสำหรับเปลี่ยนเดือน
  const handleMonthChange = (event) => {
    const newMonth = event.target.value;
    setSelectedMonth(newMonth);
  };

  // ฟังก์ชันจัดรูปแบบตัวเลข
  const formatNumber = (num) => {
    return new Intl.NumberFormat("th-TH").format(num || 0);
  };

  // ฟังก์ชันจัดรูปแบบวันที่
  const formatDate = (dateString) => {
    if (!dateString) return "";

    // ตรวจสอบว่าเป็นรูปแบบ YYYY-MM หรือไม่
    if (dateString.includes("-") && dateString.length <= 7) {
      const [year, month] = dateString.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
      });
    }

    return new Date(dateString).toLocaleDateString("th-TH", {
      month: "short",
      day: "numeric",
    });
  };

  // ฟังก์ชันแปลงเดือนเป็นข้อความไทย
  const getMonthText = (monthString) => {
    return new Date(monthString + "-01").toLocaleDateString("th-TH", {
      month: "long",
      year: "numeric",
    });
  };

  // ฟังก์ชันแปลงชื่อ BEFAST symptoms
  const getBEFASTDisplayName = (symptom) => {
    const befastMap = {
      NONE: "ไม่มีอาการ (ไม่มีความเสี่ยง)",
      B: "B - ใบหน้าเบี้ยว (ความเสี่ยงสูง)",
      E: "E - แขนขาอ่อนแรง (ความเสี่ยงสูง)",
      F: "F - พูดไม่ชัด (ความเสี่ยงสูง)",
      A: "A - มึนงง/สับสน (ความเสี่ยงสูง)",
      S: "S - ปวดหัวรุนแรง (ความเสี่ยงสูง)",
      T: "T - เวลา (ความเสี่ยงสูง)",
      "B,E,A": "หลายอาการ B,E,A (ความเสี่ยงสูงมาก)",
      "S,A,F,B,T": "หลายอาการ S,A,F,B,T (ความเสี่ยงสูงมาก)",
    };

    return befastMap[symptom] || `${symptom} (ความเสี่ยงสูง)`;
  };

  // สร้างกราฟแบบง่ายๆ ด้วย div
  const SimpleChart = ({ data, title, color = "bg-primary" }) => {
    if (!data || data.length === 0) {
      return (
        <div>
          <h4 className="font-medium text-sm mb-3 text-base-content">
            {title}
          </h4>
          <div className="text-center py-4 text-base-content/60 text-sm">
            ไม่มีข้อมูลในช่วงเวลานี้
          </div>
        </div>
      );
    }

    const maxValue = Math.max(...data.map((item) => parseInt(item.count || 0)));

    return (
      <div>
        <h4 className="font-medium text-sm mb-3 text-base-content">{title}</h4>
        <div className="space-y-2">
          {data.slice(0, 7).map((item, index) => {
            const count = parseInt(item.count || 0);
            const percentage = maxValue > 0 ? (count / maxValue) * 100 : 0;
            return (
              <div key={index} className="flex items-center text-sm">
                <div className="w-16 text-xs text-base-content/60">
                  {formatDate(item.date)}
                </div>
                <div className="flex-1 mx-2">
                  <div className="bg-base-200 rounded-full h-2">
                    <div
                      className={`${color} rounded-full h-2 transition-all duration-300`}
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-8 text-xs font-medium text-base-content">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // กราฟแบบ Donut Chart
  // Component สำหรับกราฟเปรียบเทียบ 12 เดือน
  const ComparisonChart = ({ data, title }) => {
    // แปลงข้อมูลจากแต่ละหมวดหมู่เป็น format ที่ใช้แสดงผล
    const categories = [
      { key: "befast_assessments", name: "BEFAST", color: "bg-error" },
      { key: "adl_assessments", name: "ADL", color: "bg-info" },
      { key: "exercise_records", name: "ออกกำลังกาย", color: "bg-success" },
      { key: "medication_records", name: "รับประทานยา", color: "bg-warning" },
      { key: "nutrition_records", name: "โภชนาการ", color: "bg-orange-500" },
      {
        key: "health_behavior",
        name: "พฤติกรรมสุขภาพ",
        color: "bg-purple-500",
      },
      { key: "satisfaction_survey", name: "ความพึงพอใจ", color: "bg-accent" },
      { key: "video_views", name: "ดูวิดีโอ", color: "bg-secondary" },
    ];

    // หาเดือนทั้งหมดจากข้อมูล
    const allMonths = new Set();
    categories.forEach((cat) => {
      if (data[cat.key] && Array.isArray(data[cat.key])) {
        data[cat.key].forEach((item) => {
          allMonths.add(
            `${item.year}-${item.month.toString().padStart(2, "0")}`
          );
        });
      }
    });

    const sortedMonths = Array.from(allMonths).sort().reverse().slice(0, 12);

    const getMonthName = (yearMonth) => {
      const [year, month] = yearMonth.split("-");
      const monthNames = [
        "มค",
        "กพ",
        "มีค",
        "เมย",
        "พค",
        "มิย",
        "กค",
        "สค",
        "กย",
        "ตค",
        "พย",
        "ธค",
      ];
      return monthNames[parseInt(month) - 1] + " " + year;
    };

    return (
      <div className="space-y-4">
        <h4 className="font-medium text-sm mb-3 text-base-content">{title}</h4>

        {sortedMonths.length > 0 ? (
          <div className="space-y-3">
            {sortedMonths.map((monthKey) => {
              const monthName = getMonthName(monthKey);
              const [year, month] = monthKey.split("-");

              return (
                <div key={monthKey} className="border-b border-base-200 pb-2">
                  <div className="text-xs font-medium mb-2 text-base-content/70">
                    {monthName}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    {categories.map((cat) => {
                      const count =
                        data[cat.key]?.find(
                          (item) =>
                            item.year == year && item.month == parseInt(month)
                        )?.count || 0;

                      return (
                        <div key={cat.key} className="text-center">
                          <div
                            className={`w-full h-6 ${cat.color} rounded text-white flex items-center justify-center text-xs font-bold`}
                          >
                            {count}
                          </div>
                          <div className="text-xs text-base-content/60 mt-1 truncate">
                            {cat.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <span className="text-xs text-base-content/60">
              ไม่มีข้อมูลในระบบ
            </span>
          </div>
        )}
      </div>
    );
  };

  const DonutChart = ({ data, title, type = "default" }) => {
    if (!data || data.length === 0) {
      return (
        <div>
          <h4 className="font-medium text-sm mb-3 text-base-content">
            {title}
          </h4>
          <div className="flex flex-col items-center py-6">
            <div className="w-32 h-32 bg-base-200 rounded-full flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="text-2xl text-base-content/30">📊</div>
                <div className="text-xs text-base-content/60 mt-1">
                  ไม่มีข้อมูล
                </div>
              </div>
            </div>
            <div className="text-center text-sm text-base-content/60">
              ยังไม่มีข้อมูล{title.includes("เพศ") ? "เพศ" : "อายุ"}ในระบบ
            </div>
          </div>
        </div>
      );
    }

    const total = data.reduce(
      (sum, item) => sum + parseInt(item.count || 0),
      0
    );

    // กำหนดสีตาม type - ใช้ HEX colors สำหรับ SVG
    const getColors = (type, data) => {
      if (type === "severity") {
        return ["#22c55e", "#3b82f6", "#eab308", "#6b7280", "#ef4444"];
      }
      // สำหรับกราฟเพศ - ใช้สีที่ชัดเจน
      if (type === "gender" || title.includes("เพศ")) {
        return data.map((item) => {
          const gender = item.gender || item.severity_level || "";
          if (gender === "ชาย" || gender === "M") {
            return "#2563eb"; // สีน้ำเงินเข้มสำหรับชาย
          } else if (gender === "หญิง" || gender === "F") {
            return "#ec4899"; // สีชมพูสดสำหรับหญิง
          }
          return "#9ca3af";
        });
      }
      return ["#6366f1", "#8b5cf6", "#f59e0b", "#3b82f6", "#22c55e", "#eab308"];
    };

    // กำหนด Tailwind class สำหรับ legend
    const getTailwindColors = (type, data) => {
      if (type === "severity") {
        return [
          "bg-green-500",
          "bg-blue-500",
          "bg-yellow-500",
          "bg-gray-500",
          "bg-red-500",
        ];
      }
      if (type === "gender" || title.includes("เพศ")) {
        return data.map((item) => {
          const gender = item.gender || item.severity_level || "";
          if (gender === "ชาย" || gender === "M") {
            return "bg-blue-600";
          } else if (gender === "หญิง" || gender === "F") {
            return "bg-pink-500";
          }
          return "bg-gray-400";
        });
      }
      return [
        "bg-indigo-500",
        "bg-purple-500",
        "bg-amber-500",
        "bg-blue-500",
        "bg-green-500",
        "bg-yellow-500",
      ];
    };

    const colors = getColors(type, data);
    const tailwindColors = getTailwindColors(type, data);

    // คำนวณ SVG paths สำหรับ donut chart
    const radius = 50;
    const strokeWidth = 12;
    const center = 60;
    const circumference = 2 * Math.PI * radius;

    let accumulatedOffset = 0;

    return (
      <div>
        <h4 className="font-medium text-sm mb-3 text-base-content">{title}</h4>

        {/* Visual Donut with SVG */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <svg width="120" height="120" viewBox="0 0 120 120">
              {/* Background circle */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth={strokeWidth}
              />
              {/* Data segments */}
              {data.slice(0, 6).map((item, index) => {
                const count = parseInt(item.count || 0);
                const percentage = total > 0 ? count / total : 0;
                const segmentLength = circumference * percentage;
                const currentOffset = accumulatedOffset;
                accumulatedOffset += segmentLength;

                return (
                  <circle
                    key={index}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={colors[index % colors.length]}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${segmentLength} ${
                      circumference - segmentLength
                    }`}
                    strokeDashoffset={-currentOffset}
                    transform={`rotate(-90 ${center} ${center})`}
                    style={{ transition: "stroke-dasharray 0.5s ease" }}
                  />
                );
              })}
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-base-content">
                  {total}
                </div>
                <div className="text-xs text-base-content/60">ทั้งหมด</div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2">
          {data.slice(0, 6).map((item, index) => {
            const count = parseInt(item.count || 0);
            const percentage =
              total > 0 ? ((count / total) * 100).toFixed(1) : 0;

            return (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      tailwindColors[index % tailwindColors.length]
                    } mr-2`}
                  ></div>
                  <span className="text-base-content/70 text-xs">
                    {type === "severity" && item.severity_level
                      ? getBEFASTDisplayName(item.severity_level)
                      : item.severity_level ||
                        item.age_group ||
                        item.gender ||
                        item.video_id}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-base-content">{count}</span>
                  <span className="text-xs text-base-content/60">
                    ({percentage}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // กราฎแท่งแนวนอน
  const HorizontalBarChart = ({ data, title }) => {
    if (!data || data.length === 0) {
      return (
        <div>
          <h4 className="font-medium text-sm mb-3 text-base-content">
            {title}
          </h4>
          <div className="text-center py-4 text-base-content/60 text-sm">
            ไม่มีข้อมูลในระบบ
          </div>
        </div>
      );
    }

    const maxValue = Math.max(...data.map((item) => parseInt(item.count || 0)));

    return (
      <div>
        <h4 className="font-medium text-sm mb-3 text-base-content">{title}</h4>
        <div className="space-y-2">
          {data.slice(0, 6).map((item, index) => {
            const count = parseInt(item.count || 0);
            const percentage = maxValue > 0 ? (count / maxValue) * 100 : 0;
            const colors = [
              "bg-primary",
              "bg-secondary",
              "bg-accent",
              "bg-info",
              "bg-success",
              "bg-warning",
            ];
            return (
              <div key={index} className="flex items-center text-sm">
                <div className="w-20 text-xs text-base-content/60 truncate">
                  {item.age_group || item.gender || item.video_id}
                </div>
                <div className="flex-1 mx-2">
                  <div className="bg-base-200 rounded-full h-2">
                    <div
                      className={`${
                        colors[index % colors.length]
                      } rounded-full h-2 transition-all duration-300`}
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-8 text-xs font-medium text-base-content">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Progress Bar Chart สำหรับสถิติทั่วไป
  const ProgressChart = ({ data, title, colorScheme = "default" }) => {
    if (!data || data.length === 0) {
      return (
        <div>
          <h4 className="font-medium text-sm mb-3 text-base-content">
            {title}
          </h4>
          <div className="text-center py-4 text-base-content/60 text-sm">
            ไม่มีข้อมูลในช่วงเวลานี้
          </div>
        </div>
      );
    }

    const maxValue = Math.max(
      ...data.map((item) => parseInt(item.count || item.value || 0)),
      1
    );

    const getColorScheme = (scheme) => {
      switch (scheme) {
        case "health":
          return [
            "bg-success",
            "bg-info",
            "bg-primary",
            "bg-accent",
            "bg-warning",
          ];
        case "activity":
          return [
            "bg-primary",
            "bg-secondary",
            "bg-accent",
            "bg-info",
            "bg-success",
          ];
        case "severity":
          return [
            "bg-success",
            "bg-info",
            "bg-warning",
            "bg-secondary",
            "bg-error",
          ];
        default:
          return [
            "bg-primary",
            "bg-success",
            "bg-warning",
            "bg-info",
            "bg-error",
          ];
      }
    };

    const colors = getColorScheme(colorScheme);

    return (
      <div>
        <h4 className="font-medium text-sm mb-3 text-base-content">{title}</h4>
        <div className="space-y-3">
          {data.slice(0, 8).map((item, index) => {
            const count = parseInt(item.count || item.value || 0);
            const percentage = maxValue > 0 ? (count / maxValue) * 100 : 0;

            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-base-content/70 truncate max-w-[150px]">
                    {item.label ||
                      item.name ||
                      item.activity_name ||
                      `รายการ ${index + 1}`}
                  </span>
                  <span className="font-medium text-base-content">
                    {formatNumber(count)}
                  </span>
                </div>
                <div className="w-full bg-base-200 rounded-full h-2">
                  <div
                    className={`${
                      colors[index % colors.length]
                    } rounded-full h-2 transition-all duration-700 ease-out`}
                    style={{
                      width: `${Math.max(percentage, count > 0 ? 3 : 0)}%`,
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading && !dashboardStats) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-base-content mb-2">
          ภาพรวมระบบ
        </h1>
        <p className="text-base-content/70 text-sm mb-3">
          สถิติและข้อมูลภาพรวมของระบบ
        </p>
        {adminUser && (
          <p className="text-xs text-base-content/60 mb-4">
            {adminUser.name} ({adminUser.role})
          </p>
        )}
      </div>

      {/* Month Selector */}
      <div className="mb-6">
        <div className="bg-base-100 rounded-lg shadow p-4 border border-base-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaCalendarAlt className="text-primary" />
              <span className="font-medium text-base-content">
                เลือกเดือนที่ต้องการดู
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <label className="text-sm text-base-content/70">เดือน:</label>
              <select
                className="select select-bordered select-sm w-32"
                value={selectedMonth}
                onChange={handleMonthChange}
              >
                {/* สร้าง option สำหรับ 12 เดือนล่าสุด */}
                {Array.from({ length: 12 }, (_, i) => {
                  const date = new Date();
                  date.setMonth(date.getMonth() - i);
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const monthValue = `${year}-${month}`;
                  const monthName = date.toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                  });
                  return (
                    <option key={monthValue} value={monthValue}>
                      {monthName}
                    </option>
                  );
                })}
              </select>
              {dashboardStats?.selected_month && (
                <span className="text-xs text-success bg-success/10 px-2 py-1 rounded">
                  แสดง:{" "}
                  {new Date(
                    dashboardStats.selected_month + "-01"
                  ).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {dashboardStats && (
        <>
          {/* สถิติหลัก */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-primary rounded-lg p-4 text-primary-content">
              <div className="flex items-center">
                <FaUsers className="w-6 h-6 mb-2" />
              </div>
              <div className="text-2xl font-bold">
                {formatNumber(dashboardStats.total_patients)}
              </div>
              <div className="text-sm opacity-90">ผู้ป่วยทั้งหมด</div>
            </div>

            <div className="bg-success rounded-lg p-4 text-success-content">
              <div className="flex items-center">
                <FaUserPlus className="w-6 h-6 mb-2" />
              </div>
              <div className="text-2xl font-bold">
                {formatNumber(dashboardStats.new_patients_this_month)}
              </div>
              <div className="text-sm opacity-90">
                ผู้ป่วยใหม่เดือน
                {new Date(selectedMonth + "-01").toLocaleDateString("th-TH", {
                  month: "long",
                  year: "2-digit",
                })}
              </div>
            </div>

            <div className="bg-info rounded-lg p-4 text-info-content">
              <div className="flex items-center">
                <FaClipboardCheck className="w-6 h-6 mb-2" />
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-center">
                  <div className="text-xl font-bold">
                    {formatNumber(dashboardStats.befast_assessments_month)}
                  </div>
                  <div className="text-xs opacity-75">ครั้ง</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">
                    {formatNumber(
                      (
                        dashboardStats.befast_severity_distribution || []
                      ).reduce(
                        (sum, item) => sum + parseInt(item.unique_people || 0),
                        0
                      )
                    )}
                  </div>
                  <div className="text-xs opacity-75">คน</div>
                </div>
              </div>
              <div className="text-sm opacity-90 mt-1">
                BEFAST เดือน
                {new Date(selectedMonth + "-01").toLocaleDateString("th-TH", {
                  month: "long",
                  year: "2-digit",
                })}
              </div>
            </div>

            <div className="bg-warning rounded-lg p-4 text-warning-content">
              <div className="flex items-center">
                <FaSmile className="w-6 h-6 mb-2" />
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-center">
                  <div className="text-xl font-bold">
                    {formatNumber(
                      dashboardStats.satisfaction_month?.records || 0
                    )}
                  </div>
                  <div className="text-xs opacity-75">ครั้ง</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">
                    {formatNumber(
                      dashboardStats.satisfaction_month?.people || 0
                    )}
                  </div>
                  <div className="text-xs opacity-75">คน</div>
                </div>
              </div>
              <div className="text-sm opacity-90 mt-1">
                แบบสอบถามเดือน
                {new Date(selectedMonth + "-01").toLocaleDateString("th-TH", {
                  month: "long",
                  year: "2-digit",
                })}
              </div>
            </div>
          </div>

          {/* สรุปสถิติรายกิจกรรม - แสดงทั้งครั้งและคน */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="bg-base-100 rounded-lg shadow p-4 border border-base-300">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-sm text-base-content">
                  สรุปกิจกรรมหลัก ({getMonthText(selectedMonth)})
                </h4>
                <div className="text-xs text-base-content/60 bg-base-200 px-2 py-1 rounded">
                  ครั้ง | คน
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* การออกกำลังกาย */}
                <div className="text-center p-3 bg-success/10 rounded-lg">
                  <FaDumbbell className="w-5 h-5 mx-auto mb-2 text-success" />
                  <div className="flex items-center justify-center space-x-2">
                    <div className="text-center">
                      <div className="font-bold text-success">
                        {formatNumber(
                          dashboardStats.exercise_month?.records || 0
                        )}
                      </div>
                      <div className="text-xs text-base-content/60">ครั้ง</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-success">
                        {formatNumber(
                          dashboardStats.exercise_month?.people || 0
                        )}
                      </div>
                      <div className="text-xs text-base-content/60">คน</div>
                    </div>
                  </div>
                  <div className="text-xs text-base-content/70 mt-1">
                    ออกกำลังกาย
                  </div>
                </div>

                {/* การรับประทานยา */}
                <div className="text-center p-3 bg-warning/10 rounded-lg">
                  <FaPills className="w-5 h-5 mx-auto mb-2 text-warning" />
                  <div className="flex items-center justify-center space-x-2">
                    <div className="text-center">
                      <div className="font-bold text-warning">
                        {formatNumber(
                          dashboardStats.medication_month?.records || 0
                        )}
                      </div>
                      <div className="text-xs text-base-content/60">ครั้ง</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-warning">
                        {formatNumber(
                          dashboardStats.medication_month?.people || 0
                        )}
                      </div>
                      <div className="text-xs text-base-content/60">คน</div>
                    </div>
                  </div>
                  <div className="text-xs text-base-content/70 mt-1">
                    รับประทานยา
                  </div>
                </div>

                {/* โภชนาการ */}
                <div className="text-center p-3 bg-orange-100 rounded-lg">
                  <FaUtensils className="w-5 h-5 mx-auto mb-2 text-orange-500" />
                  <div className="flex items-center justify-center space-x-2">
                    <div className="text-center">
                      <div className="font-bold text-orange-500">
                        {formatNumber(
                          dashboardStats.nutrition_month?.records || 0
                        )}
                      </div>
                      <div className="text-xs text-base-content/60">ครั้ง</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-orange-500">
                        {formatNumber(
                          dashboardStats.nutrition_month?.people || 0
                        )}
                      </div>
                      <div className="text-xs text-base-content/60">คน</div>
                    </div>
                  </div>
                  <div className="text-xs text-base-content/70 mt-1">
                    โภชนาการ
                  </div>
                </div>

                {/* การดูวิดีโอ */}
                <div className="text-center p-3 bg-secondary/10 rounded-lg">
                  <FaPlay className="w-5 h-5 mx-auto mb-2 text-secondary" />
                  <div className="flex items-center justify-center space-x-2">
                    <div className="text-center">
                      <div className="font-bold text-secondary">
                        {formatNumber(dashboardStats.video_month?.records || 0)}
                      </div>
                      <div className="text-xs text-base-content/60">ครั้ง</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-secondary">
                        {formatNumber(dashboardStats.video_month?.people || 0)}
                      </div>
                      <div className="text-xs text-base-content/60">คน</div>
                    </div>
                  </div>
                  <div className="text-xs text-base-content/70 mt-1">
                    ดูวิดีโอ
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* สถิติประชากรและข้อมูลอื่นๆ */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="bg-base-100 rounded-lg shadow p-4 border border-base-300">
              <DonutChart
                data={
                  dashboardStats.gender_distribution?.length > 0
                    ? dashboardStats.gender_distribution?.map((item) => ({
                        ...item,
                        gender:
                          item.gender === "M" || item.gender === "ชาย"
                            ? "ชาย"
                            : "หญิง",
                      }))
                    : []
                }
                title="การกระจายเพศ"
                type="gender"
              />
            </div>

            <div className="bg-base-100 rounded-lg shadow p-4 border border-base-300">
              <DonutChart
                data={dashboardStats.age_distribution || []}
                title="การกระจายช่วงอายุ"
              />
            </div>

            <div className="bg-base-100 rounded-lg shadow p-4 border border-base-300">
              <HorizontalBarChart
                data={
                  dashboardStats.popular_videos?.map((item) => ({
                    ...item,
                    video_id: `วิดีโอ ${item.video_id}`,
                  })) || []
                }
                title={`วิดีโอยอดนิยม (${getMonthText(selectedMonth)})`}
              />
            </div>
          </div>

          {/* สถิติ BEFAST */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="bg-base-100 rounded-lg shadow p-4 border border-base-300">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-sm text-base-content">
                  สถิติ BEFAST ({getMonthText(selectedMonth)})
                </h4>
                <div className="text-xs text-base-content/60 bg-base-200 px-2 py-1 rounded">
                  แสดงทั้ง "ครั้ง" และ "คน"
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-error/10 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-error rounded-full mr-3"></div>
                    <div>
                      <span className="text-sm font-medium text-base-content">
                        การประเมินที่มีความเสี่ยงสูง
                      </span>
                      <div className="text-xs text-base-content/60">
                        ครั้งที่พบอาการ
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-3">
                      <div className="text-center">
                        <span className="font-bold text-error text-lg block">
                          {(dashboardStats.befast_severity_distribution || [])
                            .filter(
                              (item) =>
                                item.severity_level === "มีความเสี่ยงสูง"
                            )
                            .reduce(
                              (sum, item) => sum + parseInt(item.count || 0),
                              0
                            )}
                        </span>
                        <div className="text-xs text-base-content/60">
                          ครั้ง
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="font-bold text-error text-lg block">
                          {(dashboardStats.befast_severity_distribution || [])
                            .filter(
                              (item) =>
                                item.severity_level === "มีความเสี่ยงสูง"
                            )
                            .reduce(
                              (sum, item) =>
                                sum + parseInt(item.unique_people || 0),
                              0
                            )}
                        </span>
                        <div className="text-xs text-base-content/60">คน</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-success rounded-full mr-3"></div>
                    <div>
                      <span className="text-sm font-medium text-base-content">
                        การประเมินที่ไม่มีความเสี่ยง
                      </span>
                      <div className="text-xs text-base-content/60">
                        ครั้งที่ไม่พบอาการ
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-3">
                      <div className="text-center">
                        <span className="font-bold text-success text-lg block">
                          {(dashboardStats.befast_severity_distribution || [])
                            .filter(
                              (item) =>
                                item.severity_level === "ไม่มีความเสี่ยง"
                            )
                            .reduce(
                              (sum, item) => sum + parseInt(item.count || 0),
                              0
                            )}
                        </span>
                        <div className="text-xs text-base-content/60">
                          ครั้ง
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="font-bold text-success text-lg block">
                          {(dashboardStats.befast_severity_distribution || [])
                            .filter(
                              (item) =>
                                item.severity_level === "ไม่มีความเสี่ยง"
                            )
                            .reduce(
                              (sum, item) =>
                                sum + parseInt(item.unique_people || 0),
                              0
                            )}
                        </span>
                        <div className="text-xs text-base-content/60">คน</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-base-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-base-content/70">
                        รวมการประเมินทั้งหมด
                      </span>
                      <div className="text-xs text-base-content/60">
                        ครั้งที่ทำการประเมิน BEFAST
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-3">
                        <div className="text-center">
                          <span className="font-bold text-base-content text-lg block">
                            {(
                              dashboardStats.befast_severity_distribution || []
                            ).reduce(
                              (sum, item) => sum + parseInt(item.count || 0),
                              0
                            )}
                          </span>
                          <div className="text-xs text-base-content/60">
                            ครั้ง
                          </div>
                        </div>
                        <div className="text-center">
                          <span className="font-bold text-base-content text-lg block">
                            {(
                              dashboardStats.befast_severity_distribution || []
                            ).reduce(
                              (sum, item) =>
                                sum + parseInt(item.unique_people || 0),
                              0
                            )}
                          </span>
                          <div className="text-xs text-base-content/60">คน</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* กราฟเปรียบเทียบกิจกรรม 12 เดือนล่าสุด */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="bg-base-100 rounded-lg shadow p-4 border border-base-300">
              <ComparisonChart
                data={{
                  befast_assessments:
                    dashboardStats.monthly_comparison?.befast_assessments || [],
                  adl_assessments:
                    dashboardStats.monthly_comparison?.adl_assessments || [],
                  exercise_records:
                    dashboardStats.monthly_comparison?.exercise_records || [],
                  medication_records:
                    dashboardStats.monthly_comparison?.medication_records || [],
                  nutrition_records:
                    dashboardStats.monthly_comparison?.nutrition_records || [],
                  health_behavior:
                    dashboardStats.monthly_comparison?.health_behavior || [],
                  satisfaction_survey:
                    dashboardStats.monthly_comparison?.satisfaction_survey ||
                    [],
                  video_views:
                    dashboardStats.monthly_comparison?.video_views || [],
                }}
                title={`ข้อมูลที่ผู้ป่วยบันทึกทั้งหมด (12 เดือนล่าสุด) - เปรียบเทียบ`}
              />
            </div>
          </div>

          {/* กิจกรรมล่าสุด */}
          <div className="bg-base-100 rounded-lg shadow p-4 border border-base-300 mb-6">
            <h4 className="font-medium text-sm mb-3 text-base-content">
              กิจกรรมล่าสุดใน{getMonthText(selectedMonth)}
            </h4>
            <div className="space-y-2">
              {dashboardStats.recent_activities &&
              dashboardStats.recent_activities.length > 0 ? (
                dashboardStats.recent_activities
                  .slice(0, 5)
                  .map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center text-sm border-b border-base-200 pb-2"
                    >
                      <div className="flex items-center flex-1">
                        {activity.activity_type === "exercise" && (
                          <FaDumbbell className="w-4 h-4 mr-2 text-success" />
                        )}
                        {activity.activity_type === "medication" && (
                          <FaPills className="w-4 h-4 mr-2 text-warning" />
                        )}
                        {activity.activity_type === "befast" && (
                          <FaStethoscope className="w-4 h-4 mr-2 text-error" />
                        )}
                        {activity.activity_type === "adl" && (
                          <FaUserMd className="w-4 h-4 mr-2 text-info" />
                        )}
                        {activity.activity_type === "video" && (
                          <FaPlay className="w-4 h-4 mr-2 text-secondary" />
                        )}
                        {activity.activity_type === "survey" && (
                          <FaComments className="w-4 h-4 mr-2 text-accent" />
                        )}
                        {activity.activity_type === "nutrition" && (
                          <FaUtensils className="w-4 h-4 mr-2 text-orange-500" />
                        )}
                        <div>
                          <div className="font-medium">
                            {activity.activity_name}
                          </div>
                          <div className="text-xs text-base-content/60">
                            {formatDate(activity.activity_date)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-2">
                  <span className="text-xs text-base-content/60">
                    ยังไม่มีกิจกรรมในเดือนนี้
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ลิงก์ไปยังหน้าอื่นๆ */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/admin/dashboard"
              className="bg-base-100 rounded-lg shadow p-4 border border-base-300 text-center hover:bg-base-200 transition-colors"
            >
              <FaUsers className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-sm font-medium text-base-content">
                รายชื่อผู้ป่วย
              </div>
            </Link>

            <div className="bg-base-100 rounded-lg shadow p-4 border border-base-300 text-center opacity-60">
              <FaChartBar className="w-6 h-6 mx-auto mb-2 text-base-content/40" />
              <div className="text-sm font-medium text-base-content/60">
                รายงานเพิ่มเติม
              </div>
              <div className="text-xs text-base-content/40">เร็วๆ นี้</div>
            </div>
          </div>
          {/* ข้อความแนะนำเมื่อแสดงข้อมูลตัวอย่าง */}
          {dashboardStats &&
            (dashboardStats.total_patients === 0 ||
              !dashboardStats.health_records_month?.length ||
              !dashboardStats.gender_distribution?.length) && (
              <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="text-success">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-success mb-1">
                      แสดงตัวอย่างข้อมูล Dashboard
                    </h4>
                    <p className="text-xs text-success/80">
                      กราฟและข้อมูลที่คุณเห็นคือตัวอย่างการแสดงผลของ Dashboard{" "}
                      <br />
                      ข้อมูลจริงจะแสดงเมื่อผู้ป่วยเริ่มใช้งานระบบและบันทึกกิจกรรมต่างๆ{" "}
                      <br />
                      Dashboard จะแสดงข้อมูลย้อนหลัง 12
                      เดือนพร้อมเปรียบเทียบแต่ละกิจกรรม
                    </p>
                  </div>
                </div>
              </div>
            )}
        </>
      )}
    </div>
  );
};

export default AdminOverview;
