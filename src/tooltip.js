import React from "react";
import { Tooltip } from "@material-ui/core";
import Link from '@docusaurus/Link';

const popupStyle = {
  fontSize: "14px",
};
const textStyle = {
  fontWeight: "bold",
};

export default function Term(props) {
  return (
    <Tooltip title={<span style={popupStyle}>{props.popup}</span>} arrow={true}>
      <Link to={{ pathname: props.reference }}>
        <span style={textStyle}>{props.children}</span>
      </Link>
    </Tooltip>
  );
}
