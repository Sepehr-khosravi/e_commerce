import {
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

type Props = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
};

export default function ShippingInfo({
  firstName,
  lastName,
  phone,
  address,
}: Props) {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">

      <h2 className="text-base font-bold text-black">
        اطلاعات تحویل
      </h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">

        <div className="rounded-2xl bg-neutral-50 p-4">

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <UserRound size={15} />
            گیرنده
          </div>

          <p className="mt-2 text-sm font-bold text-black">
            {firstName} {lastName}
          </p>

        </div>

        <div className="rounded-2xl bg-neutral-50 p-4">

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Phone size={15} />
            شماره تماس
          </div>

          <p
            dir="ltr"
            className="mt-2 text-right text-sm font-bold text-black"
          >
            {phone}
          </p>

        </div>

        <div className="rounded-2xl bg-neutral-50 p-4 sm:col-span-2">

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <MapPin size={15} />
            آدرس
          </div>

          <p className="mt-2 text-sm font-medium leading-7 text-neutral-700">
            {address}
          </p>

        </div>

      </div>

    </section>
  );
}