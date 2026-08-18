"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import NavItems from "./NavItems";

const UserDropdown = () => {
  const router = useRouter();

  const user = {
    name: "Ahmad Naveed",
    email: "ahmadnaveedofficial05@gmail.com",
    avatar: "https://github.com/shadcn.png",
  };

  const handleSignOut = () => {
    router.push("/sign-in");
  };

  return (
    <DropdownMenu>
      {/* Trigger */}
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-2 hover:bg-transparent hover:text-yellow-500 cursor-pointer"
          />
        }
      >
        {/* Avatar */}
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="bg-yellow-500 text-yellow-900 text-sm font-bold">
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Name - Desktop only */}
        <span className="hidden md:block text-base font-medium text-gray-400">
          {user.name}
        </span>
      </DropdownMenuTrigger>

      {/* Dropdown */}
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 bg-gray-950 border-gray-800 text-gray-400"
      >
        {/* User Information */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-2">
            <div className="flex items-center gap-3 py-1">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-yellow-500 text-yellow-900 text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex min-w-0 flex-col">
                <span className="text-base font-medium text-gray-300 truncate">
                  {user.name}
                </span>

                <span className="text-sm text-gray-500 truncate">
                  {user.email}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-gray-700" />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-gray-100 font-medium focus:bg-transparent focus:text-yellow-500 transition-colors cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>

        {/* Mobile Navigation */}
        <div className="sm:hidden">
          <DropdownMenuSeparator className="bg-gray-700" />

          <DropdownMenuGroup>
            <nav className="py-1">
              <NavItems />
            </nav>
          </DropdownMenuGroup>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
