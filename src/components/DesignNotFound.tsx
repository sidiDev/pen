import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";

function DesignNotFound() {
  return (
    <div className="bg-neutral-800 h-screen px-4 flex items-center justify-center">
      <div className="text-center max-w-sm w-full">
        <Logo />
        <h1 className="text-neutral-50 text-xl font-medium mt-6">
          Design not found
        </h1>
        <p className="text-neutral-400 mt-2">
          The design you’re looking for doesn’t exist or you don’t have access.
        </p>
        <div className="mt-6 flex items-center justify-center">
          <a href="/">
            <Button className="bg-white hover:bg-neutral-200 text-neutral-700">
              Back to drafts
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

export default DesignNotFound;
