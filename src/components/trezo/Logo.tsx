import mark from "@/assets/trezo-mark.webp";

type LogoProps = {
  className?: string;
  /** pixel size of the mark */
  size?: number;
  /** show the "Trezo" wordmark next to the mark */
  showText?: boolean;
  textClassName?: string;
};

export function Logo({
  className = "",
  size = 32,
  showText = true,
  textClassName = "",
}: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src={mark}
        alt="Trezo লোগো"
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="object-contain"
      />
      {showText && (
        <span
          className={`font-extrabold tracking-tight leading-none ${textClassName}`}
        >
          Trezo
        </span>
      )}
    </span>
  );
}

export default Logo;
