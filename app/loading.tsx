
const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-white p-5">
      <div className="flex flex-col items-center gap-8 w-full max-w-md">
        {/* اسپینر */}
        <div className="w-12 h-12 border-4 border-gray-100 border-t-black rounded-full animate-spin shadow-sm" />

        {/* اسکلتون‌ها */}
        <div className="w-full flex flex-col gap-3 animate-pulse">
          <div className="h-5 w-full bg-gray-100 rounded-lg" />
          <div className="h-5 w-3/5 bg-gray-100 rounded-lg" />
          <div className="h-24 w-full bg-gray-100 rounded-xl" />
        </div>
      </div>

      <p className="text-black/60 text-sm mt-8 animate-pulse">
        در حال بارگذاری محتوا...
      </p>
    </div>
  );
};

export default Loading;