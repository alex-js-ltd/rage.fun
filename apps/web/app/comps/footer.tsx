import Link from "next/link";

export function Footer() {
  return (
    <footer className="px-0">
      <ul className="flex items-center justify-center">
        <li className="flex flex-1 justify-center">
          <Link
            scroll={true}
            href="/faq"
            className="text-xs text-neutral-400 transition-colors hover:underline"
          >
            FAQ
          </Link>
        </li>

        <li>
          <div className="h-3 w-px bg-neutral-400" />
        </li>

        <li className="flex flex-1 justify-center">
          <a
            href="https://discord.gg/FfmuN25GjE"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-400 transition-colors hover:underline"
          >
            Discord
          </a>
        </li>

        <li>
          <div className="h-3 w-[1px] bg-neutral-400" />
        </li>

        <li className="flex flex-1 justify-center">
          <a
            href="https://t.me/+oHFpt8HM6EAyODFk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-400 transition-colors hover:underline"
          >
            Telegram
          </a>
        </li>

        <li>
          <div className="h-3 w-px bg-neutral-400" />
        </li>

        <li className="flex flex-1 justify-center">
          <a
            href="https://x.com/letsragedotfun"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-400 transition-colors hover:underline"
          >
            Twitter
          </a>
        </li>
      </ul>
    </footer>
  );
}
