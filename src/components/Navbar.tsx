import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthActions } from "@convex-dev/auth/react";
import Logo from "./Logo";

function Navbar({
  user,
}: {
  user: { email: string; name: string; image: string };
}) {
  const { signOut } = useAuthActions();
  const handleSignOut = async () => {
    await signOut();
  };
  return (
    <div className="sticky top-0 w-full bg-neutral-800">
      <div className="screen-w py-4 flex items-center justify-between">
        <div>
          <Logo />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            {" "}
            <Avatar>
              <AvatarImage src={user.image} />
              <AvatarFallback className="">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end" className="w-52">
            <DropdownMenuLabel className="text-sm">
              {user.name}
            </DropdownMenuLabel>
            <DropdownMenuLabel className="text-sm text-neutral-400">
              {user.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default Navbar;
