import { useState } from 'react';
import { FaSearch, FaCode, FaCopy } from 'react-icons/fa';
import axios from 'axios';

const DIRECT_API_URL = import.meta.env.VITE_HIS_APPOINTMENT_URL || '';

const TestAppointmentAPI = () => {
  const [pid, setPid] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [useProxy, setUseProxy] = useState(true);

  const testAPI = async () => {
    if (!pid.trim()) {
      setError('กรุณาป้อนเลขบัตรประชาชน');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const startTime = Date.now();
      const apiUrl = useProxy
        ? '/api/appointment/get_pmk_utable.php'
        : DIRECT_API_URL;

      const result = await axios.post(
        apiUrl,
        { pid: pid.trim() },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );
      const endTime = Date.now();
      const duration = endTime - startTime;

      setResponse({
        data: result.data,
        status: result.status,
        statusText: result.statusText,
        duration: duration,
        headers: result.headers,
        config: {
          url: result.config.url,
          method: result.config.method,
          data: result.config.data
        }
      });
    } catch (err) {
      console.error('API Error:', err);

      let errorDetails = {
        message: err.message,
        code: err.code,
        type: 'unknown'
      };

      if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        errorDetails.type = 'network';
        errorDetails.suggestions = [
          'ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
          'ตรวจสอบว่า API Server ทำงานอยู่หรือไม่',
          'ตรวจสอบ Firewall หรือ VPN',
          'ลองใช้ HTTPS แทน HTTP'
        ];
      } else if (err.code === 'ECONNABORTED') {
        errorDetails.type = 'timeout';
        errorDetails.suggestions = [
          'API Server ตอบกลับช้า',
          'ลองเพิ่ม timeout',
          'ตรวจสอบการเชื่อมต่อเครือข่าย'
        ];
      }

      if (err.response) {
        errorDetails.response = {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data
        };
      }

      setError(errorDetails);
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = () => {
    const textToCopy = JSON.stringify(response, null, 2);
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const formatJSON = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  const displayUrl = useProxy ? '/api/appointment/get_pmk_utable.php' : (DIRECT_API_URL || '(ยังไม่ได้ตั้ง VITE_HIS_APPOINTMENT_URL ใน .env)');

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2 flex items-center gap-2">
          <FaCode className="w-6 h-6" />
          API Tester - Appointment
        </h1>
        <p className="text-gray-600">
          ทดสอบการเชื่อมต่อ HIS Appointment API
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-base-100 rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">ป้อนข้อมูลทดสอบ</h2>

        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">เลขบัตรประชาชน (PID)</label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="เช่น 1234567890123"
              value={pid}
              onChange={(e) => setPid(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && testAPI()}
            />
          </div>
          <div className="flex items-end">
            <button
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              onClick={testAPI}
              disabled={loading}
            >
              {loading ? '' : <FaSearch className="w-4 h-4 mr-2" />}
              ทดสอบ API
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="form-control">
            <label className="label cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={useProxy}
                onChange={(e) => setUseProxy(e.target.checked)}
              />
              <span className="label-text ml-2">ใช้ Proxy (แนะนำ)</span>
            </label>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <p><strong>Method:</strong> POST</p>
          <p><strong>URL:</strong> {displayUrl}</p>
          <p><strong>Content-Type:</strong> application/json</p>
          <p><strong>Body:</strong> {`{ "pid": "${pid || 'PID_VALUE'}" }`}</p>
        </div>
      </div>

      {/* Response Section */}
      {(response || error) && (
        <div className="bg-base-100 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">ผลลัพธ์</h2>
            {response && (
              <button
                className={`btn btn-sm ${copied ? 'btn-success' : 'btn-outline'}`}
                onClick={copyResponse}
              >
                <FaCopy className="w-4 h-4 mr-2" />
                {copied ? 'คัดลอกแล้ว!' : 'คัดลอก JSON'}
              </button>
            )}
          </div>

          {/* Success Response */}
          {response && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-xs text-green-600 font-medium">Status</div>
                  <div className="text-lg font-bold text-green-700">{response.status}</div>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-xs text-blue-600 font-medium">Duration</div>
                  <div className="text-lg font-bold text-blue-700">{response.duration}ms</div>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <div className="text-xs text-purple-600 font-medium">Data Type</div>
                  <div className="text-lg font-bold text-purple-700">
                    {Array.isArray(response.data) ? 'Array' : typeof response.data}
                  </div>
                </div>
                <div className="bg-orange-50 p-3 rounded">
                  <div className="text-xs text-orange-600 font-medium">Count</div>
                  <div className="text-lg font-bold text-orange-700">
                    {Array.isArray(response.data) ? response.data.length : 1}
                  </div>
                </div>
              </div>

              {Array.isArray(response.data) && response.data.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">ตัวอย่างข้อมูล (รายการแรก):</h3>
                  <div className="bg-gray-50 p-4 rounded border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(response.data[0]).map(([key, value]) => (
                        <div key={key} className="flex flex-col">
                          <span className="text-xs font-medium text-gray-500 uppercase">{key}</span>
                          <span className="text-sm font-mono bg-white px-2 py-1 rounded border">
                            {String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Response JSON ทั้งหมด:</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded overflow-auto max-h-96">
                  <pre className="text-xs">{formatJSON(response.data)}</pre>
                </div>
              </div>

              <details className="collapse collapse-arrow border border-base-300 bg-base-200">
                <summary className="collapse-title text-sm font-medium">
                  รายละเอียดการตอบกลับทั้งหมด
                </summary>
                <div className="collapse-content">
                  <div className="bg-gray-900 text-green-400 p-4 rounded overflow-auto max-h-64 mt-2">
                    <pre className="text-xs">{formatJSON(response)}</pre>
                  </div>
                </div>
              </details>
            </div>
          )}

          {/* Error Response */}
          {error && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <h3 className="font-semibold text-red-700 mb-2">เกิดข้อผิดพลาด</h3>
                <p className="text-red-600 mb-2">{error.message}</p>

                {error.code && (
                  <p className="text-sm text-red-500 mb-2">รหัสข้อผิดพลาด: {error.code}</p>
                )}

                {error.type === 'network' && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3">
                    <h4 className="font-medium text-yellow-800 mb-2">วิธีแก้ไขปัญหา Network Error:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {error.suggestions?.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-500">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-3">
                  <h4 className="font-medium text-blue-800 mb-2">วิธีทดสอบทางเลือก:</h4>
                  <div className="text-sm text-blue-700 space-y-2">
                    <p><strong>1. ทดสอบด้วย curl:</strong></p>
                    <div className="bg-blue-100 p-2 rounded font-mono text-xs overflow-auto">
                      {`curl -X POST "${displayUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{"pid":"${pid || 'PID_VALUE'}"}'`}
                    </div>

                    <p><strong>2. ทดสอบด้วย Postman:</strong></p>
                    <ul className="ml-4 space-y-1">
                      <li>• URL: {displayUrl}</li>
                      <li>• Method: POST</li>
                      <li>• Body: {`{"pid":"${pid || 'PID_VALUE'}"}`}</li>
                    </ul>
                  </div>
                </div>

                {error.response && (
                  <div className="mt-4">
                    <h4 className="font-medium text-red-700 mb-2">รายละเอียดการตอบกลับ:</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-red-100 p-3 rounded">
                        <div className="text-xs text-red-600 font-medium">Status</div>
                        <div className="text-lg font-bold text-red-700">{error.response.status}</div>
                      </div>
                      <div className="bg-red-100 p-3 rounded">
                        <div className="text-xs text-red-600 font-medium">Status Text</div>
                        <div className="text-lg font-bold text-red-700">{error.response.statusText}</div>
                      </div>
                    </div>

                    <div className="bg-gray-900 text-red-400 p-4 rounded overflow-auto max-h-64">
                      <pre className="text-xs">{formatJSON(error.response.data)}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestAppointmentAPI;
