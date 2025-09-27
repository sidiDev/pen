import File from "./File.tsx";
import { useParams } from "react-router";
import {
  Authenticated,
  Unauthenticated,
  useQuery,
  AuthLoading,
} from "convex/react";
import Login from "./components/Login.tsx";
import LoadingView from "./components/LoadingView.tsx";
import DesignNotFound from "./components/DesignNotFound.tsx";
import { api } from "../convex/_generated/api";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { observer } from "mobx-react-lite";
import canvasStore from "./utils/CanvasStore";
import { toJS } from "mobx";

function FileLayout() {
  let { id } = useParams();

  return (
    <>
      <Authenticated>
        <Content id={id as string} />
      </Authenticated>
      <Unauthenticated>
        <Login />
      </Unauthenticated>
      <AuthLoading>
        <LoadingView />
      </AuthLoading>
    </>
  );
}

const Content = observer(function Content({ id }: { id: string }) {
  const user = useQuery(api.users.viewer);
  const mutateFile = useMutation(api.files.updateFile);
  const [ifilled, setIfilled] = useState(false);

  const queryFile = useQuery(api.files.getFile, {
    fileId: id as any,
  });

  useEffect(() => {
    if (queryFile && !ifilled) {
      canvasStore.setUpdatePages(queryFile.pages);
      document.body.style.backgroundColor =
        queryFile.pages[0].backgroundColor.rgba;
      // queryFile.pages[0].backgroundColor.rgba;
      console.log("queryFile", queryFile.pages);
      setIfilled(true);
    }
  }, [queryFile?.pages]);

  useEffect(() => {
    const unsubscribe = canvasStore.onDebouncedUpdate((pages) => {
      mutateFile({
        fileId: id as any,
        file: { pages: canvasStore.allPages, updatedAt: Date.now() },
      });
    });
  }, []);

  if (!user) return <LoadingView />;
  if (!queryFile) return <DesignNotFound />;
  return <File pages={queryFile.pages} />;
});

export default FileLayout;
