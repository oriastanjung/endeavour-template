import { Homepage } from "@/modules/home-page";
import { trpc } from "@/trpc/server";

async function Home() {
  const data = await trpc.handshake.handShakeDB();
  return <Homepage data={data ? "Handshake successful" : "Handshake failed"} />;
}

export default Home;
