import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tag, Plus, X, Hash } from "lucide-react";

export default function QuestionTagManager({ question, onUpdateTags }) {
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState(question?.tags || []);

  const addTag = () => {
    const newTag = tagInput.trim().toLowerCase();
    if (newTag && !tags.includes(newTag)) {
      const updatedTags = [...tags, newTag];
      setTags(updatedTags);
      onUpdateTags(updatedTags);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    const updatedTags = tags.filter(t => t !== tagToRemove);
    setTags(updatedTags);
    onUpdateTags(updatedTags);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          placeholder="Add custom tag..."
          className="bg-[#151d2e] border-[#2a3548] text-white"
        />
        <Button onClick={addTag} size="sm" className="bg-violet-600 hover:bg-violet-700">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <Badge key={tag} className="bg-violet-500/20 text-violet-400 gap-1">
              <Hash className="h-3 w-3" />
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-white">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}