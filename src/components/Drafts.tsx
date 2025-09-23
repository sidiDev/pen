import { Button } from "./ui/button";
import { PlusIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router";

function Drafts({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);

  const mutateFile = useMutation(api.files.createFile);
  const files = useQuery(api.files.getFiles);

  const navigate = useNavigate();
  function createDraft() {
    setLoading(true);
    mutateFile({
      file: {
        pages: [
          {
            id: uuidv4(),
            name: "Page 1",
            zoom: {
              pointer: { x: 0, y: 0 },
              delta: { x: 0, y: 0 },
              value: 1,
            },
            backgroundColor: {
              hex: "#fafafa",
              rgba: "RGBA(250, 250, 250, 1)",
              alpha: 1,
            },
            objects: [],
          },
        ],
        name: "New Draft",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        userId: userId as any,
      },
    }).then((fileId) => {
      console.log(fileId);
      navigate(`/file/${fileId}`);
      setLoading(false);
    });
  }

  return (
    <section className="screen-w">
      <div>
        <h1 className="text-2xl font-medium text-neutral-50">Drafts</h1>
        <Button
          className="bg-white hover:bg-neutral-200 text-neutral-700 mt-3"
          disabled={loading}
          onClick={createDraft}
        >
          {loading ? <Loader2 className="animate-spin" /> : <PlusIcon />}
          New Draft
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-4"></div>
    </section>
  );
}

export default Drafts;
