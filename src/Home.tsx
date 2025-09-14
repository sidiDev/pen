import Login from "./components/Login";
import {
  Authenticated,
  Unauthenticated,
  useQuery,
  useConvexAuth,
} from "convex/react";
import { api } from "../convex/_generated/api";
import Navbar from "./components/Navbar";
import LoadingView from "./components/LoadingView";
import Drafts from "./components/Drafts";
import { useEffect } from "react";
// import { useAuthActions } from "@convex-dev/auth/react";

function Home() {
  // const { isLoading, isAuthenticated } = useConvexAuth();

  useEffect(() => {
    document.body.style.backgroundColor = "";
  }, []);

  return (
    <>
      <Unauthenticated>
        <Login />
      </Unauthenticated>
      <Authenticated>
        <Content />
      </Authenticated>
    </>
  );
}

function Content() {
  // const { isLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.viewer);
  if (!user) return <LoadingView />;
  return (
    <main className="space-y-6">
      <Navbar user={user as { email: string; name: string; image: string }} />
      <Drafts />
    </main>
  );
}

export default Home;
