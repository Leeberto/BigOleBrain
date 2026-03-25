import dynamic from "next/dynamic";

const Explorer = dynamic(() => import("@/components/explorer"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center text-[#606070]">
      Loading...
    </div>
  ),
});

export default function Page() {
  return <Explorer />;
}
