import type { CardProps, ComparisonCardProps } from "../types";
import { renderWithKaTeX } from "../utils";

export function Card({ title, children, className = "" }: CardProps) {
  return (
    <div className={`card shadow-sm ${className}`}>
      <div className='card-header bg-primary text-white'>
        <h5 className='card-title mb-0'>{title}</h5>
      </div>
      <div className='card-body'>{children}</div>
    </div>
  );
}

type VariantType = "success" | "danger" | "default";

function getVariantClasses(variant: VariantType): string {
  const variantMap: Record<VariantType, string> = {
    success: "border-success-subtle bg-success-subtle text-success-emphasis",
    danger: "border-danger-subtle bg-danger-subtle text-danger-emphasis",
    default: "border-secondary-subtle bg-body-tertiary",
  };
  return variantMap[variant] || variantMap.default;
}

export function ComparisonCard({
  label,
  value,
  variant = "default",
}: ComparisonCardProps) {
  return (
    <div className={`card border ${getVariantClasses(variant)}`}>
      <div className='card-body'>
        <small className='d-block mb-1'>{label}</small>
        <div className='fs-6 font-monospace'>{renderWithKaTeX(value)}</div>
      </div>
    </div>
  );
}

export default Card;
