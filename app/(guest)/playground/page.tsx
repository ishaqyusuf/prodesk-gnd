import AutoCompleteInput from "@/components/auto-complete-input";

export default async function PlaygroundPage({}) {
  return (
    <div className="flex flex-col h-screen justify-center items-center">
      <AutoCompleteInput
        options={[
          { id: "ishaq", label: "Ishaq Yusuf" },
          { id: "danmairomo", label: "Sulaiman DanMairomo" },
          { id: "abu-haatim", label: "Abu Haatim" },
          { id: "abu-awf", label: "Abu Awf" },
          { id: "abu-nafeesah", label: "Abu Nafeesah" },
        ]}
        labelKey="label"
        valueKey="id"
      />
    </div>
  );
}
