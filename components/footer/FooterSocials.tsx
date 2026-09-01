import {
  Send,
} from "lucide-react";

export default function FooterSocials() {
  return (
    <div>
      <h3 className="text-sm font-bold text-black">
        ما را دنبال کنید
      </h3>

      <div className="mt-5 flex items-center gap-2">
        <a
          href="#"
          aria-label="Instagram"
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-neutral-100
            text-neutral-600
            transition-all
            duration-300
            hover:-translate-y-1
            hover:bg-black
            hover:text-white
          "
        >
        </a>

        <a
          href="#"
          aria-label="Telegram"
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-neutral-100
            text-neutral-600
            transition-all
            duration-300
            hover:-translate-y-1
            hover:bg-black
            hover:text-white
          "
        >
          <Send size={17} />
        </a>

        <a
          href="#"
          aria-label="GitHub"
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-neutral-100
            text-neutral-600
            transition-all
            duration-300
            hover:-translate-y-1
            hover:bg-black
            hover:text-white
          "
        >        </a>
      </div>
    </div>
  );
}