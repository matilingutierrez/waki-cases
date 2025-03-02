import { CaseCustomizer } from '@/components/case-customizer/case-customizer';

export const metadata = {
  title: 'Case Customizer | Waki Cases',
  description: 'Customize your phone case with our interactive tool',
};

export default function CaseCustomizerPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <CaseCustomizer />
    </div>
  );
} 