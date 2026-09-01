import { Suspense } from "react";
import SearchBar from "./SearchBar";

type SearchBarProps = {
  mobile?: boolean;
};

export const SearchBarWrapper = (  {mobile = false} : SearchBarProps)=>{
    return (
        <Suspense fallback={null}>
            <SearchBar mobile></SearchBar>
        </Suspense>
    )
}