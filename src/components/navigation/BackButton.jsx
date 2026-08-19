import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ to, label = "Back" }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleBack}
      className="gap-2 text-slate-400 hover:text-white hover:bg-[#1a2332] -ml-2"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}