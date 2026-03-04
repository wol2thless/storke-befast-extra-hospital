import React, { useState } from "react";

const VideoLibraryImageGallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const basePath = import.meta.env.VITE_BASE_PATH || "/stroke-befast";

  // ข้อมูลภาพจาก Google Docs
  const images = [
    {
      id: 1,
      title: "สัญญาณเตือนโรคหลอดเลือดสมอง BEFAST",
      description: "อาการและสัญญาณเตือนโรคหลอดเลือดสมอง B.E.F.A.S.T. - ร่วมมือกัน ป้องกัน โรคหลอดเลือดสมอง",
      src: `${basePath}/images/video-library/befast-infographic.jpg`,
      category: "stroke_education"
    },
    {
      id: 2,
      title: "อย่าให้ อัมพฤกษ์ อัมพาต",
      description: "อย่าให้ อัมพฤกษ์ อัมพาต",
      src: `${basePath}/images/video-library/stroke001.jpg`,
      category: "stroke_education"
    },
    {
      id: 3,
      title: "อาการหรือสัญญาณเตือนโรคหลอดเลือดสมอง B.E.F.A.S.T.",
      description: "อาการหรือสัญญาณเตือนโรคหลอดเลือดสมอง B.E.F.A.S.T.",
      src: `${basePath}/images/video-library/stroke002.jpg`,
      category: "stroke_education"
    },
    {
      id: 4,
      title: "การป้องกันโรคหลอดเลือดสมอง",
      description: "การป้องกันโรงหลอดเลือดสอมง ทำได้โดยการปรับเปลี่ยนพฤติกรรม",
      src: `${basePath}/images/video-library/stroke003.jpg`,
      category: "stroke_education"
    }
  ];

  const openImageModal = (image) => {
    setSelectedImage(image);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-primary mb-2">
          🖼️ แกลเลอรี่ภาพความรู้
        </h2>
        <p className="text-gray-600">
          ภาพประกอบความรู้เกี่ยวกับโรคหลอดเลือดสมอง
        </p>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => openImageModal(image)}
          >
            <figure className="px-4 pt-4">
              <img
                src={image.src}
                alt={image.title}
                className="rounded-lg w-full h-32 object-cover"
              />
            </figure>
            <div className="card-body p-4">
              <h3 className="card-title text-sm font-semibold">{image.title}</h3>
              <p className="text-xs text-gray-600">{image.description}</p>
              <div className="card-actions justify-end mt-2">
                <button className="btn btn-xs btn-primary">
                  ดูภาพ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">{selectedImage.title}</h3>
                <button
                  onClick={closeImageModal}
                  className="btn btn-sm btn-ghost"
                >
                  ✕
                </button>
              </div>
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                className="w-full rounded-lg mb-4"
              />
              <p className="text-gray-700">{selectedImage.description}</p>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={closeImageModal}
                  className="btn btn-primary"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoLibraryImageGallery; 