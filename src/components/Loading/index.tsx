import React from "react";

import { LoaderContainer, LoaderDot } from "./styles";

const Loading: React.FC = () => {
  return (
    <LoaderContainer>
      <LoaderDot $delay="0.5s" />
      <LoaderDot $delay="0.75s" />
      <LoaderDot $delay="1s" />
    </LoaderContainer>
  );
};

export default Loading;
