import { CustomInput } from "../CustomInput";
import { SContainer } from "./styles";
import { CustomSearchProps } from "./types";

export const CustomSearch: React.FC<CustomSearchProps> = ({
  placeholder,
  height,
  width,
  inputRef,
  disabled,
  ...rest
}) => {
  return (
    <>
      <SContainer>
        <CustomInput
          placeholder={placeholder}
          width={width}
          height={height}
          inputRef={inputRef}
          disabled={disabled}
          {...rest}
        />
      </SContainer>
    </>
  );
};
