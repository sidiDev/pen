function ImageFill({
  imageUrl,
  className,
}: {
  imageUrl: string;
  className?: string;
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className="text-xs font-medium text-neutral-200">Fill</h2>
      <div className="h-7 px-1 rounded-md bg-neutral-700/50 border border-neutral-700 flex items-center gap-2">
        <img
          src={imageUrl}
          alt="Image"
          className="size-4.5 rounded-sm bg-cover"
        />
        <span className="text-xs text-neutral-200">Image</span>
      </div>
    </div>
  );
}

export default ImageFill;
