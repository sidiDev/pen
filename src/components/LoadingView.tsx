import Logo from "@/components/Logo";

function LoadingView() {
  return (
    <div className="bg-neutral-800 h-screen px-4 flex items-center justify-center">
      <div className="text-center max-w-sm w-full">
        <Logo />
        <div className="h-2 bg-neutral-700 mt-4 rounded-full overflow-hidden">
          <div className="h-full bg-white animate-pulse loader-view-progress"></div>
        </div>
      </div>
    </div>
  );
}

export default LoadingView;
