import Login from "./components/Login";
import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
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
      <AuthLoading>
        <LoadingView />
      </AuthLoading>
    </>
  );
}

function Content() {
  // const { isLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.viewer);
  console.log(user);

  return (
    <main className="space-y-6">
      <Navbar user={user as { email: string; name: string; image: string }} />
      <Drafts />
    </main>
  );
}

export default Home;
