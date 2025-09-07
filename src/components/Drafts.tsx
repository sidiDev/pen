import { Button } from "./ui/button";
import { PlusIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router";

function Drafts() {
  const [loading, setLoading] = useState(false);

  const mutateFile = useMutation(api.files.createFile);
  const navigate = useNavigate();
  function createDraft() {
    setLoading(true);
    mutateFile({
      file: {
        pages: [
          {
            id: uuidv4(),
            name: "Page 1",
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
    </section>
  );
}

export default Drafts;
