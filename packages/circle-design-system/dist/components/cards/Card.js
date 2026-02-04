import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { colors } from "../../tokens/colors.js";
import { spacing } from "../../tokens/spacing.js";
import { shadows } from "../../tokens/shadows.js";
import { borders } from "../../tokens/borders.js";
const Card = ({
  variant = "default",
  hoverable = false,
  children,
  style,
  ...props
}) => {
  const variantStyles = {
    default: {
      backgroundColor: colors.background.white,
      border: "none",
      boxShadow: "none"
    },
    elevated: {
      backgroundColor: colors.background.white,
      border: "none",
      boxShadow: shadows.boxShadow.md
    },
    bordered: {
      backgroundColor: colors.background.white,
      border: `${borders.width.DEFAULT} solid ${colors.neutral[200]}`,
      boxShadow: "none"
    }
  };
  const baseStyles = {
    ...variantStyles[variant],
    borderRadius: borders.radius.xl,
    // 20px - Cards use larger radius
    padding: spacing[6],
    // 24px
    transition: "all 0.2s ease",
    cursor: hoverable ? "pointer" : "default"
  };
  const handleMouseEnter = (e) => {
    if (hoverable) {
      e.currentTarget.style.boxShadow = shadows.boxShadow.lg;
      e.currentTarget.style.transform = "translateY(-2px)";
    }
  };
  const handleMouseLeave = (e) => {
    if (hoverable) {
      e.currentTarget.style.boxShadow = variantStyles[variant].boxShadow || "none";
      e.currentTarget.style.transform = "translateY(0)";
    }
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      ...props,
      style: { ...baseStyles, ...style },
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      children
    }
  );
};
const CardHeader = ({
  title,
  actions,
  children,
  style,
  ...props
}) => {
  const headerStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing[4],
    // 16px
    gap: spacing[4]
  };
  const titleStyles = {
    fontSize: "1.25rem",
    // 20px
    fontWeight: 600,
    color: colors.neutral[900],
    margin: 0
  };
  return /* @__PURE__ */ jsx("div", { ...props, style: { ...headerStyles, ...style }, children: children || /* @__PURE__ */ jsxs(Fragment, { children: [
    title && (typeof title === "string" ? /* @__PURE__ */ jsx("h3", { style: titleStyles, children: title }) : title),
    actions && /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: spacing[2] }, children: actions })
  ] }) });
};
const CardBody = ({
  children,
  style,
  ...props
}) => {
  const bodyStyles = {
    color: colors.neutral[700],
    fontSize: "0.875rem",
    // 14px
    lineHeight: 1.5
  };
  return /* @__PURE__ */ jsx("div", { ...props, style: { ...bodyStyles, ...style }, children });
};
const CardFooter = ({
  children,
  style,
  ...props
}) => {
  const footerStyles = {
    marginTop: spacing[4],
    // 16px
    paddingTop: spacing[4],
    borderTop: `${borders.width.DEFAULT} solid ${colors.neutral[200]}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[2]
  };
  return /* @__PURE__ */ jsx("div", { ...props, style: { ...footerStyles, ...style }, children });
};
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
export {
  Card
};
//# sourceMappingURL=Card.js.map
