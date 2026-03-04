import React from "react";

const ManualButton = () => {
  const url = import.meta.env.VITE_MANUAL_PDF_URL;
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-primary"
    >
      คู่มือการดูแลผู้ป่วย
    </a>
  );
};

export default ManualButton;
