import { ExampleTRPCPage } from "@/modules/example-trpc-page";
import { trpc } from "@/trpc/server";

async function ExampleTRPC() {
  const data = await trpc.handshake.handShakeDB();
  return (
    <ExampleTRPCPage
      data={data ? "Handshake successful" : "Handshake failed"}
    />
  );
}

export default ExampleTRPC;
