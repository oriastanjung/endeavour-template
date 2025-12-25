import { SampleSection } from "./components/SampleSection";

function ExampleTRPCPage({ data }: { data: string }) {
  return (
    <div>
      {data}
      <div>
        <SampleSection />
      </div>
    </div>
  );
}

export { ExampleTRPCPage };
