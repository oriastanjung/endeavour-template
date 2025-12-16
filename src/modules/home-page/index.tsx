import { SampleSection } from "./components/SampleSection";

function Homepage({ data }: { data: string }) {
  return (
    <div>
      {data}
      <div>
        <SampleSection />
      </div>
    </div>
  );
}

export { Homepage };
