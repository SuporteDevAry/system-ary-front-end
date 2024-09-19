import { Tooltip } from "@mui/material";

export const CustomTruncateText: React.FC<{
  text: string;
  maxChars: number;
}> = ({ text, maxChars }) => {
  const truncated =
    text.length > maxChars ? `${text.substring(0, maxChars)}...` : text;

  return (
    <Tooltip title={text.length > maxChars ? text : ""} arrow>
      <span>{truncated}</span>
    </Tooltip>
  );
};
