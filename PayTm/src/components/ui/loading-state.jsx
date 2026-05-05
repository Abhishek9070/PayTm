function classNames(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function Spinner({ className = "" }) {
  return (
    <span
      className={classNames(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent align-[-0.125em]",
        className
      )}
      aria-hidden="true"
    />
  );
}

export function LoadingButton({
  loading = false,
  disabled = false,
  className = "",
  children,
  type = "button",
  ...props
}) {
  const isDisabled = loading || disabled;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={classNames(
        "inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70",
        className
      )}
      {...props}
    >
      {loading ? <Spinner /> : null}
      <span>{children}</span>
    </button>
  );
}

export function Skeleton({ className = "" }) {
  return (
    <div
      className={classNames("animate-pulse rounded bg-slate-700/60", className)}
      aria-hidden="true"
    />
  );
}

export function StackSkeleton({ rows = 3, rowClassName = "h-4 w-full", className = "" }) {
  return (
    <div className={classNames("space-y-2", className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className={rowClassName} />
      ))}
    </div>
  );
}
