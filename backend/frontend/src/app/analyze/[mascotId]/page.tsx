import { redirect } from "next/navigation";
import AnalyzeClient from "./AnalyzeClient";

type Props = {
  params: Promise<{ mascotId: string }>;
};

const VALID_MASCOTS = ["scouty", "nova", "blaze", "sage", "echo"];

export async function generateStaticParams() {
  return VALID_MASCOTS.map((mascotId) => ({ mascotId }));
}

export default async function AnalyzePage({ params }: Props) {
  const { mascotId } = await params;

  if (!VALID_MASCOTS.includes(mascotId)) {
    redirect("/");
  }

  return <AnalyzeClient mascotId={mascotId} />;
}
