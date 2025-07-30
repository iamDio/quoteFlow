import { trpc } from "@web/app/trpc"

export default async function Home() {
  const { greeting } = await trpc.hello.query({ name: `tOM` })
  return <div>{greeting}</div>
}
