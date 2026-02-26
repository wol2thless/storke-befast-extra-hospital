import VideoLibraryAll from "../../components/VideoLibraryAll";
import VideoLibraryImageGallery from "../../components/VideoLibraryImageGallery";
import ManualButton from "../../components/ManualButton";

const VideoLibrary = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-primary mb-4">ไลบรารีวิดีโอ</h2>
        <ManualButton />
      </div>
      {/* YouTube Channel Link */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="text-center">
          <div className="text-3xl mb-3">📺</div>
          <h3 className="text-xl font-bold text-blue-700 mb-3">
            ช่อง YouTube กายภาพบำบัด
          </h3>
          <p className="text-gray-700 mb-4">
            รับชมวิดีโอความรู้และเทคนิคการกายภาพบำบัดจากโรงพยาบาลหาดใหญ่
          </p>
          <a
            href="https://www.youtube.com/channel/UC8fuC9Nv4TEaivtDhMslm1w"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-lg text-lg font-bold px-8 py-4"
          >
            <svg
              className="w-6 h-6 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            ดูช่อง YouTube
          </a>
          <div className="text-sm text-gray-600 mt-2">
            กายภาพบำบัด โรงพยาบาลหาดใหญ่
          </div>
        </div>
      </div>

      <VideoLibraryImageGallery />
      <VideoLibraryAll />
    </div>
  );
};

export default VideoLibrary;
