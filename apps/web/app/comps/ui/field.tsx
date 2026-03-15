import { Input, type InputProps } from "./input";
import { cn } from "@/app/utils/misc";

export type ListOfErrors = Array<string | null | undefined> | null | undefined;

export function Field({
  inputProps,
  errors,
}: {
  inputProps: InputProps;
  errors: ListOfErrors;
}) {
  const id = inputProps.id;
  const errorId = errors?.length ? `${id}-error` : undefined;

  return (
    <div
      className={cn(
        "border-opacity-[0.125] relative flex h-[69px] w-full items-end border-b border-white p-3 transition duration-500 ease-in-out",
        inputProps.className,
      )}
    >
      {errors?.map((error) => (
        <div
          key={error}
          className="absolute top-3 left-3 flex text-xs text-teal-300"
        >
          {error}
        </div>
      ))}

      <Input
        id={id}
        aria-invalid={errorId ? true : undefined}
        aria-describedby={errorId}
        {...inputProps}
        key={inputProps.key}
      />
    </div>
  );
}
