import React from "react";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { CustomTooltipLabelProps } from "./types";

const CustomTooltipLabel: React.FC<CustomTooltipLabelProps> = ({
  title,
  children,
}) => {
  return (
    <Tooltip title={title} arrow>
      <Typography variant="body1" component="span">
        {children}
      </Typography>
    </Tooltip>
  );
};

export default CustomTooltipLabel;
