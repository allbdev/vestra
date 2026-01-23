import { BiLeftArrow } from "react-icons/bi";
import { Button } from "./ui";
import { useRouter } from "next/navigation";

export function Title({ children, backUrl }: { children: React.ReactNode, backUrl?: string }) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <Button variant="unstyled" size="sm" onClick={() => router.push(backUrl || '/')}>
        <BiLeftArrow className="w-4 h-4" />
      </Button>
      <h1 className="text-3xl font-bold mb-2">{children}</h1>
    </div>
  );
}