import styles from "./Avatar.module.css";

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

export function Avatar({
  name,
  otherStyles,
  color,
}: {
  otherStyles: string;
  name: string;
  color?: string | null;
}) {
  return (
    <div className={`${styles.avatar} ${otherStyles}
    h-9 w-9`} data-tooltip={name} style={{ backgroundColor: color || "#9ca3af" }}>
      <span className={styles.avatar_picture}>{getInitials(name) || "?"}</span>
    </div>
  );
}
