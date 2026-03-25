import dynamic from "next/dynamic";

const Browser = dynamic(() => import("@/components/browser"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center text-[#606070]">
      Loading...
    </div>
  ),
});

export default function Page() {
  return <Browser />;
}
