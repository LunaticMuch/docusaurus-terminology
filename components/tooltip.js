import React from "react";
import { Tooltip } from '@mui/material'
import Link from "@docusaurus/Link";

const popupStyle = {
  fontSize: "14px",
};
const textStyle = {
  fontWeight: "bold",
};

export default function Term(props) {
  return (
    <Tooltip 
      title={<span style={popupStyle}>{props.popup}</span>} 
      arrow={true}
    >
      <Link to={props.reference}>
        <span style={textStyle}>{props.children}</span>
      </Link>
    </Tooltip>
  );
}
