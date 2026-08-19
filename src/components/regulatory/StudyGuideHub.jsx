import AIStudyGuideGenerator from "./AIStudyGuideGenerator";

export default function StudyGuideHub({ exams, userEmail }) {
  return (
    <div className="space-y-6">
      <AIStudyGuideGenerator exams={exams} prepResults={[]} />
    </div>
  );
}