import PropTypes from "prop-types";
import { PRODUCT_LOGO_SRC, PRODUCT_NAME } from "../constants/branding";

export const Logo = ({ height = 48, maxWidth = 220 }) => (
  <img
    src={PRODUCT_LOGO_SRC}
    alt={PRODUCT_NAME}
    style={{
      height,
      width: "auto",
      maxWidth,
      objectFit: "contain",
      display: "block",
    }}
  />
);

Logo.propTypes = {
  height: PropTypes.number,
  maxWidth: PropTypes.number,
  color: PropTypes.oneOf(["black", "primary", "white"]),
};
