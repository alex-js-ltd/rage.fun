import { Icon } from "./_icon";

export function Spinner() {
  return (
    <Icon
      name="loading"
      className="z-50 w-6 h-6 animate-spin text-teal-300 flex items-center justify-center"
      aria-label="loading"
    />
  );
}
