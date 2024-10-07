import React from "react";
import { Button } from "../ui/button";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";

const NoSearchResults = () => {
  return (
    <>
      <Button
        className="mb-3 rounded-[15px] border-2 hover:bg-none"
        variant={"ghost"}
        asChild
      >
        <MagnifyingGlassIcon />
      </Button>
      <h1 className="font-semibold text-white">No Events found</h1>
      <p className="mx-auto my-3 w-full text-center text-base text-[#475467]">
        Your search “Comic” did not match any events. Please try again.
      </p>
    </>
  );
};

export default NoSearchResults;
