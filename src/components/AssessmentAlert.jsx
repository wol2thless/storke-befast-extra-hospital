import { calculateDaysSince, getUrgencyLevel } from '@utils/assessmentUtils';
import { FaClock, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

const AssessmentAlert = ({
  lastDate,
  assessmentName,
  compact = false
}) => {
  if (!lastDate) {
    return (
      <div className={`alert ${compact ? 'alert-sm' : ''} alert-error`}>
        <FaExclamationTriangle />
        <span>ยังไม่เคยทำ{assessmentName}</span>
      </div>
    );
  }

  const days = calculateDaysSince(lastDate);
  const urgency = getUrgencyLevel(days);

  const icons = {
    info: <FaCheckCircle />,
    warning: <FaClock />,
    critical: <FaExclamationTriangle />,
    overdue: <FaExclamationTriangle />
  };

  return (
    <div className={`alert ${compact ? 'alert-sm' : ''} ${urgency.alertColor}`}>
      {icons[urgency.level]}
      <div className="flex flex-col items-start">
        <span className="font-medium">{urgency.message}</span>
        {days !== null && (
          <span className="text-sm opacity-80">
            ทำล่าสุดเมื่อ: {new Date(lastDate).toLocaleDateString('th-TH')}
          </span>
        )}
      </div>
    </div>
  );
};

export default AssessmentAlert;
