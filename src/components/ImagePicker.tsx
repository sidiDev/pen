import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Image,
  Search,
  UploadCloud,
  Wand2,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Tooltip from "@/components/ui/tooltip-custom";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Helper function to remove file extension
const removeFileExtension = (filename: string): string => {
  return filename.replace(/\.[^/.]+$/, "");
};

type UnsplashPhoto = {
  id: string;
  alt_description: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  links: {
    html: string;
    download_location?: string;
  };
  user?: {
    name?: string;
    links?: { html?: string };
  };
};

type UnsplashSearchResponse = {
  results: UnsplashPhoto[];
  total: number;
  total_pages: number;
};

export function ImagePicker({
  selected,
  setImage,
  open,
  setOpen,
}: {
  selected: string;
  setImage: (image: { name: string; url: string | null }) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [activeTab, setActiveTab] = useState<"upload" | "ai" | "unsplash">(
    "upload"
  );
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<UnsplashPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const unsplashKey = useMemo(
    () => import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined,
    []
  );

  async function searchUnsplash(q: string) {
    if (!unsplashKey) {
      setError(
        "Missing VITE_UNSPLASH_ACCESS_KEY. Add it to your .env file and restart."
      );
      return;
    }
    if (!q.trim()) return;
    setIsSearching(true);
    setError(null);
    try {
      const url = new URL("https://api.unsplash.com/search/photos");
      url.searchParams.set("query", q);
      url.searchParams.set("per_page", "24");
      url.searchParams.set("orientation", "landscape");

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Client-ID ${unsplashKey}`,
          "Accept-Version": "v1",
        },
      });
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      const data = (await res.json()) as UnsplashSearchResponse;
      setResults(data.results || []);
    } catch (e: any) {
      setError(e?.message || "Search failed");
    } finally {
      setIsSearching(false);
    }
  }

  const handleFileUpload = useCallback(async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("filename", file.name);
      formData.append("type", file.type);

      const response = await fetch("http://localhost:64374/upload-file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await response.json();
      console.log(`http://filesdev.rapidforms.co/${result.filename}`);
      console.log(file.name);
      setImage({
        name: removeFileExtension(file.name),
        url: `http://filesdev.rapidforms.co/${result.filename}`,
      });
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadSuccess(true);

      // Close the popover after successful upload
      setTimeout(() => {
        setOpen(false);
        setUploadSuccess(false);
        setUploadProgress(0);
      }, 100);
    } catch (err: any) {
      clearInterval(progressInterval);
      setUploadError(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileUpload(e.dataTransfer.files[0]);
      }
    },
    [handleFileUpload]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  useEffect(() => {
    if (open) {
      setActiveTab("upload");
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip content={"Image"} side="right">
        <PopoverTrigger
          data-active={selected === "image"}
          className="bg-neutral-800 hover:bg-neutral-700 size-8 text-neutral-300 flex items-center justify-center rounded-md data-[active=true]:bg-neutral-700 data-[active=true]:text-neutral-300"
        >
          <Image className="size-5" />
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent
        side="right"
        align="end"
        sideOffset={20}
        className="w-[460px] p-0"
      >
        <div className="w-full flex flex-col">
          <Tabs
            value={activeTab}
            onValueChange={(v: string) =>
              setActiveTab(v as "upload" | "ai" | "unsplash")
            }
            className="flex-1 h-full"
          >
            {/* Tabs */}
            <TabsList className="gap-2 flex items-center border-b border-neutral-700 px-4 py-0 h-12">
              <TabsTrigger value="upload" className="h-7">
                <UploadCloud className="size-4" />
                <span>Upload</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="h-7">
                <Wand2 className="size-4" />
                <span>AI</span>
              </TabsTrigger>
              <TabsTrigger value="unsplash" className="h-7">
                <Image className="size-4" />
                <span>Unsplash</span>
              </TabsTrigger>
            </TabsList>

            <div className="h-[440px]">
              {/* Content */}
              <TabsContent value="upload" className="pt-4 h-[440px] p-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {isUploading ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-neutral-300">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-neutral-700 rounded-full"></div>
                      <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <div className="text-sm">Uploading...</div>
                    <div className="w-48 bg-neutral-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-neutral-400">
                      {uploadProgress}%
                    </div>
                  </div>
                ) : uploadSuccess ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-neutral-300">
                    <CheckCircle className="size-16 text-green-500" />
                    <div className="text-sm">Upload successful!</div>
                    <div className="text-xs text-neutral-400">
                      Image has been uploaded
                    </div>
                  </div>
                ) : uploadError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-neutral-300">
                    <AlertCircle className="size-16 text-red-500" />
                    <div className="text-sm text-center text-red-400">
                      {uploadError}
                    </div>
                    <button
                      onClick={() => setUploadError(null)}
                      className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 rounded text-xs transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div
                    className={`border border-dashed rounded-lg w-full h-full m-auto flex flex-col items-center justify-center gap-2 text-neutral-300 transition-colors cursor-pointer ${
                      dragActive
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-neutral-600 hover:border-neutral-500"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={handleClick}
                  >
                    <UploadCloud
                      className={`size-10 transition-colors ${
                        dragActive ? "text-blue-500" : "opacity-60"
                      }`}
                    />
                    <div className="text-sm">
                      Click to choose an image or drag here
                    </div>
                    <div className="text-xs text-neutral-400">
                      Supports: JPG, PNG, GIF, WebP • Size limit: 10 MB
                    </div>
                    <span className="text-sm text-neutral-50 font-medium">
                      ⇧ ⌘ K
                    </span>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ai" className="h-full">
                <div className="h-full grid place-items-center text-neutral-400 text-sm">
                  Coming soon
                </div>
              </TabsContent>

              <TabsContent value="unsplash" className="h-full">
                <div className="h-full flex flex-col">
                  {/* Search bar */}
                  <form
                    className="p-4 pb-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      searchUnsplash(query);
                    }}
                  >
                    <div className="relative">
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for an image"
                        className="w-full h-7 bg-neutral-700/60 border border-neutral-700 rounded-md pl-9 pr-3 text-sm text-neutral-100 placeholder:text-neutral-400 outline-none focus:border-neutral-500"
                      />
                      <Search className="size-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </form>

                  {/* Results */}
                  <div className="flex-1 overflow-auto p-4 pt-2">
                    {error && (
                      <div className="text-xs text-red-400">{error}</div>
                    )}
                    {isSearching && (
                      <div className="text-xs text-neutral-400 pb-4">
                        Searching…
                      </div>
                    )}
                    {!isSearching && results.length === 0 && !error && (
                      <div className="text-xs text-neutral-400">
                        Try a search to see results.
                      </div>
                    )}

                    {results.length > 0 && (
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {results.map((p) => (
                          <button
                            key={p.id}
                            className="group relative aspect-[4/3] overflow-hidden rounded-md border border-neutral-700 hover:border-neutral-500"
                            onClick={() => {
                              setOpen(false);
                              setImage({
                                name: p.alt_description ?? "Unsplash image",
                                url: p.urls.small,
                                // p.urls.regular
                              });
                            }}
                          >
                            <img
                              src={p.urls.small}
                              alt={p.alt_description ?? "Unsplash image"}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-black/40 text-[10px] leading-tight text-neutral-100 px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                              {p.user?.name
                                ? `Photo by ${p.user.name}`
                                : "Unsplash"}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  );
}
