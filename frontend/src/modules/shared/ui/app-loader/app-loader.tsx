export const AppLoader = () => {
  return (
    <div className="relative flex items-center justify-center h-screen">
      <div className="relative rounded-full h-24 w-24 animate-spin-slow bg-gradient-to-r from-[#76ABAE] via-[#5D8A8F] to-[#4B6F6F]">
        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#76ABAE] via-[#5D8A8F] to-[#4B6F6F] blur-sm"></span>
        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#76ABAE] via-[#5D8A8F] to-[#4B6F6F] blur-md"></span>
        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#76ABAE] via-[#5D8A8F] to-[#4B6F6F] blur-lg"></span>
        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#76ABAE] via-[#5D8A8F] to-[#4B6F6F] blur-2xl"></span>
        <div className="absolute inset-2 bg-bg-secondary border-4 border-[#76ABAE] rounded-full"></div>
      </div>
    </div>
  );
};