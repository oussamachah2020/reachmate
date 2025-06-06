import React from "react";
import { LottiePlayer } from "./lottie-player";
import LoaderAnimation from "@/../public/Animation - 1749155025415.json";

type Props = {};

const Loader = (props: Props) => {
  return (
    <div className="min-h-screen w-full flex justify-center items-center">
      <LottiePlayer lottieJson={LoaderAnimation} />
    </div>
  );
};

export default Loader;
